import { useState } from "react";
import LandingHero from "@/components/LandingHero";
import ScanWizard from "@/components/ScanWizard";
import ResultsDashboard from "@/components/ResultsDashboard";
import { BusinessInfo, ScanResult } from "@/lib/scan-engine";

type View = "landing" | "wizard" | "results";

const Index = () => {
  const [view, setView] = useState<View>("landing");
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleScanComplete = (info: BusinessInfo, result: ScanResult) => {
    setBusinessInfo(info);
    setScanResult(result);
    setView("results");
  };

  if (view === "results" && businessInfo && scanResult) {
    return (
      <ResultsDashboard
        businessInfo={businessInfo}
        scanResult={scanResult}
        onBack={() => setView("landing")}
      />
    );
  }

  if (view === "wizard") {
    return <ScanWizard onComplete={handleScanComplete} onBack={() => setView("landing")} />;
  }

  return <LandingHero onStart={() => setView("wizard")} />;
};

export default Index;
