import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function Layout({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background glow — matches website */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />

      {/* Navbar — transparent → frosted glass on scroll, matches website */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo — links to website root */}
          <a href="/" className="flex items-center">
            <img
              src={`${import.meta.env.BASE_URL}images/logo-full.png`}
              alt="Clientory — AI Visibility for Professional Services"
              className="h-8 block dark:hidden"
              loading="eager"
            />
            <img
              src={`${import.meta.env.BASE_URL}images/logo-dark-bg.png`}
              alt="Clientory — AI Visibility for Professional Services"
              className="h-8 hidden dark:block"
              loading="eager"
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/settings/billing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Billing
            </Link>
            <Link
              to="/scan"
              className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link
            to="/scan"
            className="md:hidden px-4 py-2 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-0 pt-16">
        {children}
      </main>

      {/* Footer — matches website pattern */}
      <footer className="border-t border-border py-10 mt-auto z-10">
        <div className="container max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="/">
            <img
              src={`${import.meta.env.BASE_URL}images/logo-full.png`}
              alt="Clientory"
              className="h-8 opacity-80 block dark:hidden"
              loading="lazy"
            />
            <img
              src={`${import.meta.env.BASE_URL}images/logo-dark-bg.png`}
              alt="Clientory"
              className="h-8 opacity-80 hidden dark:block"
              loading="lazy"
            />
          </a>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/settings/billing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Billing
            </Link>
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Website
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Clientory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
