import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertCircle, Bot, Globe, Search } from "lucide-react";

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

const prompts = [
  "Best marriage green card lawyer in Chicago",
  "Top H-1B lawyer for startups in Austin",
  "Immigration attorney for naturalization near Houston",
  "Best removal defense lawyer in Dallas",
];

const aiResponses: Record<string, { intro: string; firms: string[] }> = {
  [prompts[0]]: {
    intro: "Top marriage green card lawyers in Chicago include:",
    firms: ["Lakefront Immigration Law", "Northside Visa Counsel", "Midwest Family Immigration"],
  },
  [prompts[1]]: {
    intro: "Here are some H-1B lawyers often recommended for startups in Austin:",
    firms: ["Capital Tech Immigration", "Austin Founder Visa Group", "Hill Country Business Immigration"],
  },
  [prompts[2]]: {
    intro: "Recommended naturalization attorneys near Houston:",
    firms: ["Bayou Citizenship Law", "Houston Naturalization Counsel", "Lone Star Immigration Group"],
  },
  [prompts[3]]: {
    intro: "Best removal defense lawyers in Dallas:",
    firms: ["Metro Removal Defense", "Dallas Immigration Advocates", "Trinity Deportation Counsel"],
  },
};

export default function Problem() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showResponse, setShowResponse] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const currentPrompt = prompts[promptIndex];
  const currentResponse = aiResponses[currentPrompt];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    setShowResponse(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentPrompt.length) {
        setDisplayedText(currentPrompt.slice(0, i + 1));
        i += 1;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => setShowResponse(true), 300);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [currentPrompt]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">The Shift</p>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-5xl">
            The future <span className="text-gradient">immigration client pipeline</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mb-16 max-w-3xl"
        >
          <div className="relative flex items-start justify-between">
            <div className="absolute left-[10%] right-[10%] top-5 h-px bg-border" />
            <motion.div
              className="absolute left-[10%] top-5 h-px bg-primary/60"
              initial={{ width: "0%" }}
              whileInView={{ width: `${activeStep * 40}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {timelineSteps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="relative flex flex-1 flex-col items-center px-2 text-center"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    i <= activeStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <span
                  className={`mb-1 text-[11px] font-medium uppercase tracking-widest transition-colors duration-300 ${
                    i <= activeStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                <span className="mb-1 text-sm font-semibold text-foreground">{step.title}</span>
                <span className="hidden max-w-[160px] text-xs leading-relaxed text-muted-foreground sm:block">
                  {step.description}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-16 max-w-lg"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
              </div>
              <span className="ml-2 text-[11px] font-medium text-muted-foreground">AI Assistant</span>
            </div>

            <div className="p-4 pb-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm text-foreground">
                  {displayedText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="ml-0.5 inline-block h-4 w-[2px] bg-primary align-middle"
                    />
                  )}
                </span>
              </div>
            </div>

            <div className="px-4 pb-4">
              <AnimatePresence mode="wait">
                {showResponse && (
                  <motion.div
                    key={currentPrompt}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-xl border border-border/50 bg-muted/20 p-4"
                  >
                    <p className="mb-3 text-sm text-foreground">{currentResponse.intro}</p>
                    <ul className="mb-4 space-y-2">
                      {currentResponse.firms.map((firm, i) => (
                        <motion.li
                          key={firm}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.12, duration: 0.3 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                          {firm}
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-2 border-t border-border/50 pt-3"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-destructive/70" />
                      <span className="text-xs font-medium text-destructive/70">
                        Your firm not mentioned
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-1.5 pb-3">
              {prompts.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === promptIndex ? "w-4 bg-primary" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h3 className="mb-4 text-xl font-bold text-foreground md:text-2xl">
            Ranking on Google does not guarantee AI visibility.
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            AI assistants are becoming the new front door to immigration services. If your firm
            is not mentioned in answers about visas, green cards, or deportation defense,
            prospective clients may never put you on the shortlist.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
