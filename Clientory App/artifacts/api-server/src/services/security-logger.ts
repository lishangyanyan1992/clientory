import * as Sentry from "@sentry/node";
import { createHash } from "crypto";

export type SecurityEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGIN_BLOCKED_RATE_LIMIT"
  | "OTP_SENT"
  | "OTP_BLOCKED_RATE_LIMIT"
  | "OTP_INVALID"
  | "TOKEN_INVALID"
  | "TOKEN_REVOKED"
  | "LOGOUT"
  | "PASSWORD_SUBMIT_FAILED";

type Severity = "info" | "warn" | "critical";

const SEVERITY: Record<SecurityEvent, Severity> = {
  LOGIN_SUCCESS:            "info",
  LOGIN_FAILED:             "warn",
  LOGIN_BLOCKED_RATE_LIMIT: "critical",
  OTP_SENT:                 "info",
  OTP_BLOCKED_RATE_LIMIT:   "critical",
  OTP_INVALID:              "warn",
  TOKEN_INVALID:            "warn",
  TOKEN_REVOKED:            "warn",
  LOGOUT:                   "info",
  PASSWORD_SUBMIT_FAILED:   "warn",
};

// One-way hash so logs are searchable without exposing PII.
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***.***";
  return `${local[0]}***@${domain}`;
}

function hashIpForLog(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 12);
}

export interface SecurityLogContext {
  ip?: string;
  email?: string;
  reason?: string;
}

export function logSecurityEvent(
  event: SecurityEvent,
  ctx: SecurityLogContext = {},
): void {
  const severity = SEVERITY[event];

  const entry = {
    level: severity,
    type: "security",
    event,
    ...(ctx.email ? { email: maskEmail(ctx.email) } : {}),
    ...(ctx.ip ? { ipHash: hashIpForLog(ctx.ip) } : {}),
    ...(ctx.reason ? { reason: ctx.reason } : {}),
    ts: new Date().toISOString(),
  };

  // Structured JSON → Railway log viewer can filter/search by field.
  console.log(JSON.stringify(entry));

  // Critical events go to Sentry so you get alerted immediately.
  if (severity === "critical") {
    Sentry.captureMessage(`Security: ${event}`, {
      level: "warning",
      extra: entry,
    });
  }
}
