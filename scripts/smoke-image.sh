#!/usr/bin/env bash
# Smoke-test the candidate container image with no production secrets or network.
set -euo pipefail

name="hawk-smoke-${RANDOM}-${RANDOM}"
# shellcheck disable=SC2329
cleanup() { docker rm -fv "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT

args=(
  -e APP_URL=https://learn.fixture.example.org
  -e HAWK_SUITE_TRUST_PROXY=true
  -e HAWK_SUITE_TEAM_ID=TFIXTURE
  -e HAWK_SUITE_ISSUER=https://apps.fixture.example.org/
)

docker run --rm --network none --entrypoint node "$IMAGE" scripts/deploy-check.mjs --contract >/dev/null
docker run --rm --network none "${args[@]}" --entrypoint node "$IMAGE" scripts/deploy-check.mjs >/dev/null
docker run -d --name "$name" --network none "${args[@]}" "$IMAGE" >/dev/null

for _attempt in $(seq 1 60); do
  state=$(docker inspect --format '{{.State.Status}} {{.State.Health.Status}}' "$name")
  if [[ $state == 'running healthy' ]]; then
    docker exec -e "EXPECTED_REV=${REVISION:-}" "$name" node -e '
      (async () => {
        const health = await fetch("http://127.0.0.1:3000/health").then(r => r.json());
        if (health.status !== "ok") process.exit(1);
        if (process.env.EXPECTED_REV && health.revision !== process.env.EXPECTED_REV) process.exit(1);
        for (const p of ["/"]) {
          const r = await fetch("http://127.0.0.1:3000" + p, { method: "HEAD" });
          if (!r.ok) { console.error("Missing asset:", p, r.status); process.exit(1); }
        }
      })().catch(e => { console.error(e); process.exit(1); });
    '
    exit 0
  fi
  if [[ $state == exited* || $state == dead* ]]; then break; fi
  sleep 2
done

docker logs --tail=40 "$name"
echo 'Candidate image failed readiness' >&2
exit 1
