import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { clientoryAppUrl } from "@/lib/clientory-app-url";

const CTA = () => {
  return (
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
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-white/10 blur-[80px] rounded-full" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
              Stop being invisible.
              <br />
              <span className="text-accent">Start being recommended.</span>
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
              Join the firms that are getting ahead of the AI visibility curve. Get early access to Clientory and start showing up where it matters.
            </p>
            <a href={clientoryAppUrl}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-base px-10 h-14 rounded-full font-semibold shadow-lg"
              >
                Try It Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
