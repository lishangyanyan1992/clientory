import { motion } from "framer-motion";
import { ArrowRight, Search, BarChart3, FileText, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.png";

interface LandingHeroProps {
  onStart: () => void;
}

const LandingHero = ({ onStart }: LandingHeroProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <img src={logo} alt="Clientory" className="h-24" />
        </div>
        <Button variant="ghost" size="sm" onClick={onStart}>
          See How It Works
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6">
        <div className="max-w-3xl mx-auto text-center pt-16 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
              Interactive Demo
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            How <span className="text-gradient">Clientory</span> Works
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            See how Clientory analyzes your business visibility across LLMs.
            This interactive demo shows how the platform tests prompts, analyzes AI responses, and generates a visibility report.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" onClick={onStart} className="gap-2 text-base px-8 py-6 rounded-xl shadow-glow">
              See How It Works
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Capability Highlights */}
        <motion.div
          className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Test 50 AI Prompts</h3>
              <p className="text-sm text-muted-foreground">
                Clientory generates realistic prompts people ask AI assistants when searching for services like yours.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Score Across 4 AI Models</h3>
              <p className="text-sm text-muted-foreground mb-3">
                See how often your business appears in responses from major AI assistants.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {["Gemini", "ChatGPT", "Claude", "Perplexity"].map((name) => (
                  <span
                    key={name}
                    className="text-xs font-medium px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Get an Actionable Report</h3>
              <p className="text-sm text-muted-foreground">
                Receive insights and recommendations to improve your visibility in AI-generated answers.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Explanation */}
        <motion.div
          className="max-w-2xl w-full mx-auto text-center pb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="border-border bg-card/50">
            <CardContent className="pt-6 pb-6">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Play className="h-5 w-5 text-accent" />
              </div>
              <p className="text-muted-foreground mb-6">
                This experience demonstrates how Clientory evaluates your visibility in AI search.
                The demo simulates how the platform generates prompts, tests them across AI assistants, and calculates a visibility score.
              </p>
              <Button onClick={onStart} variant="outline" className="gap-2">
                See How It Works
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default LandingHero;
