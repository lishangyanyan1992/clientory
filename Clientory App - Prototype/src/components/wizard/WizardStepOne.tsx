import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScanFormData } from "@/components/ScanWizard";

interface Props {
  form: ScanFormData;
  updateForm: (partial: Partial<ScanFormData>) => void;
  canProceed: boolean;
  onNext: () => void;
}

const COMPANY_TYPE_LABELS: Record<string, string> = {
  law_firm: "Law Firm",
  accounting_firm: "Accounting Firm",
  marketing_agency: "Marketing Agency",
  consulting_firm: "Consulting Firm",
  other: "Other",
};

const WizardStepOne = ({ form, canProceed, onNext }: Props) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="w-full max-w-lg"
  >
    <h2 className="text-2xl font-bold text-foreground mb-1">Business Basics</h2>
    <p className="text-muted-foreground mb-8">Pre-filled for the demo. Click next to continue.</p>

    <div className="space-y-5">
      <div>
        <Label>Business Name</Label>
        <Input value={form.business_name} readOnly className="mt-1.5 bg-secondary/50 cursor-default" />
      </div>
      <div>
        <Label>Company Website</Label>
        <Input value={form.website} readOnly className="mt-1.5 bg-secondary/50 cursor-default" />
      </div>
      <div>
        <Label>Company Type</Label>
        <div className="mt-1.5">
          <Badge variant="secondary" className="text-sm py-1.5 px-3">{COMPANY_TYPE_LABELS[form.company_type] || form.company_type}</Badge>
        </div>
      </div>
      <div>
        <Label>City / Location</Label>
        <Input value={form.location} readOnly className="mt-1.5 bg-secondary/50 cursor-default" />
      </div>
    </div>

    <Button className="w-full mt-8 gap-2" size="lg" disabled={!canProceed} onClick={onNext}>
      Next Step
      <ArrowRight className="h-4 w-4" />
    </Button>
  </motion.div>
);

export default WizardStepOne;
