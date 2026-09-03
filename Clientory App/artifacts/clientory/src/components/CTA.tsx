import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedAppLink } from "@/components/TrackedAppLink";
import { CLIENTORY_BETA_APPLICATION_PATH } from "@/lib/app-url";
import { BETA_ACCESS_LABEL } from "@/lib/billing-config";

export default function CTA() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl p-12 text-center md:p-20"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute left-1/2 top-0 h-[200px] w-[500px] -translate-x-1/2 rounded-full bg-white/10 blur-[80px]" />

          <div className="relative z-10">
            <h2 className="mb-6 text-3xl font-bold leading-tight text-white md:text-5xl">
              Stop being invisible.
              <br />
              <span className="text-accent">Start being recommended.</span>
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/75">
              Join the immigration law firms getting ahead of the AI visibility curve. Run your
              first report and see where your firm stands.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <TrackedAppLink placement="home_bottom_cta" offer="free_report">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-white px-10 text-base font-semibold text-primary shadow-lg hover:bg-white/90"
                >
                  Run Free Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TrackedAppLink>
              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-white/30 bg-transparent px-10 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
            <TrackedAppLink
              ctaName="apply_beta_access"
              destinationPath={CLIENTORY_BETA_APPLICATION_PATH}
              placement="home_bottom_beta_application"
              offer="beta_application"
              className="mt-5 inline-block text-sm font-medium text-white/80 underline underline-offset-4 transition-colors hover:text-white"
            >
              Want extended access? Apply for {BETA_ACCESS_LABEL} — no card, approval required.
            </TrackedAppLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
