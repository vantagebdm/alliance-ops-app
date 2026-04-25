import { useState } from "react";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOURCE_SYSTEMS = [
  { id: "xero",       label: "Xero",              logo: "X",  color: "bg-blue-600" },
  { id: "myob",       label: "MYOB",              logo: "M",  color: "bg-yellow-600" },
  { id: "quickbooks", label: "QuickBooks",         logo: "QB", color: "bg-green-700" },
  { id: "excel",      label: "Excel / CSV Legacy", logo: "E",  color: "bg-primary" },
  { id: "prev_erp",   label: "Previous ERP Export",logo: "P", color: "bg-purple-700" },
];

const MODULES = [
  "Chart of Accounts", "Contacts (Suppliers & Customers)",
  "Customer Invoices", "Supplier Bills", "Bank Transactions",
  "Inventory Opening Balances", "Opening Balances",
  "Payroll Employee List", "Historical Sales", "Historical Purchases",
];

const STEP_LABELS = ["Source System", "Upload File", "Select Modules", "Map Fields", "Validate", "Confirm", "Result"];

export default function MigrationTools() {
  const [step, setStep] = useState(0);
  const [source, setSource] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [migrating, setMigrating] = useState(false);

  const toggleModule = (m) => setSelectedModules(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const handleMigrate = () => {
    setMigrating(true);
    setTimeout(() => { setMigrating(false); setStep(6); }, 1800);
  };

  const reset = () => { setStep(0); setSource(null); setFileName(""); setSelectedModules([]); };

  return (
    <div className="space-y-4 max-w-4xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Migration Tools</h2>

      <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400 font-heading uppercase">⚠ Migration is a one-way operation. Always create a backup before migrating. Opening balance date will be locked after migration.</p>
      </div>

      {/* Stepper */}
      <div className="flex gap-0 overflow-x-auto">
        {STEP_LABELS.map((l, i) => (
          <div key={l} className="flex items-center flex-1 min-w-[60px]">
            <div className={`flex flex-col items-center gap-1 flex-1 ${i <= step ? "text-primary" : "text-white/20"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-heading font-bold border-2 ${i < step ? "bg-primary border-primary text-black" : i === step ? "border-primary text-primary" : "border-[hsl(0,0%,25%)]"}`}>{i + 1}</div>
              <span className="text-[9px] font-heading uppercase tracking-wider text-center leading-tight">{l}</span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className={`h-px flex-1 mx-1 mb-4 ${i < step ? "bg-primary" : "bg-[hsl(0,0%,20%)]"}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Source */}
      {step === 0 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Step 1 — Select Source System</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SOURCE_SYSTEMS.map(s => (
              <button key={s.id} onClick={() => setSource(s)}
                className={`p-4 rounded-sm border text-left transition-all flex items-center gap-3 ${source?.id === s.id ? "bg-primary/10 border-primary" : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] hover:border-white/30"}`}>
                <div className={`w-9 h-9 rounded-sm ${s.color} flex items-center justify-center text-white text-xs font-heading font-bold`}>{s.logo}</div>
                <span className={`text-xs font-heading uppercase tracking-wider ${source?.id === s.id ? "text-primary" : "text-white/60"}`}>{s.label}</span>
              </button>
            ))}
          </div>
          <Button onClick={() => source && setStep(1)} disabled={!source}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            Continue →
          </Button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Step 2 — Upload {source?.label} Export File</h3>
          <div onClick={() => { setFileName(`${source?.label}-export.csv`); setStep(2); }}
            className="border-2 border-dashed border-[hsl(0,0%,25%)] rounded-sm p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-all">
            <Upload className="w-10 h-10 text-white/20" />
            <p className="text-white/40 text-sm">Click to upload your {source?.label} export file</p>
            <p className="text-[10px] text-white/20 font-heading uppercase">CSV · XLSX · JSON · XML</p>
          </div>
          <Button variant="outline" onClick={() => setStep(0)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">← Back</Button>
        </div>
      )}

      {/* Step 2: Modules */}
      {step === 2 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Step 3 — Select Modules to Migrate</h3>
          <div className="grid grid-cols-2 gap-2">
            {MODULES.map(m => (
              <button key={m} onClick={() => toggleModule(m)}
                className={`px-3 py-2.5 rounded-sm text-left text-xs border transition-all ${selectedModules.includes(m) ? "bg-primary/10 border-primary text-primary" : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/60 hover:border-white/30 hover:text-white"}`}>
                {selectedModules.includes(m) ? "✓ " : ""}{m}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">← Back</Button>
            <Button onClick={() => selectedModules.length && setStep(3)} disabled={!selectedModules.length}
              className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              Map Fields →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3-5: Map, Validate, Confirm (simplified) */}
      {[3, 4, 5].includes(step) && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">
            {step === 3 ? "Step 4 — Field Mapping (Auto-detected)" : step === 4 ? "Step 5 — Validation" : "Step 6 — Confirm Migration"}
          </h3>
          {step === 3 && (
            <div className="space-y-2">
              {["account_code → GL Code", "contact_name → Supplier / Customer Name", "amount → Invoice Total", "date → Transaction Date", "reference → Document Reference"].map(m => (
                <div key={m} className="flex items-center gap-2 text-xs text-white/60 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,20%)] rounded-sm px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> {m}
                </div>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-2">
              {[["Records found", "1,284"], ["Valid records", "1,271"], ["Warnings", "11"], ["Errors", "2"]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[hsl(0,0%,15%)]">
                  <span className="text-[10px] font-heading uppercase text-white/30">{k}</span>
                  <span className="text-xs text-white">{v}</span>
                </div>
              ))}
              <div className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-sm text-[10px] text-yellow-400">11 warnings — migration will proceed, skipping 2 error rows</div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-2">
              {[["Source", source?.label], ["File", fileName], ["Modules", selectedModules.join(", ")], ["Valid Records", "1,271"], ["Opening Balance Lock", "Will be locked on confirm"]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[hsl(0,0%,15%)]">
                  <span className="text-[10px] font-heading uppercase text-white/30">{k}</span>
                  <span className="text-xs text-white">{v}</span>
                </div>
              ))}
              <div className="p-2 bg-red-500/5 border border-red-500/20 rounded-sm text-[10px] text-red-400">This will import 1,271 records. This action cannot be undone without a restore.</div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">← Back</Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">Continue →</Button>
            ) : (
              <Button onClick={handleMigrate} disabled={migrating} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
                {migrating ? "Migrating..." : "Confirm Migration"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 6: Result */}
      {step === 6 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <h3 className="font-heading text-lg uppercase tracking-wider text-primary">Migration Complete</h3>
          <p className="text-white/50 text-sm">1,271 records migrated from {source?.label} · Opening balance date locked · Migration report generated</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">Download Report</Button>
            <Button onClick={reset} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">New Migration</Button>
          </div>
        </div>
      )}
    </div>
  );
}