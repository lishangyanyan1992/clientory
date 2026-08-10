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
import { JsonLd, SeoMeta } from "@/components/SeoMeta";
import { TrackedAppLink } from "@/components/TrackedAppLink";

const FREE_REPORT_FEATURES = [
  FREE_PROMPTS_LABEL,
  `Tested on ${FREE_MODELS_LABEL}`,
  "AI visibility score out of 100",
  "Per-prompt sentiment breakdown",
  "One report for your firm",
];

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
  sublabel: "One-month free trial with full access",
  price: BILLING_CONFIG.monthlyPriceUsd,
  description: `Every scan runs ${PROMPTS_PER_PAID_SCAN} prompts across ${PAID_MODELS_LABEL}, re-runs itself weekly, and comes with the Presence Coach and Citation Monitor.`,
  badge: "First month free",
  features: PLAN_FEATURES,
} as const;

const title = "Clientory Pricing | Free Report and One-Month Trial";
const description =
  "Run a free AI visibility report with no credit card. Then choose a one-month full-access trial before the $10 monthly subscription begins.";

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Clientory",
  url: "https://app.clientory.org",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  offers: {
    "@type": "Offer",
    price: String(BILLING_CONFIG.monthlyPriceUsd),
    priceCurrency: "USD",
    url: "https://clientory.org/pricing",
    description: "One free report, one month of full subscription access free, then $10 per month.",
  },
};

const PRICING_FAQS = [
  {
    q: "What do I get without a credit card?",
    a: `You can run one free ${PROMPTS_PER_FREE_SCAN}-prompt visibility report on ${FREE_MODELS_LABEL} with no credit card and no commitment. The report shows your AI visibility score and per-prompt results. It does not automatically start a trial or subscription.`,
  },
  {
    q: "How does the free trial work?",
    a: `After reviewing your free report, you can choose to start a one-month free trial of the complete subscription. The trial includes ${PROMPTS_PER_PAID_SCAN}-prompt scans, weekly monitoring, ${PAID_ONLY_MODELS_LABEL}, competitor tracking, the AI Presence Coach, and alerts. After the free month, the subscription is $${BILLING_CONFIG.monthlyPriceUsd}/month.`,
  },
  {
    q: "Which AI models do you test?",
    a: `Today we query ${PAID_MODELS_LABEL}. ${UPCOMING_MODELS_LABEL} are on the roadmap and will be added to the subscription as they become available.`,
  },
  {
    q: "How many prompts does a scan run?",
    a: `The no-card free report runs ${PROMPTS_PER_FREE_SCAN} prompts. During your free trial and paid subscription, each weekly scan runs ${PROMPTS_PER_PAID_SCAN} prompts generated from your firm profile, covering brand, location, specialty, problem, and audience searches.`,
  },
  {
    q: "What is the AI Presence Coach?",
    a: "A chat coach that knows your latest scan—your score, which competitors are filling your gaps, and what to change. It is included throughout your free trial month and with the paid subscription afterward.",
  },
  {
    q: "How do weekly re-scans work?",
    a: "You get one new scan each week. You can run it yourself whenever you are ready; if you do not, Clientory runs it automatically so you never have to remember. A manual scan and an automatic scan are the same weekly scan, not separate allowances. Your previous reports remain available to view, and the Citation Monitor records weekly changes, new competitors, and score alerts.",
  },
  {
    q: "What happens if I cancel?",
    a: "Your access continues through the end of your current billing period. After that, you will need to resubscribe to run new scans.",
  },
];

const pricingFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PRICING_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function Pricing() {
  return (
    <>
      <SeoMeta title={title} description={description} path="/pricing" />
      <JsonLd data={pricingSchema} />
      <JsonLd data={pricingFaqSchema} />
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
            Free report first. Full subscription free for one month when you are ready.
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            See when AI recommends your firm
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with one free report—no credit card, no commitment. See how Clientory works, then choose whether to start a one-month free trial with full subscription access.
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
                Free visibility report
              </p>
              <p className="text-xs text-muted-foreground mb-3">No credit card. No commitment.</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold">$0</span>
              </div>
              <p className="text-muted-foreground text-sm">
                See your current AI visibility and experience Clientory before deciding whether to start a trial.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {FREE_REPORT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <Check className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <TrackedAppLink
              placement="pricing_free_report"
              offer="free_report"
              className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm border border-border hover:bg-muted"
            >
              Run your free report <ArrowRight className="w-4 h-4" />
            </TrackedAppLink>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Your free report does not start a subscription or trial.
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
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1 mb-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground mb-1">during your first month</span>
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

            <TrackedAppLink
              placement="pricing_trial"
              offer="subscription_trial"
              className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Start your free month <ArrowRight className="w-4 h-4" />
            </TrackedAppLink>
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
            {PRICING_FAQS.map((faq) => (
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
