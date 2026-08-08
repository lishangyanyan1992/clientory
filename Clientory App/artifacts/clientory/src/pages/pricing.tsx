import { MarketingLayout } from "@/components/marketing-layout";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  BILLING_CONFIG,
  BILLING_SCANS_LABEL,
  FREE_PROMPTS_LABEL,
  PAID_PROMPTS_LABEL,
  PROMPTS_PER_FREE_SCAN,
  PROMPTS_PER_PAID_SCAN,
} from "@/lib/billing-config";
import {
  FREE_MODELS_LABEL,
  PAID_MODELS_LABEL,
  PAID_ONLY_MODELS_LABEL,
  UPCOMING_MODELS_LABEL,
} from "@/lib/model-coverage";
import { CLIENTORY_APP_URL } from "@/lib/app-url";

// What the free report includes. Kept deliberately short — the point of this
// column is to make the paid delta obvious, not to sell the free tier.
const FREE_FEATURES = [
  `${FREE_PROMPTS_LABEL} (sampled across categories)`,
  `Tested on ${FREE_MODELS_LABEL}`,
  "Your AI visibility score",
  "One report, one firm",
];

const PAID_FEATURES = [
  PAID_PROMPTS_LABEL,
  `Tested on ${PAID_MODELS_LABEL}`,
  BILLING_SCANS_LABEL,
  "Full report history",
  "PDF & CSV exports",
  "Detailed AI recommendations",
  "Saved firm profiles",
  "Priority scan processing",
];

const PLAN = {
  label: "Clientory subscription",
  sublabel: "One simple plan for every firm",
  price: BILLING_CONFIG.monthlyPriceUsd,
  description: `Every scan runs ${PROMPTS_PER_PAID_SCAN} prompts across ${PAID_MODELS_LABEL}, with full report history, exports, and recommendations.`,
  badge: "Single plan",
  features: PAID_FEATURES,
} as const;

export default function Pricing() {
  return (
    <MarketingLayout>
      <div className="container max-w-5xl mx-auto px-4 pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Know when AI recommends your immigration firm
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every immigration law firm gets one free AI visibility report — {PROMPTS_PER_FREE_SCAN} prompts on {FREE_MODELS_LABEL}. Subscribe to unlock {PROMPTS_PER_PAID_SCAN} prompts per scan, add {PAID_ONLY_MODELS_LABEL}, and track changes over time.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-8 relative"
          >
            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Free report
              </p>
              <p className="text-xs text-muted-foreground mb-3">One per firm, no credit card</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold">$0</span>
              </div>
              <p className="text-muted-foreground text-sm">
                See where your firm stands on {FREE_MODELS_LABEL} before you commit to anything.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <Check className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={CLIENTORY_APP_URL}
              className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm border border-border hover:bg-muted"
            >
              Run your free report <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {UPCOMING_MODELS_LABEL} coming soon to every plan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border-2 border-primary shadow-primary/10 bg-card p-8 relative shadow-lg"
          >
            {PLAN.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                  {PLAN.badge}
                </span>
              </div>
            )}
            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{PLAN.label}</p>
              <p className="text-xs text-muted-foreground mb-3">{PLAN.sublabel}</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold">${PLAN.price}</span>
                <span className="text-muted-foreground mb-1">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">{PLAN.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PLAN.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={CLIENTORY_APP_URL}
              className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Continue to Clientory <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Payments and account management are handled in the Clientory app.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-6 text-left">
            {[
              {
                q: "Do I get a free report?",
                a: `Yes — every account gets one free AI visibility report, no credit card required. The free report runs ${PROMPTS_PER_FREE_SCAN} prompts on ${FREE_MODELS_LABEL}. After that, subscribe per firm to keep running scans.`,
              },
              {
                q: "Which AI models do you test?",
                a: `Today we query ${PAID_MODELS_LABEL}. ${FREE_MODELS_LABEL} run on every scan including the free report; ${PAID_ONLY_MODELS_LABEL} is included with a subscription. ${UPCOMING_MODELS_LABEL} are on the roadmap and will be added to existing plans.`,
              },
              {
                q: "How many prompts does a scan run?",
                a: `A subscribed scan runs ${PROMPTS_PER_PAID_SCAN} prompts generated from your firm profile, covering brand, location, specialty, problem, and persona searches. The free report runs a ${PROMPTS_PER_FREE_SCAN}-prompt sample spread across those same categories.`,
              },
              {
                q: "What counts as a scan?",
                a: "Each time you run a new visibility scan for a specific immigration firm, that uses 1 scan from your allowance. Viewing an existing report again does not use a scan.",
              },
              {
                q: "When does my scan allowance reset?",
                a: `Your ${BILLING_CONFIG.scansPerCycle}-scan allowance resets at the start of each monthly billing cycle.`,
              },
              {
                q: "Can I subscribe multiple firms?",
                a: `Yes — subscriptions are per firm. Each immigration firm you want to monitor monthly needs its own subscription for $${BILLING_CONFIG.monthlyPriceUsd}/month.`,
              },
              {
                q: "What happens if I cancel?",
                a: "Your access continues through the end of your current billing period. After that, you'll need to resubscribe to run new scans on that firm.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MarketingLayout>
  );
}
