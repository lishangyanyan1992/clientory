// ⚠️ Must be the very first import — initialises Sentry + OTel before any
//    other module (including app.ts) loads. See instrumentation.ts for details.
import "./instrumentation";

import * as Sentry from "@sentry/node";
import app from "./app";

// ── Structured process log helper ────────────────────────────────────────────
// Keeps process-level events in the same JSON format as the HTTP + business logs.
function logProcess(level: "info" | "warn" | "error", event: string, extra: Record<string, unknown> = {}) {
  process.stdout.write(
    JSON.stringify({ level, type: "process", event, ...extra, ts: new Date().toISOString() }) + "\n",
  );
}

// ── Process-level crash handlers ─────────────────────────────────────────────
// Express routes have their own try/catch, but code running outside a request
// context (timers, event emitter callbacks, dynamic imports) can throw without
// being caught. These handlers are the last line of defence.

process.on("uncaughtException", (err: Error) => {
  logProcess("error", "uncaught_exception", { error: err.message, stack: err.stack });
  Sentry.captureException(err);
  // Allow Sentry to flush before exiting — short timeout so we don't hang.
  setTimeout(() => process.exit(1), 2000);
});

process.on("unhandledRejection", (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack   = reason instanceof Error ? reason.stack  : undefined;
  logProcess("error", "unhandled_rejection", { reason: message, ...(stack ? { stack } : {}) });
  Sentry.captureException(reason instanceof Error ? reason : new Error(message));
  // unhandledRejection is non-fatal by default — log + report but keep running.
});

// ── Port validation ───────────────────────────────────────────────────────────
const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// ── Start server ─────────────────────────────────────────────────────────────
const server = app.listen(port, () => {
  logProcess("info", "server_started", {
    port,
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    missingEnvVars: [
      !process.env.DATABASE_URL    && "DATABASE_URL",
      !process.env.EMAIL_TOKEN_SECRET && "EMAIL_TOKEN_SECRET",
      !process.env.RESEND_API_KEY  && "RESEND_API_KEY",
    ].filter(Boolean),
  });
});

// ── Graceful shutdown (SIGTERM) ───────────────────────────────────────────────
// Railway sends SIGTERM when deploying a new version or scaling down.
// Without this handler, in-flight requests (including long-running scans) are
// killed immediately, leaving scan rows stuck in "scanning" status forever.
// server.close() stops accepting new connections and waits for open ones to finish.
// The 30-second hard kill ensures we don't hang Railway's deploy pipeline.
process.on("SIGTERM", () => {
  logProcess("info", "shutdown_started", { signal: "SIGTERM" });

  const hardKill = setTimeout(() => {
    logProcess("warn", "shutdown_timeout", { reason: "forced exit after 30 s — some requests may have been cut short" });
    process.exit(0);
  }, 30_000);

  // Don't let this timer keep the event loop alive.
  hardKill.unref();

  server.close(() => {
    logProcess("info", "shutdown_complete");
    process.exit(0);
  });
});
