import { useState } from "react";
import { X, Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function CreditAppGenerator({ customer, onClose, onGenerated }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      // Call backend function to generate credit app PDF with customer data
      const response = await base44.functions.invoke("generateCreditAppPDF", { customerId: customer.id });
      if (response.data?.download_url) {
        window.open(response.data.download_url, "_blank");
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const handleEmailToCustomer = async () => {
    setSending(true);
    try {
      // Generate PDF and email to customer
      const response = await base44.functions.invoke("generateCreditAppPDF", { customerId: customer.id, emailTo: customer.email });
      setSent(true);
      setTimeout(() => {
        onGenerated?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Email failed:", err);
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="bg-white rounded-sm p-8 max-w-sm text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground mb-1">Email Sent</h3>
          <p className="text-sm text-muted-foreground">Credit application sent to {customer.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-sm max-w-md w-full mx-4 shadow-2xl">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Generate Credit Application</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            A branded credit application PDF will be generated with {customer.name}'s information pre-filled.
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-sm p-3 text-xs text-foreground/70 mb-6">
            <strong>Pre-filled:</strong> Legal name, trading name, ABN, address, contact details, and billing information
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border space-y-3">
          <Button
            onClick={handleGeneratePDF}
            variant="outline"
            className="w-full rounded-sm font-heading text-xs uppercase tracking-wider justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button
            onClick={handleEmailToCustomer}
            disabled={sending}
            className="w-full bg-primary hover:bg-primary/90 text-black rounded-sm font-heading text-xs uppercase tracking-wider justify-center gap-2"
          >
            <Mail className="w-4 h-4" /> {sending ? "Sending..." : "Email to Customer"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full rounded-sm font-heading text-xs uppercase tracking-wider"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}