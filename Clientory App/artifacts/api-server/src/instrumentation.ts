/**
 * Observability bootstrapper — Sentry + Langfuse/OpenTelemetry.
 *
 * THIS FILE MUST BE THE FIRST IMPORT in src/index.ts.
 *
 * Why: In ESM all static import statements are hoisted and executed before the
 * importing module's own body runs. By putting Sentry.init() and the OTel SDK
 * here, we guarantee both SDKs are fully initialised before app.ts loads —
 * which matters because app.ts calls Sentry.setupExpressErrorHandler() at
 * module level.
 *
 * Required env vars (set in Railway + .env.local for dev):
 *   SENTRY_DSN            – https://…@….ingest.sentry.io/…
 *   LANGFUSE_PUBLIC_KEY   – pk-lf-…
 *   LANGFUSE_SECRET_KEY   – sk-lf-…
 *   LANGFUSE_BASE_URL     – https://us.cloud.langfuse.com  (or EU / self-hosted)
 */

import dns from "dns";
import * as Sentry from "@sentry/node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

// ── IPv4-first DNS ────────────────────────────────────────────────────────────
// pg v8.20+ changed sslmode=require semantics AND Node's newer DNS resolver
// can return IPv6 (AAAA) records before IPv4 (A) records. Railway's network
// has no outbound IPv6 path, causing "connect ENETUNREACH <ipv6>:5432".
// Force IPv4 preference for ALL DNS lookups in this process so pg always
// gets an IPv4 address for the database host.
dns.setDefaultResultOrder("ipv4first");

// ── Sentry ────────────────────────────────────────────────────────────────────
// Must run before app.ts is imported so that setupExpressErrorHandler() sees an
// initialised SDK.
Sentry.init({
  dsn: process.env["SENTRY_DSN"],
  environment: process.env["NODE_ENV"] ?? "production",
  tracesSampleRate: 1.0,
  sendDefaultPii: false,
});
console.log("[Sentry] Initialised (DSN:", process.env["SENTRY_DSN"] ? "set" : "not set", ")");

// ── Langfuse / OpenTelemetry ──────────────────────────────────────────────────

if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
  const sdk = new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()],
  });
  sdk.start();
  console.log("[Langfuse] OTel SDK started — traces will be sent to Langfuse.");
} else {
  console.log("[Langfuse] Keys not configured — tracing disabled.");
}
