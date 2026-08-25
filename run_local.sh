#!/usr/bin/env bash
# Menjalankan stack lokal BKD sekaligus:
#   - parser FastAPI (backend-extract) di port 8000
#   - Next.js dev server di port 3000
# Ctrl+C sekali menghentikan keduanya.
#
# Port lain    : BE_PORT=8001 FE_PORT=3001 ./run_local.sh
# Reload parser: RELOAD=1 ./run_local.sh

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BE_DIR="$ROOT/backend-extract"
BE_PORT="${BE_PORT:-8000}"
FE_PORT="${FE_PORT:-3000}"
RELOAD="${RELOAD:-0}"

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) IS_WIN=1 ;;
  *) IS_WIN=0 ;;
esac

pids=()
cleaned=0

# Trap sinyal cuma menaikkan flag. Di MSYS, memanggil program eksternal dari
# dalam handler SIGINT membunuh shell sebelum pembersihan selesai, jadi kill
# dijalankan setelah wait balik.
on_sig() { :; }

kill_tree() {
  local pid="$1" winpid=""
  if [ "$IS_WIN" = "1" ]; then
    # PID bash (MSYS) bukan PID Windows, ambil WINPID dari ps lalu bunuh sepohon
    winpid="$(ps 2>/dev/null | awk -v p="$pid" '$1==p {print $4}' | head -1)"
    if [ -n "$winpid" ]; then
      taskkill //PID "$winpid" //T //F >/dev/null 2>&1
    fi
  fi
  kill -TERM "$pid" 2>/dev/null
  return 0
}

# Sapu proses yang masih memegang port, menangani anak yang telanjur yatim
# karena shell pembungkusnya mati lebih dulu.
kill_port() {
  local port="$1" pid rows
  if [ "$IS_WIN" = "1" ]; then
    rows="$(netstat -ano 2>/dev/null | awk -v pat=":$port\$" '$1=="TCP" && $4=="LISTENING" && $2 ~ pat {print $5}' | sort -u)"
    for pid in $rows; do
      taskkill //PID "$pid" //T //F >/dev/null 2>&1
    done
  elif command -v lsof >/dev/null 2>&1; then
    rows="$(lsof -ti "tcp:$port" 2>/dev/null)"
    for pid in $rows; do
      kill -TERM "$pid" 2>/dev/null
    done
  fi
  return 0
}

shutdown() {
  [ "$cleaned" = "1" ] && return 0
  cleaned=1
  [ "${#pids[@]}" -eq 0 ] && return 0
  echo ""
  echo "[run_local] menghentikan proses..."
  local pid
  for pid in "${pids[@]}"; do
    kill_tree "$pid"
  done
  kill_port "$BE_PORT"
  kill_port "$FE_PORT"
  return 0
}

trap on_sig INT TERM
trap shutdown EXIT

# --- python: pakai venv backend-extract kalau ada, jatuh ke python sistem ---
# Kandidat diuji dulu (stub WindowsApps "python3" lolos PATH tapi tidak jalan),
# lalu diprioritaskan yang sudah punya uvicorn + fastapi.
pick_python() {
  local cands=(
    "$BE_DIR/.venv/Scripts/python.exe" "$BE_DIR/.venv/bin/python"
    "$BE_DIR/venv/Scripts/python.exe"  "$BE_DIR/venv/bin/python"
    "$ROOT/.venv/Scripts/python.exe"   "$ROOT/.venv/bin/python"
  )
  if [ "$IS_WIN" = "1" ]; then
    cands+=(python python3 py)
  else
    cands+=(python3 python)
  fi

  local c bin first_ok=""
  for c in "${cands[@]}"; do
    if [ -x "$c" ]; then
      bin="$c"
    else
      bin="$(command -v "$c" 2>/dev/null)" || continue
    fi
    "$bin" -c "import sys" >/dev/null 2>&1 || continue
    [ -n "$first_ok" ] || first_ok="$bin"
    if "$bin" -c "import uvicorn, fastapi" >/dev/null 2>&1; then
      echo "$bin"
      return 0
    fi
  done

  if [ -n "$first_ok" ]; then
    echo "$first_ok"
    return 0
  fi
  return 1
}

PY="$(pick_python)" || {
  echo "[run_local] python tidak ditemukan di PATH." >&2
  exit 1
}

if ! "$PY" -c "import uvicorn, fastapi" >/dev/null 2>&1; then
  echo "[run_local] dependency parser belum terpasang." >&2
  echo "            jalankan: \"$PY\" -m pip install -r backend-extract/requirements.txt" >&2
  exit 1
fi

if [ ! -d "$ROOT/node_modules" ]; then
  echo "[run_local] node_modules belum ada, jalankan npm install dulu." >&2
  exit 1
fi
[ -f "$BE_DIR/.env" ] || echo "[run_local] peringatan: backend-extract/.env tidak ada, auth parser dan endpoint VLM akan gagal."
[ -f "$ROOT/.env" ]   || echo "[run_local] peringatan: .env root tidak ada, Next.js butuh DATABASE_URL dkk."

# --- parser FastAPI ---
uvicorn_args=(api:app --host 127.0.0.1 --port "$BE_PORT")
[ "$RELOAD" = "1" ] && uvicorn_args+=(--reload)

echo "[run_local] parser -> http://127.0.0.1:$BE_PORT"
( cd "$BE_DIR" && exec "$PY" -m uvicorn "${uvicorn_args[@]}" ) &
pids+=("$!")

# --- Next.js ---
echo "[run_local] next   -> http://localhost:$FE_PORT"
( cd "$ROOT" && exec npm run dev -- --port "$FE_PORT" ) &
pids+=("$!")

# berhenti begitu salah satu proses mati atau saat Ctrl+C
wait -n 2>/dev/null || wait
shutdown
