import { motion } from "framer-motion";
import { Activity, BrainCircuit, Eye, Gauge, Lightbulb, Shield } from "lucide-react";

const features = [
  {
    icon: Activity, // live pulse → real-time tracking
    title: "Real-Time LLM Tracking",
    description:
      "Monitor your firm's mentions across ChatGPT, Perplexity, Gemini, Claude, and Copilot as AI recommendations shift.",
    tint: "#6467f2", // indigo
  },
  {
    icon: Gauge, // measure vs. the field → benchmarking
    title: "Competitor Benchmarking",
    description:
      "See how your immigration firm stacks up against competing firms for the exact prompts clients ask.",
    tint: "#4f78ec", // blue-indigo
  },
  {
    icon: Lightbulb, // ideas → recommendations
    title: "GEO Recommendations",
    description:
      "Get practical improvements for your Generative Engine Optimization strategy, tailored to immigration law.",
    tint: "#3b9fd9", // brand blue
  },
  {
    icon: Eye, // visibility
    title: "Visibility Score",
    description:
      "Track your firm's AI presence over time with a single score that makes progress easy to measure.",
    tint: "#22b0a8", // teal
  },
  {
    icon: BrainCircuit, // intelligence
    title: "Query Intelligence",
    description:
      "Learn what prospective clients ask about H-1Bs, green cards, citizenship, waivers, and removal defense.",
    tint: "#16b394", // teal-green
  },
  {
    icon: Shield, // protection
    title: "Brand Protection",
    description:
      "Catch inaccurate or damaging AI answers about your firm before they cost you trust or consultations.",
    tint: "#10b780", // emerald
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
            Everything you need to <span className="text-gradient">own the AI answer</span>
          </h2>
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
                <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
