#!/bin/sh
set -eu

# Start the API server (run after build-railway.sh).

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# --dns-result-order=ipv4first: pg v8.20 changed DNS resolution order so Node
# may now prefer IPv6 (AAAA) records. Railway's network has no outbound IPv6
# path, causing ENETUNREACH on the database connection. This flag forces IPv4
# DNS results globally, before any JS module runs.
exec node --dns-result-order=ipv4first "$ROOT_DIR/Clientory App/artifacts/api-server/dist/index.cjs"
