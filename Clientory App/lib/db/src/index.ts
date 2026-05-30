import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// pg v8.20+ changed sslmode=require to behave like sslmode=verify-full,
// which rejects Supabase's certificate chain (SELF_SIGNED_CERT_IN_CHAIN).
// Fix: strip the sslmode query param from the URL so pg does not apply strict
// verification, then pass ssl: { rejectUnauthorized: false } explicitly.
// The connection is still TLS-encrypted — we are only skipping chain
// verification, which matches the pre-8.20 behaviour of sslmode=require.
const connectionString = process.env.DATABASE_URL
  .replace(/([?&])sslmode=[^&]*/g, "$1")  // strip sslmode=...
  .replace(/[?&]$/, "");                   // clean up trailing ? or &

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

export * from "./schema";
