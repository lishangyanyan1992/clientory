#!/bin/sh
set -eu

NODE_BIN=$(node -p 'process.execPath')
NODE_DIR=$(CDPATH= cd -- "$(dirname -- "$NODE_BIN")" && pwd)

if command -v corepack >/dev/null 2>&1; then
  COREPACK_BIN=$(command -v corepack)
else
  COREPACK_BIN="$NODE_DIR/corepack"
fi

PNPM_VERSION=$("$COREPACK_BIN" pnpm --version)

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

cd "$ROOT_DIR/Clientory App"
npm_config_user_agent="pnpm/$PNPM_VERSION" "$COREPACK_BIN" pnpm install
