import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing-layout";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { BILLING_CONFIG, BILLING_SCANS_LABEL } from "@/lib/billing-config";

const SHARED_FEATURES = [
  "10 AI search prompts",
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
  description: "Monitor your firm with one subscription that includes the full Clientory workflow, report history, exports, and recommendations.",
  badge: "Single plan",
  features: SHARED_FEATURES,
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
            Every immigration law firm gets one free AI visibility report. Subscribe to run ongoing scans, track changes over time, and stay ahead of competing firms.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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

            <Link
              to="/settings/billing"
              className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Subscribe a Firm <ArrowRight className="w-4 h-4" />
            </Link>
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
                a: "Yes — every account gets one free AI visibility report, no credit card required. After that, subscribe per firm to keep running scans.",
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
