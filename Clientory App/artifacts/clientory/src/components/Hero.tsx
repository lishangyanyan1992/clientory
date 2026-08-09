import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIDashboard from "@/components/AIDashboard";
import StripeGradient from "@/components/StripeGradient";
import { TrackedAppLink } from "@/components/TrackedAppLink";
import { PROMPTS_PER_FREE_SCAN } from "@/lib/billing-config";
import { FREE_MODELS_LABEL } from "@/lib/model-coverage";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-7rem)] items-center justify-center overflow-hidden pt-28">
      {/* Stripe's real animated WebGL gradient shader */}
      <StripeGradient />
      {/* Fade the gradient into the page + lift text legibility over it */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background" />

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

          {/* Solid navy over the gradient shader — Stripe never sets
              gradient-on-gradient; keeps contrast high and legible. */}
          <h1 className="mb-8 text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Be the immigration law firm AI recommends.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-foreground/75 md:text-xl">
            When clients ask ChatGPT, Claude, or Gemini for an immigration lawyer, does your firm
            come up? Clientory scores your AI visibility out of 100, shows which competitors appear
            where you don't, and coaches you on what to fix.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <TrackedAppLink placement="home_hero" offer="free_report">
              <Button
                size="lg"
                className="h-14 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
              >
                Try It Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </TrackedAppLink>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-base">
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex flex-col items-center justify-center gap-1 text-sm text-foreground/75">
            <p>
              Free report: {PROMPTS_PER_FREE_SCAN} prompts on {FREE_MODELS_LABEL} · No credit card
              required
            </p>
            <p>Like the report? Get the full subscription free for one month, then $10/month.</p>
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
              Built for the owners and operators of independent immigration law firms.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
