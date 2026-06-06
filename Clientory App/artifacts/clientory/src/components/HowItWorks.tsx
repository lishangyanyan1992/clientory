import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Check,
  FileText,
  Globe,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";

const STEP_MS = 5000;

const intentColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-accent/10 text-accent border-accent/20",
};

const aiModels = [
  { name: "ChatGPT", color: "bg-emerald-500" },
  { name: "Claude", color: "bg-orange-400" },
  { name: "Gemini", color: "bg-blue-500" },
  { name: "Perplexity", color: "bg-violet-500" },
  { name: "Copilot", color: "bg-slate-500" },
];

function tileStyle(tint: string) {
  return {
    background: `linear-gradient(135deg, ${tint}29, ${tint}0d)`,
    boxShadow: `inset 0 0 0 1px ${tint}29, 0 6px 16px -8px ${tint}80`,
  };
}

function AnimatedScore() {
  const [score, setScore] = useState(34);

  useEffect(() => {
    const steps = [34, 48, 63, 75, 82];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setScore(steps[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={score}
      initial={{ scale: 0.95, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      className="tabular-nums text-4xl font-bold text-gradient"
    >
      {score}
      <span className="text-lg font-normal text-muted-foreground">/100</span>
    </motion.div>
  );
}

function TrendLine() {
  const points = [
    { x: 0, y: 70 },
    { x: 20, y: 58 },
    { x: 40, y: 48 },
    { x: 60, y: 34 },
    { x: 80, y: 24 },
    { x: 100, y: 14 },
  ];

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 100 80" className="mt-3 h-16 w-full">
      <motion.path
        d={pathD}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
      />
      <motion.path
        d={`${pathD} L 100 80 L 0 80 Z`}
        fill="hsl(var(--primary) / 0.06)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      />
    </svg>
  );
}

function FlowingDots() {
  return (
    <div className="my-1 flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary/40"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
    </div>
  );
}

function FirmProfilePanel() {
  const items = [
    { icon: Briefcase, label: "Practice focus and case types" },
    { icon: Target, label: "Geography and office markets" },
    { icon: Users, label: "Family and business client segments" },
    { icon: Wrench, label: "Core services and attorney strengths" },
  ];
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
        >
          <item.icon className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function PromptPanel() {
  const rows = [
    { level: "high" as const, prompt: "Best marriage green card lawyer in Chicago" },
    { level: "medium" as const, prompt: "Top H-1B lawyer for startups in Austin" },
    { level: "low" as const, prompt: "Naturalization attorney near Houston" },
  ];
  return (
    <>
      <div className="mb-3 space-y-2">
        {rows.map((item) => (
          <div
            key={item.prompt}
            className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
          >
            <span
              className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${intentColors[item.level]}`}
            >
              {item.level}
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">"{item.prompt}"</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] text-muted-foreground/60">+47 more prompts generated</p>
    </>
  );
}

function ModelTestingPanel() {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
        {aiModels.map((model, i) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 400 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-muted/50">
              <div className={`h-3 w-3 rounded-full ${model.color}`} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{model.name}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
        <FlowingDots />
        <span>Testing prompts across models</span>
        <FlowingDots />
      </div>
    </>
  );
}

function AnalysisPanel() {
  const rows = [
    { label: "Mentioned in response", found: true },
    { label: "Ranking position: #3", found: true },
    { label: "Frequency: 4 of 5 models", found: true },
    { label: "Competitor gap identified", found: false },
  ];
  return (
    <>
      <div className="mb-4 space-y-2">
        {rows.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
          >
            <span className="text-xs text-muted-foreground">{item.label}</span>
            {item.found ? (
              <Check className="h-3.5 w-3.5 text-accent" />
            ) : (
              <X className="h-3.5 w-3.5 text-destructive/60" />
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-border/50 pt-3 text-center">
        <p className="mb-1 text-[11px] text-muted-foreground">AI Visibility Score</p>
        <AnimatedScore />
      </div>
    </>
  );
}

function RecommendationsPanel() {
  const rows = [
    { icon: FileText, label: "Improve practice area descriptions" },
    { icon: Globe, label: "Strengthen location and service pages" },
    { icon: Shield, label: "Tighten directory and credibility signals" },
  ];
  return (
    <>
      <div className="mb-4 space-y-2">
        {rows.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
          >
            <item.icon className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <Sparkles className="ml-auto h-3 w-3 text-primary/40" />
          </div>
        ))}
      </div>
      <div className="px-2">
        <p className="mb-1 text-[11px] text-muted-foreground">Score improvement</p>
        <TrendLine />
      </div>
    </>
  );
}

const steps: {
  title: string;
  icon: typeof Building2;
  tint: string;
  blurb: string;
  body: ReactNode;
}[] = [
  {
    title: "Firm Profile",
    icon: Building2,
    tint: "#6467f2",
    blurb: "Enter the signals that shape how AI should understand your immigration practice.",
    body: <FirmProfilePanel />,
  },
  {
    title: "Prompt Generation",
    icon: MessageSquare,
    tint: "#3f9fe0",
    blurb: "Clientory generates realistic prompts that future immigration clients actually ask.",
    body: <PromptPanel />,
  },
  {
    title: "AI Model Testing",
    icon: Bot,
    tint: "#22b0a8",
    blurb: "Clientory runs every prompt across the major AI assistants automatically.",
    body: <ModelTestingPanel />,
  },
  {
    title: "Visibility Analysis",
    icon: BarChart3,
    tint: "#16b394",
    blurb: "Analyze whether your firm appears, how often, and where competitors outrank you.",
    body: <AnalysisPanel />,
  },
  {
    title: "Recommendations",
    icon: TrendingUp,
    tint: "#10b780",
    blurb: "Get practical next steps to improve authority, visibility, and accuracy across AI.",
    body: <RecommendationsPanel />,
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-advance through the steps; resets the timer whenever `active` changes.
  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => setActive((prev) => (prev + 1) % steps.length), STEP_MS);
    return () => clearTimeout(timer);
  }, [active, auto]);

  const select = (i: number) => {
    setActive(i);
    setAuto(false); // a manual pick pauses the auto-cycle
  };

  // Arrow / Home / End keyboard navigation across the step "tabs".
  const handleKey = (e: ReactKeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = steps.length - 1;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = i === last ? 0 : i + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = i === 0 ? last : i - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const current = steps[active];

  return (
    <section className="relative overflow-hidden bg-muted/30 py-16 md:py-20">
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="text-3xl font-bold leading-tight text-foreground md:text-5xl">
            How <span className="text-gradient">Clientory</span> works
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-10">
          {/* Step list */}
          <div
            role="tablist"
            aria-label="How Clientory works steps"
            aria-orientation="vertical"
            className="flex flex-col gap-2.5"
          >
            {steps.map((step, i) => {
              const isActive = i === active;
              return (
                <button
                  key={step.title}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`how-tab-${i}`}
                  aria-selected={isActive}
                  aria-controls="how-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => handleKey(e, i)}
                  className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-transparent bg-card"
                      : "border-border/60 hover:border-border hover:bg-card/60"
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow: `inset 3px 0 0 0 ${step.tint}, 0 8px 22px -14px ${step.tint}cc`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300"
                      style={
                        isActive
                          ? tileStyle(step.tint)
                          : { backgroundColor: "hsl(var(--muted))" }
                      }
                    >
                      <step.icon
                        className="h-4 w-4 transition-colors"
                        strokeWidth={2}
                        style={{ color: isActive ? step.tint : "hsl(var(--muted-foreground))" }}
                      />
                    </div>
                    <div className="min-w-0">
                      <span
                        className="block text-[10px] font-medium uppercase tracking-widest"
                        style={{
                          color: isActive ? step.tint : "hsl(var(--muted-foreground) / 0.7)",
                        }}
                      >
                        Step {i + 1}
                      </span>
                      <span
                        className={`block text-sm font-semibold leading-tight ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  </div>

                  {/* Auto-advance progress bar on the active step */}
                  {isActive && auto && (
                    <motion.span
                      key={active}
                      className="absolute bottom-0 left-0 h-0.5 rounded-full"
                      style={{ backgroundColor: step.tint }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Revealed panel */}
          <div className="lg:min-h-[340px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                role="tabpanel"
                id="how-panel"
                aria-labelledby={`how-tab-${active}`}
                tabIndex={0}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg outline-none md:p-8"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full opacity-40 blur-2xl"
                  style={{ background: `radial-gradient(circle, ${current.tint}, transparent 70%)` }}
                />

                <div className="relative z-10">
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                      style={tileStyle(current.tint)}
                    >
                      <current.icon className="h-5 w-5" strokeWidth={2} style={{ color: current.tint }} />
                    </div>
                    <div>
                      <span
                        className="text-[11px] font-medium uppercase tracking-widest"
                        style={{ color: current.tint }}
                      >
                        Step {active + 1}
                      </span>
                      <h3 className="text-xl font-semibold leading-tight text-foreground">
                        {current.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {current.blurb}
                  </p>

                  {current.body}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 text-center text-sm text-muted-foreground"
        >
          Track how AI recommendations change over time as your firm improves its visibility.
        </motion.p>
      </div>
    </section>
  );
}
