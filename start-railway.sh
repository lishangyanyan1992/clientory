#!/bin/sh
set -eu

# Start the API server (run after build-railway.sh).

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec node "$ROOT_DIR/Clientory App/artifacts/api-server/dist/index.cjs"
