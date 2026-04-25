import { useState, useRef } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle2, XCircle, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const IMPORT_TYPES = [
  "Parts Master", "Inventory Quantities", "Suppliers", "Customers",
  "Supplier Price Lists", "Customer Price Lists", "Purchase Orders",
  "Sales Orders", "Customer Invoices", "Supplier Bills", "Bank Transactions",
  "Chart of Accounts", "Payroll Employees", "Stocktake Counts",
  "Opening Balances", "Attachments / Documents",
];

const IMPORT_MODES = ["Add New Records", "Update Existing", "Skip Duplicates", "Merge Duplicates", "Replace All (Admin Only)"];

const STEP_LABELS = ["Select Type", "Upload File", "Preview Data", "Validate", "Confirm Import", "Result"];

const DEMO_PREVIEW = [
  { part_number: "APP-ENG0042", name: "Oil Filter — Cat 3406", category: "engine", cost: 18.50, sell: 39.95, gst: "taxable" },
  { part_number: "APP-FLT0012", name: "Air Filter — Komatsu PC200", category: "filters", cost: 22.00, sell: 47.50, gst: "taxable" },
  { part_number: "APP-BRK0008", name: "Brake Pad Set — Volvo FH", category: "brakes", cost: 85.00, sell: 168.00, gst: "taxable" },
];

const VALIDATION_RESULTS = [
  { row: 1, field: "part_number", status: "ok",      msg: "APP-ENG0042 — valid" },
  { row: 1, field: "cost",        status: "ok",      msg: "$18.50 — valid" },
  { row: 2, field: "category",    status: "warning", msg: "Category 'filters' not in master list — will create" },
  { row: 3, field: "sell",        status: "error",   msg: "Margin below minimum 25% — blocked" },
];

const StatusBadge = ({ status }) => {
  const cls = { ok: "text-primary", warning: "text-yellow-400", error: "text-red-400" }[status] || "text-white/40";
  const Icon = { ok: CheckCircle2, warning: AlertTriangle, error: XCircle }[status] || FileText;
  return <span className={`flex items-center gap-1 text-[10px] font-heading uppercase ${cls}`}><Icon className="w-3 h-3" />{status}</span>;
};

export default function ImportCentre() {
  const [step, setStep] = useState(0);
  const [importType, setImportType] = useState("");
  const [importMode, setImportMode] = useState("Add New Records");
  const [dryRun, setDryRun] = useState(true);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFileName(f.name); setStep(2); }
  };

  const runImport = () => {
    setImporting(true);
    setTimeout(() => { setImporting(false); setDone(true); setStep(5); }, 1500);
  };

  const reset = () => { setStep(0); setImportType(""); setFileName(""); setDone(false); };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Import Centre</h2>
        <Button variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60 hover:text-white">
          <Download className="w-3.5 h-3.5 mr-1" /> Download Template
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex gap-0 overflow-x-auto">
        {STEP_LABELS.map((l, i) => (
          <div key={l} className="flex items-center flex-1 min-w-[80px]">
            <div className={`flex flex-col items-center gap-1 flex-1 ${i <= step ? "text-primary" : "text-white/20"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-bold border-2 ${i < step ? "bg-primary border-primary text-black" : i === step ? "border-primary text-primary" : "border-[hsl(0,0%,25%)]"}`}>{i + 1}</div>
              <span className="text-[9px] font-heading uppercase tracking-wider text-center">{l}</span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className={`h-px flex-1 mx-1 mb-4 ${i < step ? "bg-primary" : "bg-[hsl(0,0%,20%)]"}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Select Type */}
      {step === 0 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Step 1 — Select Import Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {IMPORT_TYPES.map(t => (
              <button key={t} onClick={() => setImportType(t)}
                className={`px-3 py-2.5 rounded-sm text-left text-xs border transition-all ${importType === t ? "bg-primary/10 border-primary text-primary" : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/60 hover:border-white/30 hover:text-white"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-2 block">Import Mode</label>
              <Select value={importMode} onValueChange={setImportMode}>
                <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                  {IMPORT_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <button onClick={() => setDryRun(d => !d)}
                  className={`w-9 h-5 rounded-full transition-all relative ${dryRun ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${dryRun ? "left-4" : "left-0.5"}`} />
                </button>
                <span className="text-xs text-white/60 font-heading uppercase tracking-wider">Dry-Run (Validate Only)</span>
              </label>
            </div>
          </div>
          <Button onClick={() => importType && setStep(1)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            Continue →
          </Button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Step 2 — Upload File — {importType}</h3>
          <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-[hsl(0,0%,25%)] rounded-sm p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-all">
            <Upload className="w-10 h-10 text-white/20" />
            <p className="text-white/40 text-sm">Click to upload or drag & drop</p>
            <p className="text-[10px] text-white/20 font-heading uppercase">CSV · XLSX · JSON · PDF</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json,.pdf" className="hidden" onChange={handleFile} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">← Back</Button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Step 3 — Preview Data — {fileName}</h3>
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["Part Number","Name","Category","Cost","Sell","GST"].map(h => <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {DEMO_PREVIEW.map((r, i) => (
                  <tr key={i} className="hover:bg-[hsl(0,0%,12%)]">
                    <td className="px-4 py-2 text-primary font-mono text-[11px]">{r.part_number}</td>
                    <td className="px-4 py-2 text-white">{r.name}</td>
                    <td className="px-4 py-2 text-white/50">{r.category}</td>
                    <td className="px-4 py-2 text-white/50">${r.cost.toFixed(2)}</td>
                    <td className="px-4 py-2 text-white/50">${r.sell.toFixed(2)}</td>
                    <td className="px-4 py-2 text-white/50">{r.gst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-white/30 font-heading uppercase">3 rows detected · Supports up to 50,000 rows</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">← Back</Button>
            <Button onClick={() => setStep(3)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">Validate Data →</Button>
          </div>
        </div>
      )}

      {/* Step 3: Validate */}
      {step === 3 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Step 4 — Validation Results</h3>
          <div className="flex gap-3">
            <div className="flex-1 p-3 bg-primary/5 border border-primary/20 rounded-sm text-center"><div className="font-heading text-xl text-primary font-bold">2</div><div className="text-[10px] text-white/30 font-heading uppercase">Passed</div></div>
            <div className="flex-1 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm text-center"><div className="font-heading text-xl text-yellow-400 font-bold">1</div><div className="text-[10px] text-white/30 font-heading uppercase">Warnings</div></div>
            <div className="flex-1 p-3 bg-red-500/5 border border-red-500/20 rounded-sm text-center"><div className="font-heading text-xl text-red-400 font-bold">1</div><div className="text-[10px] text-white/30 font-heading uppercase">Errors</div></div>
          </div>
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["Row","Field","Status","Message"].map(h => <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {VALIDATION_RESULTS.map((r, i) => (
                  <tr key={i} className={`hover:bg-[hsl(0,0%,12%)] ${r.status === "error" ? "bg-red-500/5" : r.status === "warning" ? "bg-yellow-500/5" : ""}`}>
                    <td className="px-4 py-2 text-white/40">{r.row}</td>
                    <td className="px-4 py-2 text-white/60 font-mono">{r.field}</td>
                    <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2 text-white/60">{r.msg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-sm text-[11px] text-red-400">⚠ 1 error found — Row 3 will be skipped. Proceed to import valid rows only or fix errors and re-upload.</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">← Back</Button>
            <Button variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50"><Download className="w-3.5 h-3.5 mr-1" />Error Report</Button>
            <Button onClick={() => setStep(4)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">Confirm Import →</Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Step 5 — Confirm Import</h3>
          <div className="space-y-2 text-sm">
            {[["Import Type", importType], ["Mode", importMode], ["File", fileName], ["Valid Rows", "2 of 3"], ["Errors", "1 row skipped"], ["Dry-Run", dryRun ? "Yes — No data will be written" : "No — Data will be saved"]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-[hsl(0,0%,15%)]">
                <span className="text-[10px] font-heading uppercase tracking-wider text-white/30">{k}</span>
                <span className="text-xs text-white">{v}</span>
              </div>
            ))}
          </div>
          {dryRun && <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-sm text-[11px] text-blue-400">Dry-Run mode — data will be validated only, not saved to the database.</div>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">← Back</Button>
            <Button onClick={runImport} disabled={importing} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              {importing ? "Importing..." : "Confirm Import"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Result */}
      {step === 5 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <h3 className="font-heading text-lg uppercase tracking-wider text-primary">Import {dryRun ? "Validation" : "Complete"}</h3>
          <p className="text-white/50 text-sm">2 records {dryRun ? "validated" : "imported"} successfully · 1 row skipped</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50"><RotateCcw className="w-3.5 h-3.5 mr-1" />Rollback Import</Button>
            <Button variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50"><Download className="w-3.5 h-3.5 mr-1" />Import Report</Button>
            <Button onClick={reset} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">New Import</Button>
          </div>
        </div>
      )}
    </div>
  );
}