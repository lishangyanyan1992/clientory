#!/bin/sh
set -eu

NODE_BIN=$(node -p 'process.execPath')
NODE_DIR=$(CDPATH= cd -- "$(dirname -- "$NODE_BIN")" && pwd)

if command -v npm >/dev/null 2>&1; then
  NPM_BIN=$(command -v npm)
else
  NPM_BIN="$NODE_DIR/npm"
fi

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WEBSITE_DIR="$ROOT_DIR/Clientory Website"
APP_DIR="$ROOT_DIR/Clientory App/artifacts/clientory"

cd "$WEBSITE_DIR"
"$NPM_BIN" run build

cd "$APP_DIR"
PORT="${PORT:-3000}" BASE_PATH=/app/ "$NODE_BIN" node_modules/vite/bin/vite.js build --config vite.config.ts

rm -rf "$WEBSITE_DIR/dist/app"
mkdir -p "$WEBSITE_DIR/dist/app"
cp -R "$APP_DIR/dist/public/." "$WEBSITE_DIR/dist/app/"
