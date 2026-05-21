#!/bin/sh
# Install workspace dependencies for Railway deployment.
# Bypasses corepack (no packageManager field in package.json).
# Railway sets CI=true, so the preinstall guard exits early — pnpm is fine.
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT_DIR/Clientory App"
pnpm install --frozen-lockfile
