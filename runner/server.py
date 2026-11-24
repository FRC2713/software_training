"""Isolated Python execution HTTP service for hawk-learn.

Runs student Python code in a short-lived subprocess with resource limits,
wall-clock timeout, process-group cleanup, and combined output capping.
Designed to run inside a hardened Docker container on an internal-only network.
"""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
import resource
import selectors
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from typing import Any

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "4000"))
MAX_BODY_BYTES = 64 * 1024
MAX_CODE_BYTES = 32 * 1024
MAX_OUTPUT_BYTES = 32 * 1024
WALL_TIMEOUT_SECONDS = float(os.environ.get("WALL_TIMEOUT_SECONDS", "3.0"))
CPU_LIMIT_SECONDS = int(os.environ.get("CPU_LIMIT_SECONDS", "2"))
MEMORY_LIMIT_BYTES = int(os.environ.get("MEMORY_LIMIT_MB", "128")) * 1024 * 1024
MAX_CONCURRENT_RUNS = int(os.environ.get("MAX_CONCURRENT_RUNS", "6"))
MAX_MAZE_DIM = 64

RUNNER_DIR = os.path.dirname(os.path.abspath(__file__))
MAZE_DRIVER = os.path.join(RUNNER_DIR, "maze_driver.py")

_concurrency = threading.BoundedSemaphore(MAX_CONCURRENT_RUNS)


def _apply_child_limits() -> None:
    os.setsid()
    resource.setrlimit(resource.RLIMIT_CPU, (CPU_LIMIT_SECONDS, CPU_LIMIT_SECONDS))
    resource.setrlimit(resource.RLIMIT_FSIZE, (0, 0))
    if sys.platform == "linux":
        resource.setrlimit(resource.RLIMIT_AS, (MEMORY_LIMIT_BYTES, MEMORY_LIMIT_BYTES))


def _kill_process_group(pid: int) -> None:
    try:
        os.killpg(pid, signal.SIGKILL)
    except ProcessLookupError:
        pass


def _clean_traceback(stderr: str, tmpdir: str) -> str:
    return stderr.replace(tmpdir + os.sep, "")


def _validate_maze(maze: Any) -> tuple[list[list[int]], str] | None:
    if not isinstance(maze, dict):
        return None
    grid = maze.get("grid")
    mode = maze.get("mode", "wall")
    if mode not in ("wall", "astar"):
        return None
    if not isinstance(grid, list) or not grid or len(grid) > MAX_MAZE_DIM:
        return None
    cols = None
    cleaned: list[list[int]] = []
    for row in grid:
        if not isinstance(row, list) or not row or len(row) > MAX_MAZE_DIM:
            return None
        if cols is None:
            cols = len(row)
        elif len(row) != cols:
            return None
        int_row: list[int] = []
        for cell in row:
            if not isinstance(cell, int) or isinstance(cell, bool) or not (0 <= cell <= 15):
                return None
            int_row.append(cell)
        cleaned.append(int_row)
    return cleaned, mode


def execute_python(code: str, maze: tuple[list[list[int]], str] | None = None) -> dict[str, Any]:
    tmpdir = tempfile.mkdtemp(prefix="run-", dir="/tmp")
    trail_r: int | None = None
    trail_w: int | None = None
    start = time.monotonic()

    try:
        pass_fds: tuple[int, ...] = ()
        if maze is not None:
            grid, mode = maze
            solution_path = os.path.join(tmpdir, "solution.py")
            grid_path = os.path.join(tmpdir, "grid.json")
            with open(solution_path, "w", encoding="utf-8") as f:
                f.write(code)
            with open(grid_path, "w", encoding="utf-8") as f:
                json.dump(grid, f)
            trail_r, trail_w = os.pipe()
            pass_fds = (trail_w,)
            cmd = [
                sys.executable,
                "-I",
                "-B",
                MAZE_DRIVER,
                solution_path,
                grid_path,
                mode,
                str(trail_w),
            ]
        else:
            script_path = os.path.join(tmpdir, "main.py")
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(code)
            cmd = [sys.executable, "-I", "-B", script_path]

        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=tmpdir,
            env={"PYTHONUNBUFFERED": "1"},
            pass_fds=pass_fds,
            preexec_fn=_apply_child_limits,
        )

        if trail_w is not None:
            os.close(trail_w)
            trail_w = None

        stdout_buf = bytearray()
        stderr_buf = bytearray()
        trail_buf = bytearray()
        total_output = 0
        timed_out = False
        truncated = False

        sel = selectors.DefaultSelector()
        assert proc.stdout is not None and proc.stderr is not None
        os.set_blocking(proc.stdout.fileno(), False)
        os.set_blocking(proc.stderr.fileno(), False)
        sel.register(proc.stdout, selectors.EVENT_READ, "stdout")
        sel.register(proc.stderr, selectors.EVENT_READ, "stderr")
        if trail_r is not None:
            os.set_blocking(trail_r, False)
            sel.register(trail_r, selectors.EVENT_READ, "trail")

        deadline = start + WALL_TIMEOUT_SECONDS
        try:
            while sel.get_map():
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    timed_out = True
                    _kill_process_group(proc.pid)
                    break

                events = sel.select(timeout=min(remaining, 0.1))
                for key, _ in events:
                    tag = key.data
                    fd = key.fd
                    try:
                        chunk = os.read(fd, 4096)
                    except BlockingIOError:
                        continue
                    if not chunk:
                        sel.unregister(key.fileobj)
                        continue
                    if tag == "trail":
                        if len(trail_buf) < 256 * 1024:
                            trail_buf.extend(chunk)
                        continue
                    target = stdout_buf if tag == "stdout" else stderr_buf
                    allowed = MAX_OUTPUT_BYTES - total_output
                    if allowed > 0:
                        target.extend(chunk[:allowed])
                        total_output += min(len(chunk), allowed)
                    if len(chunk) > allowed:
                        truncated = True
                        _kill_process_group(proc.pid)
                        sel.unregister(key.fileobj)
                        break
                if truncated:
                    break
        finally:
            sel.close()
            proc.stdout.close()
            proc.stderr.close()

        try:
            exit_code = proc.wait(timeout=0.5)
        except subprocess.TimeoutExpired:
            _kill_process_group(proc.pid)
            exit_code = proc.wait(timeout=1.0)

        if exit_code == -signal.SIGXCPU:
            timed_out = True

        duration_ms = int((time.monotonic() - start) * 1000)
        stdout_text = stdout_buf.decode("utf-8", errors="replace")
        stderr_text = _clean_traceback(stderr_buf.decode("utf-8", errors="replace"), tmpdir)

        trail: list[list[int]] | None = None
        if maze is not None and trail_buf and exit_code == 0 and not timed_out and not truncated:
            try:
                parsed = json.loads(trail_buf.decode("utf-8"))
                if isinstance(parsed, list):
                    trail = parsed
            except (UnicodeDecodeError, json.JSONDecodeError):
                trail = None

        ok = exit_code == 0 and not timed_out and not truncated
        result: dict[str, Any] = {
            "ok": ok,
            "stdout": stdout_text,
            "stderr": stderr_text,
            "exitCode": exit_code,
            "timedOut": timed_out,
            "truncated": truncated,
            "durationMs": duration_ms,
        }
        if maze is not None:
            result["trail"] = trail
        return result
    finally:
        if trail_r is not None:
            try:
                os.close(trail_r)
            except OSError:
                pass
        if trail_w is not None:
            try:
                os.close(trail_w)
            except OSError:
                pass
        shutil.rmtree(tmpdir, ignore_errors=True)


class RunnerHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args: object) -> None:
        # Keep container logs quiet for routine health checks and runs.
        return

    def _send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_HEAD(self) -> None:
        if self.path == "/health":
            self._send_json(200, {"status": "ok"})
            return
        self._send_json(404, {"error": "Not found"})

    def do_GET(self) -> None:
        if self.path == "/health":
            self._send_json(200, {"status": "ok"})
            return
        self._send_json(404, {"error": "Not found"})

    def do_POST(self) -> None:
        if self.path != "/execute":
            self._send_json(404, {"error": "Not found"})
            return

        length_header = self.headers.get("Content-Length")
        if length_header is None:
            self._send_json(411, {"error": "Content-Length required"})
            return
        try:
            length = int(length_header)
        except ValueError:
            self._send_json(400, {"error": "Invalid Content-Length"})
            return
        if length < 0 or length > MAX_BODY_BYTES:
            self._send_json(413, {"error": "Request body too large"})
            return

        raw = self.rfile.read(length)
        try:
            body = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {"error": "Invalid JSON"})
            return

        if not isinstance(body, dict) or not isinstance(body.get("code"), str):
            self._send_json(400, {"error": "Field `code` (string) is required"})
            return

        code = body["code"]
        if len(code.encode("utf-8")) > MAX_CODE_BYTES:
            self._send_json(413, {"error": "Code exceeds 32 KB limit"})
            return

        maze_spec = None
        if "maze" in body and body["maze"] is not None:
            maze_spec = _validate_maze(body["maze"])
            if maze_spec is None:
                self._send_json(400, {"error": "Invalid maze specification"})
                return

        if not _concurrency.acquire(blocking=True, timeout=5.0):
            self._send_json(429, {"error": "Runner busy"})
            return

        try:
            outcome = execute_python(code, maze_spec)
        finally:
            _concurrency.release()

        self._send_json(200, outcome)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), RunnerHandler)
    server.daemon_threads = True

    def _shutdown(_signum: int, _frame: object) -> None:
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, _shutdown)
    signal.signal(signal.SIGINT, _shutdown)
    print(f"hawk-learn-runner listening on http://{HOST}:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
