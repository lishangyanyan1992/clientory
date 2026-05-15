import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-sm shadow-primary/20">
              <Search className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Clientory</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link to="/settings/billing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Billing
            </Link>
            <Link to="/scan" className="px-4 py-2 text-sm font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-0">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-white/50 dark:bg-slate-950/50 py-8 mt-auto z-10">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Clientory — AI Visibility for Small Law Firms.
          </p>
        </div>
      </footer>
    </div>
  );
}
