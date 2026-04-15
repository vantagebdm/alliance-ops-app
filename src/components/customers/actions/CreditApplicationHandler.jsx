import { useState } from "react";
import { X, Download, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreditAppGenerator from "./CreditAppGenerator";
import CreditAppUploadExtract from "./CreditAppUploadExtract";

export default function CreditApplicationHandler({ customer, onClose, onUpdated }) {
  const [mode, setMode] = useState(null); // "generate" | "upload" | null

  if (mode === "generate") {
    return <CreditAppGenerator customer={customer} onClose={() => setMode(null)} onGenerated={onUpdated} />;
  }

  if (mode === "upload") {
    return <CreditAppUploadExtract customer={customer} onClose={() => setMode(null)} onExtracted={onUpdated} />;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-sm max-w-md w-full mx-4 shadow-2xl">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Credit Application</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Choose an action:</p>

          <Button
            onClick={() => setMode("generate")}
            className="w-full bg-primary hover:bg-primary/90 text-black rounded-sm font-heading text-xs uppercase tracking-wider justify-start gap-2"
          >
            <Download className="w-4 h-4" /> Generate New Application
          </Button>

          <Button
            onClick={() => setMode("upload")}
            variant="outline"
            className="w-full rounded-sm font-heading text-xs uppercase tracking-wider justify-start gap-2"
          >
            <UploadIcon className="w-4 h-4" /> Upload Completed Application
          </Button>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full rounded-sm font-heading text-xs uppercase tracking-wider">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}