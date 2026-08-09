import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Fires a $pageview event whenever the route changes.
// Placed inside <BrowserRouter> so useLocation() is available.
function PostHogPageView() {
  const location = useLocation();
  const posthog = usePostHog();
  useEffect(() => {
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [location, posthog]);
  return null;
}

import Home from "@/pages/home";
import Pricing from "@/pages/pricing";
import About from "@/pages/about";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import GeoGuide from "@/pages/geo-guide";
import CompareOtterly from "@/pages/compare-otterly";
import ComparePeec from "@/pages/compare-peec";
import CompareSemrush from "@/pages/compare-semrush";
import CompareManualTesting from "@/pages/compare-manual-testing";
import { CLIENTORY_APP_URL } from "@/lib/app-url";

// Landing-page direction comps. Noindex, not linked from the site nav; delete
// the `pages/design` folder once a direction is picked.
import DesignIndex from "@/pages/design";
import DesignInstrument from "@/pages/design/instrument";
import DesignRollCall from "@/pages/design/rollcall";
import DesignNotice from "@/pages/design/notice";
import DesignTerritory from "@/pages/design/territory";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function SiteRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/geo-for-professional-services" element={<GeoGuide />} />
      <Route path="/clientory-vs-otterly" element={<CompareOtterly />} />
      <Route path="/clientory-vs-peec" element={<ComparePeec />} />
      <Route path="/clientory-vs-semrush-ai" element={<CompareSemrush />} />
      <Route path="/clientory-vs-manual-testing" element={<CompareManualTesting />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/scan/*" element={<ExternalAppRedirect />} />
      <Route path="/firm/*" element={<ExternalAppRedirect />} />
      <Route path="/settings/billing" element={<ExternalAppRedirect />} />
      <Route path="/_design" element={<DesignIndex />} />
      <Route path="/_design/instrument" element={<DesignInstrument />} />
      <Route path="/_design/rollcall" element={<DesignRollCall />} />
      <Route path="/_design/notice" element={<DesignNotice />} />
      <Route path="/_design/territory" element={<DesignTerritory />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <PostHogPageView />
        <SiteRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}

function ExternalAppRedirect() {
  useEffect(() => {
    window.location.replace(CLIENTORY_APP_URL);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="text-muted-foreground">
        Opening Clientory…{" "}
        <a className="text-primary underline" href={CLIENTORY_APP_URL}>
          Continue to the app
        </a>
      </p>
    </main>
  );
}

export default App;
