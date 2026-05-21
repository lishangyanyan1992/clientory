import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, X } from "lucide-react";

const prompts = [
  "Best marriage green card lawyer in Chicago",
  "Top H-1B immigration lawyer for startups in Austin",
  "Best naturalization attorney near Houston",
];

const promptData: Record<string, { model: string; rank: number | null }[]> = {
  [prompts[0]]: [
    { model: "ChatGPT", rank: 2 },
    { model: "Claude", rank: 4 },
    { model: "Gemini", rank: null },
    { model: "Perplexity", rank: 3 },
  ],
  [prompts[1]]: [
    { model: "ChatGPT", rank: 3 },
    { model: "Claude", rank: null },
    { model: "Gemini", rank: 5 },
    { model: "Perplexity", rank: 2 },
  ],
  [prompts[2]]: [
    { model: "ChatGPT", rank: 1 },
    { model: "Claude", rank: 3 },
    { model: "Gemini", rank: 4 },
    { model: "Perplexity", rank: null },
  ],
};

const modelColors: Record<string, string> = {
  ChatGPT: "bg-emerald-500",
  Claude: "bg-orange-400",
  Gemini: "bg-blue-500",
  Perplexity: "bg-violet-500",
};

export default function AIDashboard() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentPrompt = prompts[promptIndex];
  const currentData = promptData[currentPrompt];
  const sorted = [...currentData].sort((a, b) => {
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    return a.rank - b.rank;
  });

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentPrompt.length) {
        setDisplayedText(currentPrompt.slice(0, i + 1));
        i += 1;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 36);
    return () => clearInterval(interval);
  }, [currentPrompt]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
          </div>
          <span className="ml-2 text-[11px] font-medium text-muted-foreground">
            AI Visibility Dashboard
          </span>
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

        <div className="space-y-2 px-4 pb-4">
          <div className="mb-1 flex items-center justify-between px-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Model
            </span>
            <div className="flex gap-8">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Rank
              </span>
              <span className="w-20 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </span>
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
                className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${modelColors[item.model]}`} />
                  <span className="text-sm font-medium text-foreground">{item.model}</span>
                </div>

                <div className="flex items-center gap-8">
                  <motion.span
                    key={`${item.model}-${item.rank}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-w-[48px] text-center text-sm font-semibold text-foreground"
                  >
                    {item.rank ? `#${item.rank}` : "—"}
                  </motion.span>

                  <motion.div
                    key={`${item.model}-status-${item.rank}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex w-20 items-center justify-end gap-1.5 text-xs font-medium ${
                      item.rank ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {item.rank ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Appears</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3.5 w-3.5" />
                        <span>Not Found</span>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
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
    </div>
  );
}
