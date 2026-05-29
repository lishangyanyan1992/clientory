import * as Sentry from "@sentry/node";

export type BusinessEvent =
  | "scan_started"
  | "scan_completed"
  | "scan_failed"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_canceled"
  | "payment_failed"
  | "slow_query";

type Severity = "info" | "warn" | "error";

const SEVERITY: Record<BusinessEvent, Severity> = {
  scan_started:         "info",
  scan_completed:       "info",
  scan_failed:          "error",
  subscription_created: "info",
  subscription_updated: "info",
  subscription_canceled:"warn",
  payment_failed:       "error",
  slow_query:           "warn",
};

// Events that are also sent to Sentry so you get alerted, not just logged.
const SENTRY_EVENTS = new Set<BusinessEvent>([
  "scan_failed",
  "payment_failed",
  "slow_query",
]);

export interface BusinessLogContext {
  scanId?: number;
  userId?: number;
  businessId?: number;
  score?: number;
  durationMs?: number;
  promptCount?: number;
  totalMentions?: number;
  totalChecks?: number;
  reason?: string;
  plan?: string;
  status?: string;
  label?: string;
  stripeSubscriptionId?: string;
  [key: string]: unknown;
}

export function logBusinessEvent(
  event: BusinessEvent,
  ctx: BusinessLogContext = {},
): void {
  const severity = SEVERITY[event];

  const entry = {
    level: severity,
    type: "business",
    event,
    ...ctx,
    ts: new Date().toISOString(),
  };

  // Structured JSON → Railway log viewer + future Better Stack drain.
  process.stdout.write(JSON.stringify(entry) + "\n");

  // Alert-worthy events go to Sentry immediately.
  if (SENTRY_EVENTS.has(event)) {
    Sentry.captureMessage(`Business: ${event}`, {
      level: severity === "error" ? "error" : "warning",
      extra: entry,
    });
  }
}

/**
 * Wraps any async DB (or external) call and logs a warning + Sentry alert
 * if it exceeds `thresholdMs` (default 500 ms). Use for queries that touch
 * large tables or have N+1 risk.
 *
 * @example
 * const results = await timedQuery("scan_results_fetch", () =>
 *   db.select().from(scanResultsTable).where(eq(...))
 * );
 */
export async function timedQuery<T>(
  label: string,
  fn: () => Promise<T>,
  thresholdMs = 500,
): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const durationMs = Date.now() - start;
  if (durationMs > thresholdMs) {
    logBusinessEvent("slow_query", { label, durationMs });
  }
  return result;
}
