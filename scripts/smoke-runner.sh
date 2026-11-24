#!/usr/bin/env bash
# Smoke-test the candidate hawk-learn-runner container image under hardened
# sandbox flags with no network access.
set -euo pipefail

name="hawk-runner-smoke-${RANDOM}-${RANDOM}"
# shellcheck disable=SC2329
cleanup() { docker rm -fv "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d \
  --name "$name" \
  --network none \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,nodev,size=32m \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --pids-limit 64 \
  --memory 256m \
  "$IMAGE" >/dev/null

for _attempt in $(seq 1 30); do
  state=$(docker inspect --format '{{.State.Status}} {{.State.Health.Status}}' "$name")
  if [[ $state == 'running healthy' ]]; then
    docker exec "$name" python3 -c '
import json, urllib.request

def post(payload):
    req = urllib.request.Request(
        "http://127.0.0.1:4000/execute",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        assert resp.status == 200
        return json.loads(resp.read().decode("utf-8"))

r = post({"code": "print(6 * 7)"})
assert r["ok"] and r["stdout"] == "42\n", r

r = post({"code": "x = bytearray(200_000_000)"})
assert not r["ok"], r

r = post({"code": "with open(\"/tmp/evil\", \"w\") as f:\n    f.write(\"x\")\n"})
assert not r["ok"], r

r = post({"code": "import urllib.request; urllib.request.urlopen(\"https://example.com\", timeout=2)"})
assert not r["ok"], r

r = post({
    "code": "def solve(robot):\n    robot.drive(Direction.RIGHT)\n",
    "maze": {"grid": [[4, 8]], "mode": "wall"},
})
assert r["ok"] and r["trail"] == [[0, 0], [1, 0]], r
'
    exit 0
  fi
  if [[ $state == exited* || $state == dead* ]]; then break; fi
  sleep 1
done

docker logs --tail=40 "$name"
echo 'Candidate runner image failed readiness' >&2
exit 1
