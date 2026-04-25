import { useState } from "react";
import { Download, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const EXPORT_MODULES = [
  { group: "Parts & Inventory", items: ["Parts Master", "Inventory", "Stocktake", "Stock Movements"] },
  { group: "Suppliers & Customers", items: ["Suppliers", "Customers", "Customer Price Lists"] },
  { group: "Sales", items: ["Quotes", "Sales Orders", "Customer Invoices", "Dispatches"] },
  { group: "Purchasing", items: ["Purchase Orders", "Supplier Bills", "Receive Stock"] },
  { group: "Accounting", items: ["Chart of Accounts", "General Ledger", "Journals", "Payments", "Bank Transactions", "Profit & Loss", "Balance Sheet", "BAS Summary", "GST Report"] },
  { group: "Payroll", items: ["Payroll Summary", "Employee List", "Pay Runs"] },
  { group: "Admin & Security", items: ["User List", "Role Permissions", "Audit Logs", "Security Logs", "Import / Export History"] },
];

const SENSITIVE = new Set(["Payroll Summary", "Employee List", "Pay Runs", "BAS Summary", "GST Report", "Bank Transactions", "Suppliers", "User List", "Security Logs"]);

const FORMATS = ["CSV", "XLSX", "PDF", "JSON"];

const Toggle = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <button onClick={() => onChange(!value)}
      className={`w-8 h-4 rounded-full transition-all relative ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? "left-4" : "left-0.5"}`} />
    </button>
    <span className="text-[10px] font-heading uppercase tracking-wider text-white/50">{label}</span>
  </label>
);

export default function ExportCentre() {
  const [selected, setSelected] = useState("");
  const [format, setFormat] = useState("CSV");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const isSensitive = SENSITIVE.has(selected);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setExported(true); setTimeout(() => setExported(false), 3000); }, 1200);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Export Centre</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Module selector */}
        <div className="lg:col-span-2 space-y-3">
          {EXPORT_MODULES.map(group => (
            <div key={group.group} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
              <div className="px-4 py-2 bg-[hsl(0,0%,9%)] border-b border-[hsl(0,0%,16%)]">
                <p className="font-heading text-[9px] uppercase tracking-widest text-white/30">{group.group}</p>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {group.items.map(item => (
                  <button key={item} onClick={() => setSelected(item)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                      selected === item
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/50 hover:text-white hover:border-white/30"
                    }`}>
                    {SENSITIVE.has(item) && <ShieldAlert className="w-3 h-3 text-yellow-400" />}
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-4">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Export Options</p>

            <div>
              <label className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-2 block">Format</label>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`py-1.5 rounded-sm text-[10px] font-heading uppercase border transition-all ${format === f ? "bg-primary/10 border-primary text-primary" : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/40"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-2 block">Date Range</label>
              <div className="space-y-2">
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <Toggle label="Include Inactive Records" value={includeInactive} onChange={setIncludeInactive} />
              <Toggle label="Include Archived Records" value={includeArchived} onChange={setIncludeArchived} />
              <Toggle label="Include Attachments" value={includeAttachments} onChange={setIncludeAttachments} />
            </div>

            {isSensitive && (
              <div className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
                <p className="text-[10px] text-yellow-400 font-heading uppercase">⚠ Sensitive Export — MFA may be required</p>
              </div>
            )}

            {!selected && (
              <div className="p-2 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] rounded-sm">
                <p className="text-[10px] text-white/30 font-heading uppercase">Select a module to export</p>
              </div>
            )}

            {exported && (
              <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-primary font-heading uppercase">Export Complete</span>
              </div>
            )}

            <Button onClick={handleExport} disabled={!selected || exporting}
              className="w-full bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <Download className="w-3.5 h-3.5 mr-1" />
              {exporting ? "Exporting..." : `Export ${selected || "—"}`}
            </Button>
          </div>

          {/* Recent exports */}
          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/30 mb-3">Recent Exports</p>
            <div className="space-y-2">
              {[
                { name: "Parts Master", fmt: "CSV", user: "Admin", dt: "Today 09:14", rows: 1842 },
                { name: "Customers", fmt: "XLSX", user: "Sarah A", dt: "Yesterday", rows: 134 },
                { name: "Sales Orders", fmt: "PDF", user: "Admin", dt: "Apr 23", rows: 89 },
              ].map((ex, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[hsl(0,0%,15%)] last:border-0">
                  <div>
                    <div className="text-[11px] text-white">{ex.name}</div>
                    <div className="text-[10px] text-white/30">{ex.user} · {ex.dt} · {ex.rows} rows</div>
                  </div>
                  <span className="text-[10px] font-heading uppercase text-white/30 border border-[hsl(0,0%,22%)] px-2 py-0.5 rounded-sm">{ex.fmt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}