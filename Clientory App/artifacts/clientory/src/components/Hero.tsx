import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIDashboard from "@/components/AIDashboard";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-7rem)] items-center justify-center overflow-hidden pt-28">
      <div className="absolute inset-0 bg-gradient-glow" />
      <motion.div
        animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]"
      />

      <div className="container relative z-10 mx-auto px-6 py-10 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 backdrop-blur-sm"
          >
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              AI Visibility Platform for Immigration Law Firms
            </span>
          </motion.div>

          <h1 className="mb-8 text-5xl font-bold text-foreground md:text-6xl lg:text-7xl">
            Be found by AI.
            <br />
            <span className="text-gradient">Win more immigration clients.</span>
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            ChatGPT, Gemini, Claude, and Perplexity are answering questions about green cards,
            H-1Bs, naturalization, and removal defense. Clientory helps small and mid-sized
            immigration law firms see whether AI assistants recommend them and what to fix next.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/scan">
              <Button
                size="lg"
                className="h-14 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
              >
                Try It Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-base">
                View Pricing
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-16"
          >
            <AIDashboard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-12 border-t border-border/50 pt-8"
          >
            <p className="text-sm text-muted-foreground">
              Designed for owners and operators of small to medium-sized immigration law firms.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
