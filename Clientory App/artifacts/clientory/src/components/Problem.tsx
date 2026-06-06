import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Globe, Search } from "lucide-react";

const timelineSteps = [
  {
    label: "Yesterday",
    title: "Google Search",
    icon: Search,
    description: "Traditional search rankings shaped who got the inquiry first.",
  },
  {
    label: "Today",
    title: "Google + AI",
    icon: Globe,
    description: "Prospective clients still search, but they increasingly ask AI first.",
  },
  {
    label: "Tomorrow",
    title: "AI Answers",
    icon: Bot,
    description: "AI assistants answer directly and narrow the shortlist for the client.",
  },
];

// "Today" is the present — it stays highlighted (no auto-cycling).
const CURRENT = 1;
const FILL_HORIZONTAL = CURRENT * 40; // % of the desktop track to the Today node
const FILL_VERTICAL = (CURRENT / (timelineSteps.length - 1)) * 100; // % of the mobile track

export default function Problem() {
  const reduce = useReducedMotion();

  const lineTransition = reduce
    ? { duration: 0 }
    : { duration: 0.8, ease: "easeInOut" as const };

  return (
    <section className="relative py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">The Shift</p>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-5xl">
            The future <span className="text-gradient">immigration client pipeline</span>
          </h2>
        </motion.div>

        {/* Timeline: horizontal on desktop, vertical on mobile */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mx-auto mb-12 max-w-3xl"
        >
          {/* Desktop horizontal track + fill */}
          <div className="absolute left-[10%] right-[10%] top-5 hidden h-px bg-border md:block" />
          <motion.div
            className="absolute left-[10%] top-5 hidden h-px bg-primary/60 md:block"
            initial={{ width: reduce ? `${FILL_HORIZONTAL}%` : "0%" }}
            whileInView={{ width: `${FILL_HORIZONTAL}%` }}
            viewport={{ once: true }}
            transition={lineTransition}
          />

          {/* Mobile vertical track + fill */}
          <div className="absolute bottom-6 left-5 top-6 w-px bg-border md:hidden" />
          <motion.div
            className="absolute left-5 top-6 w-px bg-primary/60 md:hidden"
            initial={{ height: reduce ? `${FILL_VERTICAL}%` : "0%" }}
            whileInView={{ height: `${FILL_VERTICAL}%` }}
            viewport={{ once: true }}
            transition={lineTransition}
          />

          <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-0">
            {timelineSteps.map((step, i) => {
              const reached = i <= CURRENT;
              const isNow = i === CURRENT;
              return (
                <motion.div
                  key={step.label}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.4 }}
                  className="relative flex flex-1 items-start gap-4 md:flex-col md:items-center md:gap-0 md:px-2 md:text-center"
                >
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                      reached
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    } ${isNow ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}`}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>

                  <div className="md:mt-3">
                    <div className="flex items-center gap-2 md:justify-center">
                      <span
                        className={`text-[11px] font-medium uppercase tracking-widest ${
                          reached ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                      {isNow && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Now
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block text-sm font-semibold text-foreground">
                      {step.title}
                    </span>
                    <span className="mt-1 block max-w-[220px] text-xs leading-relaxed text-muted-foreground md:max-w-[160px]">
                      {step.description}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Thesis callout — the section's takeaway */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl"
        >
          <div className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-lg md:gap-5 md:p-8">
            <span className="w-1 shrink-0 self-stretch rounded-full bg-primary" aria-hidden />
            <div>
              <h3 className="mb-3 text-xl font-semibold leading-snug text-foreground md:text-2xl">
                Ranking on Google does not guarantee AI visibility.
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                AI assistants are becoming the new front door to immigration services. If your firm
                is not mentioned in answers about visas, green cards, or deportation defense,
                prospective clients may never put you on the shortlist.
              </p>
              <Link
                to="/scan"
                className="mt-5 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-primary transition-all duration-300 hover:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                See if AI recommends your firm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
