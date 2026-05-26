function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

function normalizeBasePath(value: string | undefined): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function getDerivedAppOrigin(): string | null {
  const candidates = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.REPLIT_DEV_DOMAIN,
    process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.repl.co` : undefined,
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.trim()) {
      return normalizeBaseUrl(candidate);
    }
  }

  return null;
}

export function getAppBaseUrl(): string {
  const explicitBaseUrl = process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL;
  if (explicitBaseUrl) {
    return normalizeBaseUrl(explicitBaseUrl);
  }

  const derivedOrigin = getDerivedAppOrigin();
  if (derivedOrigin) {
    return `${derivedOrigin}${normalizeBasePath(process.env.APP_BASE_PATH)}`;
  }

  throw new Error(
    "APP_BASE_URL or PUBLIC_APP_URL must be set when the public app URL cannot be inferred from the deployment environment.",
  );
}

export function getAppUrl(pathname: string): string {
  const normalizedPathname = pathname.replace(/^\/+/, "");
  return new URL(normalizedPathname, `${getAppBaseUrl()}/`).toString();
}
