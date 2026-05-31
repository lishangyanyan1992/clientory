#!/bin/sh
set -eu

# Start the API server (run after build-railway.sh).

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# --dns-result-order=ipv4first: prefer IPv4 (A) records over IPv6 (AAAA).
# Required because DATABASE_URL must point at Supabase's IPv4 pooler
# (aws-0-<region>.pooler.supabase.com) — Railway has no outbound IPv6, so the
# direct db.<ref>.supabase.co host (IPv6-only) is unreachable.
exec node --dns-result-order=ipv4first "$ROOT_DIR/Clientory App/artifacts/api-server/dist/index.cjs"
