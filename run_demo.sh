#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  [[ -n "${BACK_PID:-}" ]] && kill "$BACK_PID" 2>/dev/null || true
  [[ -n "${FRONT_PID:-}" ]] && kill "$FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd "$ROOT/backend" && python3 -m uvicorn main:app --host 127.0.0.1 --port 8000) & BACK_PID=$!
(cd "$ROOT/frontend" && node serve.mjs 3000) & FRONT_PID=$!

echo "CIVICSOLVE AI backend  → http://127.0.0.1:8000"
echo "CIVICSOLVE AI frontend → http://localhost:3000"
echo "Press Ctrl+C to stop both servers."
wait
