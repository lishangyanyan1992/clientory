#!/bin/sh
set -eu

NODE_BIN=$(node -p 'process.execPath')

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
APP_DIR="$ROOT_DIR/Clientory App/artifacts/clientory"

cd "$APP_DIR"
PORT="${PORT:-3000}" BASE_PATH=/ "$NODE_BIN" node_modules/vite/bin/vite.js build --config vite.config.ts
