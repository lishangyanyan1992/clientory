/**
 * Langfuse / OpenTelemetry bootstrapper.
 *
 * THIS FILE MUST BE THE FIRST IMPORT in src/index.ts.
 * The NodeSDK must be started before any LLM clients are instantiated so
 * that the span processor can patch them. Importing this file later causes
 * trace data to be silently dropped.
 *
 * Required env vars (set in Railway + .env.local for dev):
 *   LANGFUSE_PUBLIC_KEY   – pk-lf-…
 *   LANGFUSE_SECRET_KEY   – sk-lf-…
 *   LANGFUSE_BASE_URL     – https://us.cloud.langfuse.com  (or EU / self-hosted)
 *
 * When these vars are absent the SDK is not started and the app runs normally
 * with no observability overhead.
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
  const sdk = new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()],
  });
  sdk.start();
  console.log("[Langfuse] OTel SDK started — traces will be sent to Langfuse.");
} else {
  console.log("[Langfuse] Keys not configured — tracing disabled.");
}
