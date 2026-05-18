import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Target, Zap } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="container px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge — matches website pattern */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full border border-border bg-muted/50 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-foreground">AI Visibility Platform</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-8">
              Are AI assistants recommending
              <br />
              <span className="text-gradient">your firm?</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              ChatGPT, Perplexity, and Gemini are answering questions your clients ask — but they may not be recommending you. Discover how visible your firm is and get a clear action plan to improve.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-8 h-14 rounded-full text-base font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                style={{ background: "var(--gradient-hero)" }}
              >
                Scan Your Firm
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 md:py-20">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto text-foreground leading-tight">
              Everything you need to{" "}
              <span className="text-gradient">own the AI answer</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: "1. Prompt Generation",
                desc: "We generate realistic prompts based on your practice areas, location, and specialties — the same queries real clients type into AI.",
              },
              {
                icon: Bot,
                title: "2. Multi-Model Testing",
                desc: "We run those prompts through the top AI assistants — ChatGPT, Claude, and Gemini — to see which firms each one recommends.",
              },
              {
                icon: Zap,
                title: "3. Actionable Insights",
                desc: "You get a clear visibility score, mention tracking per AI model, and concrete steps your firm can take to be recommended more often.",
              },
            ].map((feature, i) => (
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
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — matches website CTA section */}
      <section className="relative py-16 md:py-20">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-20 overflow-hidden"
            style={{ background: "var(--gradient-hero)" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-white/10 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                Stop being invisible.
                <br />
                <span className="text-white/80">Start being recommended.</span>
              </h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
                Get your firm's AI visibility report — free. See exactly where you stand across ChatGPT, Gemini, and Perplexity.
              </p>
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90 text-base px-10 h-14 rounded-full font-semibold shadow-lg transition-all duration-300"
              >
                Scan Your Firm Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
