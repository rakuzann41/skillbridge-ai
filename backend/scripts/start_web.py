"""Supervise Next.js and the private FastAPI process in one small web container."""

import os
from pathlib import Path
import signal
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[2]


def main():
    processes = []
    stopping = False

    def stop(signum=None, frame=None):
        nonlocal stopping
        stopping = True

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    try:
        processes.append(subprocess.Popen([
            sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000",
        ], cwd=ROOT / "backend"))
        processes.append(subprocess.Popen(["node", "server.js"], cwd=ROOT / "frontend",
            env={**os.environ, "HOSTNAME": "0.0.0.0", "PORT": os.environ.get("PORT", "10000")}))
        while not stopping and all(process.poll() is None for process in processes):
            time.sleep(1)
        return 0 if stopping else 1
    finally:
        for process in processes:
            if process.poll() is None:
                process.terminate()
        for process in processes:
            try:
                process.wait(timeout=15)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()


if __name__ == "__main__":
    raise SystemExit(main())
