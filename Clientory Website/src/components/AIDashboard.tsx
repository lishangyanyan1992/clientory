import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Search } from "lucide-react";

const prompts = [
  "Best marketing consultant for small businesses",
  "Top accounting firms for startups",
  "Business lawyer for SaaS companies",
];

const promptData: Record<string, { model: string; rank: number | null }[]> = {
  [prompts[0]]: [
    { model: "ChatGPT", rank: 2 },
    { model: "Claude", rank: 5 },
    { model: "Gemini", rank: null },
    { model: "Perplexity", rank: 3 },
  ],
  [prompts[1]]: [
    { model: "ChatGPT", rank: 4 },
    { model: "Claude", rank: 2 },
    { model: "Gemini", rank: 6 },
    { model: "Perplexity", rank: 3 },
  ],
  [prompts[2]]: [
    { model: "ChatGPT", rank: 1 },
    { model: "Claude", rank: null },
    { model: "Gemini", rank: 4 },
    { model: "Perplexity", rank: 2 },
  ],
};

const modelColors: Record<string, string> = {
  ChatGPT: "bg-emerald-500",
  Claude: "bg-orange-400",
  Gemini: "bg-blue-500",
  Perplexity: "bg-violet-500",
};

const AIDashboard = () => {
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentPrompt = prompts[promptIndex];
  const currentData = promptData[currentPrompt];

  // Sort by rank (null = last)
  const sorted = [...currentData].sort((a, b) => {
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    return a.rank - b.rank;
  });

  // Typing effect
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentPrompt.length) {
        setDisplayedText(currentPrompt.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [promptIndex, currentPrompt]);

  // Cycle prompts
  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
          </div>
          <span className="text-[11px] text-muted-foreground ml-2 font-medium">AI Visibility Dashboard</span>
        </div>

        {/* Search input */}
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

        {/* Results */}
        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Model</span>
            <div className="flex gap-8">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Rank</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-20 text-right">Status</span>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {sorted.map((item) => (
              <motion.div
                key={item.model}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${modelColors[item.model]}`} />
                  <span className="text-sm font-medium text-foreground">{item.model}</span>
                </div>

                <div className="flex items-center gap-8">
                  <motion.span
                    key={`${item.model}-${item.rank}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm font-mono font-semibold text-foreground min-w-[48px] text-center"
                  >
                    {item.rank ? `#${item.rank}` : "—"}
                  </motion.span>

                  <motion.div
                    key={`${item.model}-status-${item.rank}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center gap-1.5 w-20 justify-end text-xs font-medium ${
                      item.rank ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {item.rank ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Appears</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Not Found</span>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
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
    </div>
  );
};

export default AIDashboard;
