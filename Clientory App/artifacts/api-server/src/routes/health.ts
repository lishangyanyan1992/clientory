import { Router, type IRouter } from "express";
import dns from "dns";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// DB connectivity probe — returns connection status + diagnostics.
router.get("/healthz/db", async (_req, res) => {
  // Resolve the DB hostname to see what IP Railway is actually using
  const dbUrl = process.env.DATABASE_URL ?? "";
  const dbHost = (() => { try { return new URL(dbUrl).hostname; } catch { return "parse-error"; } })();
  const maskedUrl = dbUrl.replace(/:\/\/[^@]+@/, "://***@");

  const resolvedIp: string = await new Promise(resolve => {
    dns.lookup(dbHost, (err, addr) => resolve(err ? `lookup-error: ${err.message}` : addr));
  });

  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "ok", host: dbHost, resolvedIp, maskedUrl });
  } catch (err) {
    res.status(503).json({
      status: "error",
      db: "error",
      message: err instanceof Error ? err.message : String(err),
      host: dbHost,
      resolvedIp,
      maskedUrl,
    });
  }
});

export default router;
