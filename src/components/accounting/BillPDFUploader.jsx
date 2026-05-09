import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postBillToLedger } from "@/lib/accountingLedger";

export default function BillPDFUploader({ onBillsCreated, onClose }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | extracting | done | error
  const [results, setResults] = useState([]); // array of { bill, status, error }
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setResults([]);
      setStatus("idle");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const process = async () => {
    if (!file) return;
    setStatus("uploading");
    setResults([]);

    // Upload PDF
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    setStatus("extracting");

    // Call backend to extract bills from each page
    const res = await base44.functions.invoke("extractBillsFromPDF", { file_url });
    const bills = res.data?.bills || [];

    if (!bills.length) {
      setStatus("error");
      setResults([{ error: "No bill data could be extracted from the PDF." }]);
      return;
    }

    // Create each bill in the DB
    const created = [];
    for (const billData of bills) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const lines = (billData.lines || []).map(l => {
          const total = (l.quantity || 1) * (l.unit_price || 0);
          const gst_amount = l.gst_treatment === "taxable" ? total / 11 : 0;
          return { ...l, gst_amount, total };
        });
        const subtotal = lines.reduce((s, l) => s + l.total, 0);
        const gst_total = lines.reduce((s, l) => s + l.gst_amount, 0);

        const bill = await base44.entities.SupplierBill.create({
          supplier_name: billData.supplier_name || "",
          supplier_invoice_number: billData.supplier_invoice_number || "",
          bill_date: billData.bill_date || today,
          due_date: billData.due_date || "",
          lines,
          subtotal,
          gst_total,
          total: subtotal,
          balance_due: subtotal,
          notes: billData.notes || "",
          status: "draft",
        });
        await postBillToLedger(bill);
        created.push({ bill, status: "created" });
      } catch (err) {
        created.push({ billData, status: "error", error: err.message });
      }
    }

    setResults(created);
    setStatus("done");
    if (created.some(r => r.status === "created")) {
      onBillsCreated && onBillsCreated();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-xl">
        {/* Header */}
        <div className="border-b border-border px-6 py-3 flex justify-between items-center">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Upload Supplier Bills (PDF)</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-primary/5" : file ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-white/5"
            }`}
          >
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-primary" />
                <p className="font-heading text-xs uppercase tracking-wider text-primary">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="font-heading text-xs uppercase tracking-wider text-foreground">Drop PDF here or click to browse</p>
                <p className="text-[10px] text-muted-foreground">Supports multi-page PDFs — each page = one bill</p>
              </div>
            )}
          </div>

          {/* Status */}
          {status === "uploading" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Uploading PDF...
            </div>
          )}
          {status === "extracting" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Scanning pages and extracting bill data with AI...
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Results</p>
              {results.map((r, i) => (
                <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-sm text-xs border ${
                  r.status === "created" ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-red-500/5 border-red-500/20 text-red-400"
                }`}>
                  {r.status === "created"
                    ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  }
                  <span>
                    {r.status === "created"
                      ? `Bill created — ${r.bill.supplier_name || "Unknown Supplier"} · ${r.bill.supplier_invoice_number || "No Inv #"} · $${(r.bill.total || 0).toFixed(2)}`
                      : (r.error || "Failed to create bill")
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">
            {status === "done" ? "Close" : "Cancel"}
          </Button>
          {status !== "done" && (
            <Button
              size="sm"
              onClick={process}
              disabled={!file || status === "uploading" || status === "extracting"}
              className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm"
            >
              {status === "uploading" || status === "extracting"
                ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Processing...</>
                : <><Upload className="w-3.5 h-3.5 mr-1" /> Extract & Create Bills</>
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}