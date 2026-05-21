import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase session/transaction poolers use an intermediate CA that Node.js
  // can't verify. Disable strict cert checking when DATABASE_NO_SSL_VERIFY=1.
  ...(process.env.DATABASE_NO_SSL_VERIFY === "1"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
