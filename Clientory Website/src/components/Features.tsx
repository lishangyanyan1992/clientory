import { motion } from "framer-motion";
import { Activity, Globe, Zap, Shield, LineChart, BrainCircuit } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time LLM Tracking",
    description: "Monitor your firm's mentions across ChatGPT, Perplexity, Gemini, and Claude — updated continuously.",
  },
  {
    icon: Globe,
    title: "Competitor Benchmarking",
    description: "See how you stack up against competitors in AI-generated answers for the queries that matter most.",
  },
  {
    icon: Zap,
    title: "GEO Recommendations",
    description: "Actionable insights to improve your Generative Engine Optimization — tailored for professional services.",
  },
  {
    icon: LineChart,
    title: "Visibility Score",
    description: "A single metric that tracks your firm's AI presence over time, so you can measure what matters.",
  },
  {
    icon: BrainCircuit,
    title: "Query Intelligence",
    description: "Discover exactly what potential clients are asking AI about your practice area — and how AI responds.",
  },
  {
    icon: Shield,
    title: "Brand Protection",
    description: "Get alerted when AI platforms provide inaccurate or damaging information about your firm.",
  },
];

const Features = () => {
  return (
    <section className="relative py-16 md:py-20">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto text-foreground leading-tight">
            Everything you need to <span className="text-gradient">own the AI answer</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-8 card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
