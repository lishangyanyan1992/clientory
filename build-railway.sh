#!/bin/sh
set -eu

# Build the API server for Railway deployment.
# Prerequisites: pnpm workspace already installed (install-vercel.sh handles that).

NODE_BIN=$(node -p 'process.execPath')
ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
API_DIR="$ROOT_DIR/Clientory App/artifacts/api-server"

cd "$API_DIR"
"$API_DIR/node_modules/.bin/tsx" ./build.ts
