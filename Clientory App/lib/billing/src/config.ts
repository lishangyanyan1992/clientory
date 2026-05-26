export const PLAN_STATIC_CONFIG = {
  scansPerCycle: 4,
  monthlyPriceUsd: 10,
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
} as const;

export type PlanFeatures =
  | typeof PLAN_STATIC_CONFIG.features.free
  | typeof PLAN_STATIC_CONFIG.features.paid;
