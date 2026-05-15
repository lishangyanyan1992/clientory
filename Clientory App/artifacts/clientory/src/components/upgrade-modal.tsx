import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Zap, RotateCcw, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BILLING_CONFIG, BILLING_PRICE_LABEL, BILLING_SCANS_LABEL } from "@/lib/billing-config";

export type EntitlementCode =
  | "FREE_REPORT_ALREADY_USED"
  | "SUBSCRIPTION_REQUIRED"
  | "BUSINESS_PLAN_LIMIT_REACHED"
  | "SUBSCRIPTION_INACTIVE"
  | "BILLING_PERIOD_ENDED";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  entitlementCode: EntitlementCode | null;
  businessName?: string;
  periodEnd?: string | null;
  scansUsed?: number | null;
  scansLimit?: number | null;
}

function getContent(
  code: EntitlementCode | null,
  businessName: string | undefined,
  periodEnd: string | null | undefined,
  scansUsed: number | null | undefined,
  scansLimit: number | null | undefined,
) {
  const formattedDate = periodEnd ? format(new Date(periodEnd), "MMMM d, yyyy") : null;

  switch (code) {
    case "FREE_REPORT_ALREADY_USED":
      return {
        icon: <Lock className="w-10 h-10 text-primary" />,
        title: "Free report already used",
        description: `You've already used your free report${businessName ? ` for ${businessName}` : ""}. Subscribe to continue monitoring this business in AI search results.`,
        cta: `Subscribe — ${BILLING_PRICE_LABEL}`,
        ctaAction: "billing",
      };
    case "BUSINESS_PLAN_LIMIT_REACHED":
      return {
        icon: <RotateCcw className="w-10 h-10 text-primary" />,
        title: "Scan limit reached",
        description: `You've used ${scansUsed ?? 0} of ${scansLimit ?? BILLING_CONFIG.scansPerCycle} scans for this billing cycle${formattedDate ? `. Your scan allowance resets on ${formattedDate}` : ""}.`,
        cta: "Manage Billing",
        ctaAction: "billing",
      };
    case "SUBSCRIPTION_REQUIRED":
      return {
        icon: <Zap className="w-10 h-10 text-primary" />,
        title: "Subscription required",
        description: `A subscription is required to run scans for ${businessName ?? "this business"}. Subscribe for ${BILLING_PRICE_LABEL} to get ${BILLING_SCANS_LABEL} and full access to all features.`,
        cta: `Subscribe — ${BILLING_PRICE_LABEL}`,
        ctaAction: "billing",
      };
    case "SUBSCRIPTION_INACTIVE":
      return {
        icon: <CreditCard className="w-10 h-10 text-primary" />,
        title: "Subscription inactive",
        description: `Your subscription for ${businessName ?? "this business"} is no longer active. Reactivate to continue running scans.`,
        cta: "Manage Billing",
        ctaAction: "billing",
      };
    case "BILLING_PERIOD_ENDED":
      return {
        icon: <RotateCcw className="w-10 h-10 text-primary" />,
        title: "Billing period ended",
        description: `Your billing period has ended for ${businessName ?? "this business"}. Please check your billing settings to reactivate.`,
        cta: "Manage Billing",
        ctaAction: "billing",
      };
    default:
      return {
        icon: <Lock className="w-10 h-10 text-primary" />,
        title: "Upgrade required",
        description: "An active subscription is required to run this scan.",
        cta: "View Pricing",
        ctaAction: "pricing",
      };
  }
}

export function UpgradeModal({
  open,
  onClose,
  entitlementCode,
  businessName,
  periodEnd,
  scansUsed,
  scansLimit,
}: UpgradeModalProps) {
  const navigate = useNavigate();
  const content = getContent(entitlementCode, businessName, periodEnd, scansUsed, scansLimit);

  const handleCta = () => {
    onClose();
    if (content.ctaAction === "billing") {
      navigate("/settings/billing");
    } else {
      navigate("/pricing");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              {content.icon}
            </div>
          </div>
          <DialogTitle className="text-center text-xl">{content.title}</DialogTitle>
          <DialogDescription className="text-center mt-2">{content.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <Button
            onClick={handleCta}
            className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
          >
            {content.cta}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
