type SanitizablePostHogEvent = {
  properties?: Record<string, unknown>;
  $set?: Record<string, unknown>;
  $set_once?: Record<string, unknown>;
};

const PUBLIC_REPORT_TOKEN_PATTERN =
  /((?:https?:\/\/app\.clientory\.org)?\/report\/)[^/?#\s]+/gi;

function redactPublicReportTokens(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(PUBLIC_REPORT_TOKEN_PATTERN, "$1:token");
  }

  if (Array.isArray(value)) {
    return value.map(redactPublicReportTokens);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        redactPublicReportTokens(nestedValue),
      ]),
    );
  }

  return value;
}

export function sanitizePostHogEvent<T extends SanitizablePostHogEvent>(event: T): T {
  if (event.properties) {
    event.properties = redactPublicReportTokens(event.properties) as Record<string, unknown>;
  }
  if (event.$set) {
    event.$set = redactPublicReportTokens(event.$set) as Record<string, unknown>;
  }
  if (event.$set_once) {
    event.$set_once = redactPublicReportTokens(event.$set_once) as Record<string, unknown>;
  }

  return event;
}
