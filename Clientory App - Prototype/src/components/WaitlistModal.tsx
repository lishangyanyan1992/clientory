import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WaitlistModal = ({ open, onOpenChange }: WaitlistModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !businessName || !website) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("beta_leads").insert({
        name,
        email,
        business_name: businessName,
        website,
        linkedin: linkedin || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("You're on the beta list!");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!open) return;
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setBusinessName("");
      setWebsite("");
      setLinkedin("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{submitted ? "You're on the beta list!" : "Join the Clientory Beta"}</DialogTitle>
          <DialogDescription>
            {submitted
              ? "We'll reach out soon with early access details."
              : "Get early access to AI visibility tracking, implementation agents, GEO monitoring, and more."}
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="flex flex-col items-center py-6">
            <div className="h-12 w-12 rounded-full bg-score-good/10 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-score-good" />
            </div>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5" />
            </div>
            <div>
              <Label>Work Email <span className="text-destructive">*</span></Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="mt-1.5" />
            </div>
            <div>
              <Label>Business Name <span className="text-destructive">*</span></Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your company" className="mt-1.5" />
            </div>
            <div>
              <Label>Website <span className="text-destructive">*</span></Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcompany.com" className="mt-1.5" />
            </div>
            <div>
              <Label>LinkedIn <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className="mt-1.5" />
            </div>
            <Button className="w-full" disabled={!name || !email || !businessName || !website || loading} onClick={handleSubmit}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Join the Beta Waitlist
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
