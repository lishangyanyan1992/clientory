import { motion } from "framer-motion";
import { Activity, BrainCircuit, Globe, LineChart, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time LLM Tracking",
    description:
      "Monitor your firm's mentions across ChatGPT, Perplexity, Gemini, Claude, and Copilot as AI recommendations shift.",
  },
  {
    icon: Globe,
    title: "Competitor Benchmarking",
    description:
      "See how your immigration firm stacks up against competing firms for the exact prompts clients ask.",
  },
  {
    icon: Zap,
    title: "GEO Recommendations",
    description:
      "Get practical improvements for your Generative Engine Optimization strategy, tailored to immigration law.",
  },
  {
    icon: LineChart,
    title: "Visibility Score",
    description:
      "Track your firm's AI presence over time with a single score that makes progress easy to measure.",
  },
  {
    icon: BrainCircuit,
    title: "Query Intelligence",
    description:
      "Learn what prospective clients ask about H-1Bs, green cards, citizenship, waivers, and removal defense.",
  },
  {
    icon: Shield,
    title: "Brand Protection",
    description:
      "Catch inaccurate or damaging AI answers about your firm before they cost you trust or consultations.",
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
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">Features</p>
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
              className="group rounded-2xl border border-border bg-card p-8 card-hover"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
