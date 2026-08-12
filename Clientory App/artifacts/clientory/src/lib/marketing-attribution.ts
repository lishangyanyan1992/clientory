import { CLIENTORY_APP_URL } from "@/lib/app-url";

const STORAGE_KEY = "clientory_marketing_attribution_v1";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
  "li_fat_id",
] as const;

type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type MarketingAttribution = Partial<Record<AttributionKey, string>>;

type StoredAttribution = {
  attribution: MarketingAttribution;
  landingPath: string;
};

function readAttribution(search: string): MarketingAttribution {
  const searchParams = new URLSearchParams(search);
  return Object.fromEntries(
    ATTRIBUTION_KEYS.flatMap((key) => {
      const value = searchParams.get(key)?.trim();
      return value ? [[key, value]] : [];
    }),
  );
}

function readStoredAttribution(): StoredAttribution | null {
  try {
    const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
    return rawValue ? (JSON.parse(rawValue) as StoredAttribution) : null;
  } catch {
    return null;
  }
}

/**
 * Retain ad and campaign parameters while a visitor browses between marketing
 * pages. sessionStorage keeps the data scoped to the current browsing session.
 */
export function rememberMarketingAttribution(search: string, landingPath: string) {
  const attribution = readAttribution(search);
  if (Object.keys(attribution).length === 0) return;

  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ attribution, landingPath } satisfies StoredAttribution),
    );
  } catch {
    // Analytics must never interfere with navigation when storage is blocked.
  }
}

export function getMarketingAttribution(): StoredAttribution {
  const currentAttribution = readAttribution(window.location.search);
  if (Object.keys(currentAttribution).length > 0) {
    return {
      attribution: currentAttribution,
      landingPath: `${window.location.pathname}${window.location.search}`,
    };
  }

  return (
    readStoredAttribution() ?? {
      attribution: {},
      landingPath: window.location.pathname,
    }
  );
}

function createClickId() {
  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function buildTrackedAppUrl(placement: string, offer: string) {
  const destination = new URL(CLIENTORY_APP_URL);
  const { attribution, landingPath } = getMarketingAttribution();
  const clickId = createClickId();

  for (const [key, value] of Object.entries(attribution)) {
    destination.searchParams.set(key, value);
  }

  destination.searchParams.set("cl_click_id", clickId);
  destination.searchParams.set("cl_cta_placement", placement);
  destination.searchParams.set("cl_cta_offer", offer);
  destination.searchParams.set("cl_landing_path", landingPath);

  return {
    clickId,
    destination: destination.toString(),
    attribution,
    landingPath,
  };
}
