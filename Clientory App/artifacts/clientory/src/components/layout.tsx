import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none -z-10" />

      <Navbar />

      <main className="relative z-0 flex flex-1 flex-col pt-28">
        {children}
      </main>

      <Footer />
    </div>
  );
}
