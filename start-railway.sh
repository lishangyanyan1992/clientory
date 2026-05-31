#!/bin/sh
set -eu

# Start the API server (run after build-railway.sh).

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# ── IPv4 pre-resolution fix ───────────────────────────────────────────────────
# pg v8.20+ changed DNS resolution to prefer AAAA (IPv6) records. Railway's
# network has no outbound IPv6 path, so every DB query fails with ENETUNREACH.
#
# --dns-result-order=ipv4first is supposed to fix this, but Railway's environment
# appears to override it (confirmed: dns.lookup still returns IPv6 even with the
# flag set). Reliable fix: resolve the DB hostname to IPv4 HERE, in the shell,
# BEFORE Node starts, then patch DATABASE_URL to use the IPv4 address directly.
# pg never does a DNS lookup at runtime — it connects straight to the IP.
#
# The node -e subprocess uses an async dns.lookup with family:4 so it always
# gets an A record. The result is captured by the shell and exported.
if [ -n "${DATABASE_URL:-}" ]; then
  PATCHED_URL=$(node -e "
    var dns = require('dns');
    var raw = process.env.DATABASE_URL;
    try {
      var url = new URL(raw);
      dns.lookup(url.hostname, { family: 4 }, function(err, addr) {
        if (!err && addr) {
          url.hostname = addr;
          process.stdout.write(url.toString());
        }
        process.exit(0);
      });
    } catch(e) {
      process.exit(0);
    }
  " 2>/dev/null) || true

  if [ -n "${PATCHED_URL:-}" ]; then
    DATABASE_URL="${PATCHED_URL}"
    export DATABASE_URL
    echo "[start-railway] DB hostname resolved to IPv4 — ENETUNREACH fix applied"
  else
    echo "[start-railway] WARNING: IPv4 pre-resolution failed, using original DATABASE_URL"
  fi
fi

exec node --dns-result-order=ipv4first "$ROOT_DIR/Clientory App/artifacts/api-server/dist/index.cjs"
