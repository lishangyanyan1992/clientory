import { motion } from "framer-motion";
import { Bell, BrainCircuit, Gauge, MessageSquare, RefreshCw, Users } from "lucide-react";
import { PROMPTS_PER_FREE_SCAN, PROMPTS_PER_PAID_SCAN } from "@/lib/billing-config";
import { FREE_MODELS_LABEL, PAID_MODELS_LABEL } from "@/lib/model-coverage";

// Every card below maps to something the product actually ships today:
// the Visibility Scanner, the Presence Coach, and the Citation Monitor.
// Don't add a card for a capability that isn't live.
const features = [
  {
    icon: Gauge,
    title: "AI Visibility Score",
    description: `Run ${PROMPTS_PER_FREE_SCAN} prompts free on ${FREE_MODELS_LABEL}, or ${PROMPTS_PER_PAID_SCAN} across ${PAID_MODELS_LABEL} on a subscription — scored 0–100.`,
    tint: "#6467f2", // indigo
    badge: null,
  },
  {
    icon: Users,
    title: "Competitor Gap",
    description:
      "See exactly which rival firms show up in the prompts you're missing from — the shortlist you're being left off.",
    tint: "#4f78ec", // blue-indigo
    badge: null,
  },
  {
    icon: MessageSquare,
    title: "Per-Prompt Sentiment",
    description:
      "Every prompt is graded per model as Positive, Passive, or No mention, so you can see where you're recommended versus merely listed.",
    tint: "#3b9fd9", // brand blue
    badge: null,
  },
  {
    icon: RefreshCw,
    title: "One Scan a Week",
    description:
      "Run it yourself, or skip it and Clientory runs it for you every 7 days. Either way your score stays current — and weekly is as often as AI answers actually move.",
    tint: "#22b0a8", // teal
    badge: "Paid",
  },
  {
    icon: BrainCircuit,
    title: "AI Presence Coach",
    description:
      "A chat coach that knows your latest scan — your score, your competitor gaps — and walks you through what to fix first.",
    tint: "#16b394", // teal-green
    badge: "Paid",
  },
  {
    icon: Bell,
    title: "Citation Monitor",
    description:
      "Weekly snapshots track your score over time, with alerts when a new competitor enters your prompts or your score moves.",
    tint: "#10b780", // emerald
    badge: "Paid",
  },
];

export default function Features() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-label">Features</p>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-5xl">
            Scan, coach, and <span className="text-gradient">monitor</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The Visibility Scanner tells you where you stand. With a subscription, the Presence
            Coach tells you what to fix and the Citation Monitor tells you when it changes.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 card-hover"
            >
              {/* Stripe-style gradient corner-bleed, tinted per card */}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -right-12 h-52 w-52 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
                style={{ background: `radial-gradient(circle, ${feature.tint}, transparent 70%)` }}
              />

              <div className="relative z-10">
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${feature.tint}29, ${feature.tint}0d)`,
                    boxShadow: `inset 0 0 0 1px ${feature.tint}29, 0 6px 16px -8px ${feature.tint}80`,
                  }}
                >
                  <feature.icon className="h-5 w-5" strokeWidth={2} style={{ color: feature.tint }} />
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  {feature.badge && (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
