/**
 * Langfuse AI observability singleton.
 *
 * Usage pattern — call getLangfuse() once at the top of a request/job,
 * create a trace, then store it in traceContext so nested async helpers
 * (e.g. getSymptomQuery, queryOpenAI) can attach their own generations
 * without needing the trace threaded through every function signature.
 *
 * Gracefully degrades to a no-op when LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY
 * are not set (e.g. local dev, unit tests).
 */

import { AsyncLocalStorage } from "node:async_hooks";
import Langfuse from "langfuse";

// ── Types ─────────────────────────────────────────────────────────────────────

type LangfuseInstance = InstanceType<typeof Langfuse>;
export type LangfuseTrace = ReturnType<LangfuseInstance["trace"]>;
export type LangfuseGeneration = ReturnType<LangfuseTrace["generation"]>;

// ── AsyncLocalStorage ─────────────────────────────────────────────────────────
// Allows any async function running inside `traceContext.run(trace, fn)` to
// retrieve the current scan's trace with traceContext.getStore() — no
// signature changes required in the call chain.
export const traceContext = new AsyncLocalStorage<LangfuseTrace | undefined>();

// ── Singleton client ──────────────────────────────────────────────────────────

let _client: LangfuseInstance | null = null;

export function getLangfuse(): LangfuseInstance | null {
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    return null;
  }
  if (!_client) {
    _client = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_BASEURL ?? "https://cloud.langfuse.com",
      // Batch up to 15 events; flush every 10 s — keeps network overhead low.
      flushAt: 15,
      flushInterval: 10_000,
      // Don't let Langfuse errors propagate to the caller.
      fetchRetryCount: 2,
      fetchRetryDelay: 2_000,
    });
  }
  return _client;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Get the Langfuse trace stored in the current async context, or undefined.
 * Convenient shorthand for traceContext.getStore().
 */
export function getCurrentTrace(): LangfuseTrace | undefined {
  return traceContext.getStore();
}
