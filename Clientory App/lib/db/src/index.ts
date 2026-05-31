import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Supabase's direct connection host (db.<ref>.supabase.co) is IPv6-ONLY — it
 * has no A record, only AAAA. Railway has no outbound IPv6 route, so every
 * connection fails with "connect ENETUNREACH <ipv6>:5432".
 *
 * Fix: transparently rewrite a direct-host DATABASE_URL to Supabase's IPv4
 * Supavisor pooler, which is reachable over IPv4:
 *   - host:     aws-1-us-east-1.pooler.supabase.com   (region/prefix verified
 *               for this project; override via SUPABASE_POOLER_HOST if it moves)
 *   - port:     5432  (session mode — behaves like a direct connection, safe
 *               for a long-lived server; override via SUPABASE_POOLER_PORT)
 *   - username: postgres  ->  postgres.<ref>   (Supavisor tenant format)
 *
 * If DATABASE_URL already points at a pooler (or any non-direct host), it is
 * left untouched. Set DATABASE_URL to the pooler string directly to bypass
 * this rewrite entirely.
 */
function resolveConnectionString(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl; // not a parseable URL — let pg surface the error
  }

  const directHost = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  if (directHost) {
    const ref = directHost[1];
    url.hostname = process.env.SUPABASE_POOLER_HOST ?? "aws-1-us-east-1.pooler.supabase.com";
    url.port = process.env.SUPABASE_POOLER_PORT ?? "5432";
    // Supavisor requires the tenant-qualified username.
    if (url.username === "postgres") url.username = `postgres.${ref}`;
  }

  // pg v8.20+ treats sslmode=require like verify-full, which rejects Supabase's
  // certificate chain. Strip it; we pass ssl: { rejectUnauthorized: false }
  // below so the connection stays TLS-encrypted without strict chain checks.
  url.searchParams.delete("sslmode");

  return url.toString();
}

const connectionString = resolveConnectionString(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

export * from "./schema";
