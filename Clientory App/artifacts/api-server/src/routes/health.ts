import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// DB connectivity probe — runs a trivial query and returns ok/error.
// Useful for smoke-testing the database connection after deploys.
router.get("/healthz/db", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    res.status(503).json({
      status: "error",
      db: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
