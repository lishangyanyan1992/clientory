export const PLAN_STATIC_CONFIG = {
  scansPerCycle: 4,
  monthlyPriceUsd: 5,
  features: {
    free: {
      reportHistory: false,
      exports: false,
      recommendations: false,
      savedProfiles: false,
      scansTotal: 1,
    },
    paid: {
      reportHistory: true,
      exports: true,
      recommendations: true,
      savedProfiles: true,
      scansPerCycle: 4,
    },
  },
} as const;

export const PLAN_CONFIG = {
  ...PLAN_STATIC_CONFIG,
  stripePriceId: process.env.STRIPE_PRICE_ID ?? "",
  stripePriceIdBoth: process.env.STRIPE_PRICE_ID_BOTH ?? "",
} as const;

export function getPriceIdForClientType(clientType: string | null | undefined): string {
  if (clientType === "both") {
    return PLAN_CONFIG.stripePriceIdBoth || PLAN_CONFIG.stripePriceId;
  }
  return PLAN_CONFIG.stripePriceId;
}

export type PlanFeatures =
  | typeof PLAN_STATIC_CONFIG.features.free
  | typeof PLAN_STATIC_CONFIG.features.paid;
