import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import ScanForm from "@/pages/scan-form";
import FirmPrompts from "@/pages/firm-prompts";
import ScanProgress from "@/pages/scan-progress";
import ScanResults from "@/pages/scan-results";
import Pricing from "@/pages/pricing";
import BillingSettings from "@/pages/billing-settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<ScanForm />} />
            <Route path="/firm/:id/prompts" element={<FirmPrompts />} />
            <Route path="/scan/:id/progress" element={<ScanProgress />} />
            <Route path="/scan/:id/results" element={<ScanResults />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/settings/billing" element={<BillingSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
