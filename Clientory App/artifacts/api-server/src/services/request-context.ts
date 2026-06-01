/**
 * Request-scoped context using AsyncLocalStorage.
 *
 * Carries a unique requestId through the entire async call chain for a single
 * HTTP request — middleware, route handlers, service calls — without threading
 * it through every function signature.
 *
 * Usage:
 *   - app.ts sets the context via runWithRequestContext() in a middleware.
 *   - Any logger can call getRequestId() and get the ID automatically.
 */

import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

interface RequestContext {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Wraps `next()` so all downstream async work in this request runs inside
 * the AsyncLocalStorage context. Call this once per request in a middleware.
 */
export function runWithRequestContext(next: () => void): void {
  storage.run({ requestId: randomUUID() }, next);
}

/**
 * Returns the requestId for the currently executing request, or undefined
 * if called outside of a request context (e.g. background timers).
 */
export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
