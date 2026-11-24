"""Unit and sandbox-limit tests for the Python execution runner."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from http.server import ThreadingHTTPServer
import json
import sys
import threading
import unittest
import urllib.error
import urllib.request

from runner.server import RunnerHandler, execute_python


class ExecutePythonTests(unittest.TestCase):
    def test_basic_stdout(self) -> None:
        res = execute_python('print("hello", 2 + 2)\n')
        self.assertTrue(res["ok"])
        self.assertEqual(res["stdout"], "hello 4\n")
        self.assertEqual(res["stderr"], "")
        self.assertEqual(res["exitCode"], 0)
        self.assertFalse(res["timedOut"])
        self.assertFalse(res["truncated"])

    def test_syntax_error_reports_clean_filename_and_line(self) -> None:
        res = execute_python("x = 1\ny = (\n")
        self.assertFalse(res["ok"])
        self.assertIn('File "main.py", line 2', res["stderr"])
        self.assertNotIn("/tmp/run-", res["stderr"])

    def test_runtime_error_reports_exact_line(self) -> None:
        res = execute_python("a = 10\nb = 0\nprint(a / b)\n")
        self.assertFalse(res["ok"])
        self.assertIn('File "main.py", line 3', res["stderr"])
        self.assertIn("ZeroDivisionError", res["stderr"])

    def test_infinite_loop_times_out(self) -> None:
        res = execute_python("while True:\n    pass\n")
        self.assertFalse(res["ok"])
        self.assertTrue(res["timedOut"])

    def test_sleep_hits_wall_timeout(self) -> None:
        res = execute_python("import time\ntime.sleep(10)\n")
        self.assertFalse(res["ok"])
        self.assertTrue(res["timedOut"])

    def test_output_flood_truncates_and_kills(self) -> None:
        res = execute_python('while True:\n    print("x" * 1000)\n')
        self.assertFalse(res["ok"])
        self.assertTrue(res["truncated"])
        self.assertLessEqual(len(res["stdout"].encode("utf-8")), 32 * 1024)

    def test_disk_write_blocked_by_fsize_limit(self) -> None:
        res = execute_python('with open("evil.txt", "w") as f:\n    f.write("data")\n')
        self.assertFalse(res["ok"])

    @unittest.skipUnless(sys.platform == "linux", "RLIMIT_AS enforced on Linux")
    def test_memory_bomb_blocked(self) -> None:
        res = execute_python("x = bytearray(200_000_000)\n")
        self.assertFalse(res["ok"])

    def test_maze_wall_follower_and_stdout_separation(self) -> None:
        # 2x2 maze:
        # (0,0) open RIGHT(4) -> (0,1) open LEFT(8)|DOWN(2) -> (1,1) open UP(1)
        # (1,0) closed (0)
        grid = [
            [4, 8 | 2],
            [0, 1],
        ]
        code = (
            "def solve(robot):\n"
            '    print("starting")\n'
            "    robot.drive(Direction.UP)     # wall: no-op\n"
            "    robot.drive(Direction.RIGHT)\n"
            "    robot.drive(Direction.DOWN)\n"
            '    print("at goal:", robot.at_goal())\n'
        )
        res = execute_python(code, maze=(grid, "wall"))
        self.assertTrue(res["ok"], res["stderr"])
        self.assertEqual(res["stdout"], "starting\nat goal: True\n")
        # Trail is [x, y] = [col, row]
        self.assertEqual(res["trail"], [[0, 0], [1, 0], [1, 1]])

    def test_maze_astar_receives_maze_and_robot(self) -> None:
        grid = [
            [4, 8 | 2],
            [0, 1],
        ]
        code = (
            "def solve(maze, robot):\n"
            "    assert maze.rows == 2 and maze.cols == 2\n"
            "    assert not maze.cell_at(0, 0).wall(Direction.RIGHT)\n"
            "    assert maze.cell_at(0, 0).wall(Direction.DOWN)\n"
            "    robot.drive(Direction.RIGHT)\n"
            "    robot.drive(Direction.DOWN)\n"
        )
        res = execute_python(code, maze=(grid, "astar"))
        self.assertTrue(res["ok"], res["stderr"])
        self.assertEqual(res["trail"], [[0, 0], [1, 0], [1, 1]])

    def test_maze_error_reports_solution_line(self) -> None:
        grid = [[4, 8]]
        code = "def solve(robot):\n    x = 1 / 0\n"
        res = execute_python(code, maze=(grid, "wall"))
        self.assertFalse(res["ok"])
        self.assertIn('File "solution.py", line 2', res["stderr"])
        self.assertIsNone(res["trail"])


class RunnerHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), RunnerHandler)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()

    def _post(self, path: str, payload: dict) -> tuple[int, dict]:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"http://127.0.0.1:{self.port}{path}",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as err:
            with err:
                return err.code, json.loads(err.read().decode("utf-8"))

    def test_health(self) -> None:
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}/health", timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(json.loads(resp.read().decode("utf-8")), {"status": "ok"})

    def test_rejects_oversized_code(self) -> None:
        status, body = self._post("/execute", {"code": "a" * (33 * 1024)})
        self.assertEqual(status, 413)
        self.assertIn("error", body)

    def test_rejects_invalid_maze_grid(self) -> None:
        status, _ = self._post("/execute", {"code": "pass", "maze": {"grid": [[1, 2], [3]], "mode": "wall"}})
        self.assertEqual(status, 400)

    def test_concurrent_burst(self) -> None:
        def run_one(i: int) -> tuple[int, dict]:
            return self._post("/execute", {"code": f"print({i} * 2)\n"})

        with ThreadPoolExecutor(max_workers=15) as pool:
            results = list(pool.map(run_one, range(15)))

        for i, (status, body) in enumerate(results):
            self.assertEqual(status, 200)
            self.assertTrue(body["ok"])
            self.assertEqual(body["stdout"], f"{i * 2}\n")


if __name__ == "__main__":
    unittest.main()
