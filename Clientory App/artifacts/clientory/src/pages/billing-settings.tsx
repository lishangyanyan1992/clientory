import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreditCard, Check, AlertCircle, Clock, Zap, Building2, ArrowRight } from "lucide-react";
import { listBusinesses, subscribeBusiness, createBillingPortal } from "@workspace/api-client-react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { BILLING_CONFIG, BILLING_PRICE_LABEL, BILLING_SCANS_LABEL } from "@/lib/billing-config";

function getEmailToken(): string | null {
  return localStorage.getItem("emailToken");
}

interface BusinessWithBilling {
  id: string;
  name: string;
  businessType: string;
  location: string;
  subscription: {
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  usage: {
    scansUsed: number;
    scansLimit: number;
    periodEnd: string;
  } | null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-medium">
        <Check className="w-3 h-3" /> Active
      </span>
    );
  }
  if (status === "past_due") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs font-medium">
        <AlertCircle className="w-3 h-3" /> Past Due
      </span>
    );
  }
  if (status === "canceled") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium">
        <AlertCircle className="w-3 h-3" /> Canceled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
      Free
    </span>
  );
}

export default function BillingSettings() {
  const [businesses, setBusinesses] = useState<BusinessWithBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [manageLoading, setManageLoading] = useState(false);
  const navigate = useNavigate();

  const emailToken = getEmailToken();

  useEffect(() => {
    if (!emailToken) {
      setLoading(false);
      return;
    }

    listBusinesses({ headers: { "x-email-token": emailToken } })
      .then((data) => {
        setBusinesses((data.businesses as BusinessWithBilling[]) ?? []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load businesses. Please verify your email first.");
      })
      .finally(() => setLoading(false));
  }, [emailToken]);

  const handleSubscribe = async (businessId: string) => {
    if (!emailToken) return;
    setSubscribingId(businessId);
    try {
      const result = await subscribeBusiness(
        { businessId },
        { headers: { "x-email-token": emailToken } },
      );
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to start subscription. Please try again.");
    } finally {
      setSubscribingId(null);
    }
  };

  const handleManageBilling = async () => {
    if (!emailToken) return;
    setManageLoading(true);
    try {
      const result = await createBillingPortal({ headers: { "x-email-token": emailToken } });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to open billing portal. Please try again.");
    } finally {
      setManageLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Billing & Subscriptions</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Manage your business subscriptions and scan allowances.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {!emailToken ? (
            <div className="text-center py-16 border border-border rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sign in to view billing</h2>
              <p className="text-muted-foreground mb-6">Verify your email to access billing settings.</p>
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-16 border border-border rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No businesses yet</h2>
              <p className="text-muted-foreground mb-6">
                Run your first scan to create a business profile, then subscribe for ongoing monitoring.
              </p>
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white"
              >
                Scan Your Business <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => {
                const subPeriodEnd = business.subscription?.currentPeriodEnd
                  ? new Date(business.subscription.currentPeriodEnd)
                  : null;
                const isPaid =
                  !!business.subscription &&
                  !!subPeriodEnd &&
                  subPeriodEnd > new Date() &&
                  (business.subscription.status === "active" ||
                    business.subscription.status === "past_due" ||
                    business.subscription.status === "canceled");
                return (
                  <div key={business.id} className="border border-border rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{business.name}</h3>
                          <StatusBadge status={business.subscription?.status ?? "free"} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {business.businessType} · {business.location}
                        </p>
                      </div>

                      {isPaid ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleManageBilling}
                          disabled={manageLoading}
                          className="flex-shrink-0"
                        >
                          {manageLoading ? "Loading..." : "Manage Billing"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSubscribe(business.id)}
                          disabled={subscribingId === business.id}
                          className="flex-shrink-0 bg-gradient-to-r from-primary to-accent text-white"
                        >
                          {subscribingId === business.id ? "Loading..." : `Subscribe — $${BILLING_CONFIG.monthlyPriceUsd}/mo`}
                        </Button>
                      )}
                    </div>

                    {business.usage && (
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Scans this cycle</span>
                          <span className="text-sm font-semibold">
                            {business.usage.scansUsed} / {business.usage.scansLimit}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{
                              width: `${Math.min(100, (business.usage.scansUsed / business.usage.scansLimit) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Resets {format(new Date(business.usage.periodEnd), "MMMM d, yyyy")}
                        </div>
                      </div>
                    )}

                    {!business.usage && isPaid && (
                      <p className="text-sm text-muted-foreground">No active billing period found.</p>
                    )}

                    {!isPaid && !business.usage && (
                      <p className="text-sm text-muted-foreground">
                        Subscribe to unlock {BILLING_CONFIG.scansPerCycle} scans per month, report history, exports, and detailed recommendations.
                      </p>
                    )}

                    {business.subscription?.cancelAtPeriodEnd && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                        Cancels at end of period:{" "}
                        {format(new Date(business.subscription.currentPeriodEnd), "MMMM d, yyyy")}
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-border">
                <Button variant="outline" onClick={handleManageBilling} disabled={manageLoading} className="w-full">
                  {manageLoading ? "Loading..." : "Open Billing Portal"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 p-5 rounded-xl bg-muted/50 border border-border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Plan overview
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                1 free AI visibility report total
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                {BILLING_PRICE_LABEL} per business for ongoing monitoring
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                {BILLING_CONFIG.scansPerCycle} scans per billing cycle per business
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                Includes report history, exports, and full recommendations
              </li>
            </ul>
            <Link to="/pricing" className="text-sm text-primary hover:underline mt-3 inline-block">
              View full pricing details →
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
