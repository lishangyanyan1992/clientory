import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Globe, Bot, AlertCircle } from "lucide-react";

const timelineSteps = [
  {
    label: "Yesterday",
    title: "Google Search",
    icon: Search,
    description: "Traditional search rankings determined who got found.",
  },
  {
    label: "Today",
    title: "Google + AI",
    icon: Globe,
    description: "Users still search Google but increasingly ask AI assistants.",
  },
  {
    label: "Tomorrow",
    title: "AI Answers",
    icon: Bot,
    description: "AI assistants provide direct answers instead of search results.",
  },
];

const prompts = [
  "Best tax firm in Chicago",
  "Top accountants for startups in Austin",
  "Business lawyers for SaaS companies in San Francisco",
  "Best marketing consultants for small businesses in New York",
];

const aiResponses: Record<string, { intro: string; firms: string[] }> = {
  [prompts[0]]: {
    intro: "Top tax firms in Chicago include:",
    firms: ["Midwest Tax Advisors", "Smith & Partners", "Chicago Tax Group"],
  },
  [prompts[1]]: {
    intro: "Here are some top accountants for startups in Austin:",
    firms: ["Austin Startup CPA", "Lone Star Financial", "Capital City Accounting"],
  },
  [prompts[2]]: {
    intro: "Recommended business lawyers for SaaS companies in San Francisco:",
    firms: ["Bay Area Tech Law", "Pacific Legal Partners", "SF SaaS Counsel"],
  },
  [prompts[3]]: {
    intro: "Best marketing consultants for small businesses in New York:",
    firms: ["Manhattan Growth Co.", "NYC Digital Strategy", "Empire Marketing Group"],
  },
};

const Problem = () => {
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showResponse, setShowResponse] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const currentPrompt = prompts[promptIndex];
  const currentResponse = aiResponses[currentPrompt];

  // Timeline animation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Typing effect
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    setShowResponse(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentPrompt.length) {
        setDisplayedText(currentPrompt.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => setShowResponse(true), 300);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [promptIndex, currentPrompt]);

  // Cycle prompts
  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-16 md:py-20">
      <div className="container px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
            The Shift
          </p>
          <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto text-foreground leading-tight">
            The Future{" "}
            <span className="text-gradient">Client Pipeline</span>
          </h2>
        </motion.div>

        {/* Part 1 — Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="relative flex items-start justify-between">
            {/* Connecting line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-px bg-border" />
            <motion.div
              className="absolute top-5 left-[10%] h-px bg-primary/60"
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
                className="relative flex flex-col items-center text-center flex-1 px-2"
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-3 transition-all duration-500 ${
                    i <= activeStep
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-medium uppercase tracking-widest mb-1 transition-colors duration-300 ${
                    i <= activeStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-sm font-semibold text-foreground mb-1">{step.title}</span>
                <span className="text-xs text-muted-foreground max-w-[160px] leading-relaxed hidden sm:block">
                  {step.description}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Part 2 — AI Answer Demo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto mb-16"
        >
          <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
              </div>
              <span className="text-[11px] text-muted-foreground ml-2 font-medium">AI Assistant</span>
            </div>

            {/* Prompt */}
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/30">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {displayedText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-[2px] h-4 bg-primary ml-0.5 align-middle"
                    />
                  )}
                </span>
              </div>
            </div>

            {/* AI Response */}
            <div className="px-4 pb-4">
              <AnimatePresence mode="wait">
                {showResponse && (
                  <motion.div
                    key={currentPrompt}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-xl bg-muted/20 border border-border/50 p-4"
                  >
                    <p className="text-sm text-foreground mb-3">{currentResponse.intro}</p>
                    <ul className="space-y-2 mb-4">
                      {currentResponse.firms.map((firm, i) => (
                        <motion.li
                          key={firm}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.12, duration: 0.3 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                          {firm}
                        </motion.li>
                      ))}
                    </ul>

                    {/* Not mentioned label */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-2 pt-3 border-t border-border/50"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-destructive/70" />
                      <span className="text-xs font-medium text-destructive/70">
                        Your firm not mentioned
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Prompt indicator */}
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

        {/* Part 3 — Problem Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Ranking on Google doesn't guarantee AI visibility.
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            AI assistants are quickly becoming the new front door to professional services.
            If your firm isn't mentioned in AI answers, potential clients may never discover you.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Problem;
