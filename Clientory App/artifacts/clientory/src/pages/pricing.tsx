import { MarketingLayout } from "@/components/marketing-layout";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  BILLING_CONFIG,
  BILLING_SCANS_LABEL,
  PAID_PROMPTS_LABEL,
  PROMPTS_PER_PAID_SCAN,
} from "@/lib/billing-config";
import {
  PAID_MODELS_LABEL,
  UPCOMING_MODELS_LABEL,
} from "@/lib/model-coverage";
import { CLIENTORY_APP_URL } from "@/lib/app-url";

const PLAN_FEATURES = [
  PAID_PROMPTS_LABEL,
  `Tested on ${PAID_MODELS_LABEL}`,
  BILLING_SCANS_LABEL,
  "Competitor gap analysis",
  "AI Presence Coach, personalized to your scan",
  "Citation Monitor with weekly snapshots",
  "Competitor emergence alerts",
  "Email alerts when your score changes",
];

const PLAN = {
  label: "Clientory subscription",
  sublabel: "Full access free for your first month",
  price: BILLING_CONFIG.monthlyPriceUsd,
  description: `Every scan runs ${PROMPTS_PER_PAID_SCAN} prompts across ${PAID_MODELS_LABEL}, re-runs itself weekly, and comes with the Presence Coach and Citation Monitor.`,
  badge: "Beta offer",
  features: PLAN_FEATURES,
} as const;

export default function Pricing() {
  return (
    <>
      <title>Clientory Pricing | Your First Month Free</title>
      <meta name="description" content="Get one month of full Clientory access free during beta, including weekly AI visibility scans, competitor tracking, and personalized recommendations." />
      <link rel="canonical" href="https://clientory.org/pricing" />
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
            Beta offer: your first month is free
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            See when AI recommends your company
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the complete Clientory subscription free for your first month during beta. Run {PROMPTS_PER_PAID_SCAN}-prompt scans, track competitors, use the AI Presence Coach, and receive weekly monitoring from day one.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
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
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1 mb-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground mb-1">for your first month</span>
              </div>
              <p className="mb-3 text-sm font-medium text-foreground">Then ${PLAN.price}/month</p>
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
              Start your free month <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Full subscription access during your free month. {UPCOMING_MODELS_LABEL} are coming soon.
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
                q: "How does the beta offer work?",
                a: `Your first month includes full Clientory subscription access at no cost. You get ${PROMPTS_PER_PAID_SCAN}-prompt scans, weekly monitoring, competitor tracking, the AI Presence Coach, and alerts from the beginning. After your free month, the subscription is $${BILLING_CONFIG.monthlyPriceUsd}/month.`,
              },
              {
                q: "Which AI models do you test?",
                a: `Today we query ${PAID_MODELS_LABEL}. ${UPCOMING_MODELS_LABEL} are on the roadmap and will be added to the subscription as they become available.`,
              },
              {
                q: "How many prompts does a scan run?",
                a: `Each scan runs ${PROMPTS_PER_PAID_SCAN} prompts generated from your company profile, covering brand, location, specialty, problem, and audience searches.`,
              },
              {
                q: "What is the AI Presence Coach?",
                a: "A chat coach that knows your latest scan—your score, which competitors are filling your gaps, and what to change. It is included throughout your free beta month and with the paid subscription afterward.",
              },
              {
                q: "How do weekly re-scans work?",
                a: "You get one new scan each week. You can run it yourself whenever you are ready; if you do not, Clientory runs it automatically so you never have to remember. A manual scan and an automatic scan are the same weekly scan, not separate allowances. Your previous reports remain available to view, and the Citation Monitor records weekly changes, new competitors, and score alerts.",
              },
              {
                q: "What happens if I cancel?",
                a: "Your access continues through the end of your current billing period. After that, you will need to resubscribe to run new scans.",
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
    </>
  );
}
