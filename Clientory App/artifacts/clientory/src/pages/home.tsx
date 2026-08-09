import { MotionConfig } from "framer-motion";
import { MarketingLayout } from "@/components/marketing-layout";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import { JsonLd, SeoMeta } from "@/components/SeoMeta";
import { BILLING_CONFIG } from "@/lib/billing-config";

const title = "Clientory | AI Visibility for Immigration Law Firms";
const description =
  "See whether ChatGPT, Claude, and Gemini recommend your immigration law firm. Run a free AI visibility report with no credit card required.";

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://clientory.org/#organization",
      name: "Clientory",
      url: "https://clientory.org/",
      logo: "https://clientory.org/images/logo-full.png",
      description:
        "AI visibility monitoring for independent immigration law firms.",
      foundingDate: "2026",
      areaServed: "United States",
      sameAs: ["https://github.com/lishangyanyan1992/clientory-ai-visibility-skill"],
    },
    {
      "@type": "WebSite",
      "@id": "https://clientory.org/#website",
      name: "Clientory",
      url: "https://clientory.org/",
      publisher: { "@id": "https://clientory.org/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://clientory.org/#software",
      name: "Clientory",
      url: "https://app.clientory.org",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description,
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Independent immigration law firms",
      },
      offers: {
        "@type": "Offer",
        price: String(BILLING_CONFIG.monthlyPriceUsd),
        priceCurrency: "USD",
        description: "One free report, then an optional one-month free trial before the monthly subscription begins.",
        url: "https://clientory.org/pricing",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <SeoMeta title={title} description={description} path="/" />
      <JsonLd data={homeSchema} />
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
