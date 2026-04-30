import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function PDFRegenerationTool() {
  const [regenerating, setRegenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke("regenerateDocumentPDFs", {
        documentType: "invoices"
      });
      setResult(response.data);
    } catch (err) {
      setError(err.message || "Failed to regenerate PDFs");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <h3 className="font-heading text-sm font-bold uppercase tracking-wider mb-4">Regenerate Document PDFs</h3>
      <p className="text-xs text-muted-foreground mb-6">
        Update all existing invoices, quotes, sales orders, and purchase orders with the new standardized PDF format (logo, black header, banking details).
      </p>

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-sm p-4 mb-4">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-heading text-xs uppercase tracking-wider text-red-400">Error</p>
            <p className="text-xs text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-sm p-4 mb-4">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-heading text-xs uppercase tracking-wider text-green-400">Success</p>
            <p className="text-xs text-green-300 mt-1">
              Updated: {result.updated} | Failed: {result.failed}
            </p>
            <p className="text-xs text-green-300/70 mt-2">{result.message}</p>
          </div>
        </div>
      )}

      <Button
        onClick={handleRegenerate}
        disabled={regenerating}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-sm font-heading text-xs uppercase tracking-wider"
      >
        {regenerating ? (
          <>
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            Regenerating...
          </>
        ) : (
          "Regenerate All PDFs"
        )}
      </Button>
    </div>
  );
}