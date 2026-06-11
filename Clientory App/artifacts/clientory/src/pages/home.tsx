import { MotionConfig } from "framer-motion";
import { MarketingLayout } from "@/components/marketing-layout";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Clientory | AI Visibility for Immigration Law Firms</title>
        <meta
          name="description"
          content="Clientory helps small and mid-sized immigration law firms understand whether AI assistants recommend them for green cards, visas, naturalization, and removal defense."
        />
        <link rel="canonical" href="https://clientory.org/" />
      </Helmet>
      <MarketingLayout>
        {/* The design system is now global (see index.css). MotionConfig
            reducedMotion="user" makes the landing's entrance animations honor
            the OS "reduce motion" setting. */}
        <MotionConfig reducedMotion="user">
          <div className="bg-background text-foreground">
            <Hero />
            <div id="problem">
              <Problem />
            </div>
            <div id="how">
              <HowItWorks />
            </div>
            <div id="features">
              <Features />
            </div>
            <CTA />
          </div>
        </MotionConfig>
      </MarketingLayout>
    </>
  );
}
