import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, X } from "lucide-react";
import { LIVE_MODELS } from "@/lib/model-coverage";

const prompts = [
  "Best marriage green card lawyer in Chicago",
  "Top H-1B immigration lawyer for startups in Austin",
  "Best naturalization attorney near Houston",
];

// The report grades each prompt per model as Positive / Passive / No mention —
// not a numeric rank. Keep this mirroring the real per-prompt breakdown.
type Sentiment = "positive" | "passive" | "none";

// Only the models a scan actually queries today (see lib/model-coverage.ts).
// Perplexity/Copilot are roadmap and must not appear here with results.
const promptData: Record<string, { model: string; sentiment: Sentiment }[]> = {
  [prompts[0]]: [
    { model: "ChatGPT", sentiment: "positive" },
    { model: "Claude", sentiment: "passive" },
    { model: "Gemini", sentiment: "none" },
  ],
  [prompts[1]]: [
    { model: "ChatGPT", sentiment: "passive" },
    { model: "Claude", sentiment: "none" },
    { model: "Gemini", sentiment: "positive" },
  ],
  [prompts[2]]: [
    { model: "ChatGPT", sentiment: "positive" },
    { model: "Claude", sentiment: "positive" },
    { model: "Gemini", sentiment: "passive" },
  ],
};

const SENTIMENT_ORDER: Record<Sentiment, number> = { positive: 0, passive: 1, none: 2 };

const SENTIMENT_LABEL: Record<Sentiment, string> = {
  positive: "Positive",
  passive: "Passive",
  none: "No mention",
};

const SENTIMENT_STYLE: Record<Sentiment, string> = {
  positive: "text-accent",
  passive: "text-amber-600",
  none: "text-muted-foreground",
};

const modelColors: Record<string, string> = Object.fromEntries(
  LIVE_MODELS.map((m) => [m.name, m.color]),
);

export default function AIDashboard() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentPrompt = prompts[promptIndex];
  const currentData = promptData[currentPrompt];
  const sorted = [...currentData].sort(
    (a, b) => SENTIMENT_ORDER[a.sentiment] - SENTIMENT_ORDER[b.sentiment],
  );

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
            <span className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Result
            </span>
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

                <div className="flex items-center">
                  <motion.div
                    key={`${item.model}-${item.sentiment}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex w-28 items-center justify-end gap-1.5 text-xs font-medium ${SENTIMENT_STYLE[item.sentiment]}`}
                  >
                    {item.sentiment === "none" ? (
                      <>
                        <X className="h-3.5 w-3.5" />
                        <span>{SENTIMENT_LABEL.none}</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{SENTIMENT_LABEL[item.sentiment]}</span>
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
