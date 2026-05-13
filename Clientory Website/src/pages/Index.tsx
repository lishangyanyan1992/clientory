import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Founders from "@/components/Founders";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
      <Founders />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
