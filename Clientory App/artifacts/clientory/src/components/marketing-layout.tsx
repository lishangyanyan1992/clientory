import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
