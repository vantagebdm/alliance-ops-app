import { useState } from "react";
import { Archive, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-start justify-between py-3 border-b border-[hsl(0,0%,14%)] last:border-0">
    <div className="flex-1 pr-4">
      <div className="text-xs font-heading uppercase tracking-wider text-white">{label}</div>
      {desc && <div className="text-[10px] text-white/30 mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 mt-0.5 ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

const ARCHIVE_RULES = [
  { id: "inactive_customers",  label: "Archive Inactive Customers",   desc: "Customers with no activity over threshold period" },
  { id: "inactive_suppliers",  label: "Archive Inactive Suppliers",   desc: "Suppliers with no orders over threshold period" },
  { id: "obsolete_parts",      label: "Archive Obsolete Parts",       desc: "Parts marked discontinued with zero stock" },
  { id: "old_quotes",          label: "Archive Old Quotes",           desc: "Quotes older than retention period" },
  { id: "old_sales_orders",    label: "Archive Old Sales Orders",     desc: "Completed orders beyond retention period" },
  { id: "old_pos",             label: "Archive Old Purchase Orders",  desc: "Completed POs beyond retention period" },
  { id: "old_audit_logs",      label: "Archive Old Audit Logs",       desc: "Audit logs older than retention period" },
  { id: "old_attachments",     label: "Archive Old Attachments",      desc: "Attachments older than retention period" },
];

const STATUS_COLORS = {
  Active:             "bg-green-500/10 text-green-400 border-green-500/20",
  Archived:           "bg-[hsl(0,0%,16%)] text-white/40 border-[hsl(0,0%,22%)]",
  "Pending Deletion": "bg-red-500/10 text-red-400 border-red-500/20",
  "Retained":         "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const DEMO_ARCHIVE = [
  { id: 1, type: "Customer",  name: "Pilbara Mining Co",       status: "Archived",  archived: "Jan 2026",  size: "12 records" },
  { id: 2, type: "Supplier",  name: "Old Parts Warehouse",     status: "Archived",  archived: "Feb 2026",  size: "4 records" },
  { id: 3, type: "Part",      name: "APP-ENG0001 (Legacy)",    status: "Archived",  archived: "Mar 2026",  size: "1 record" },
  { id: 4, type: "Quote",     name: "Q-00042, Q-00043",        status: "Archived",  archived: "Apr 2026",  size: "2 records" },
  { id: 5, type: "Audit Log", name: "System Audit Jan 2025",   status: "Retained",  archived: "Jan 2025",  size: "1,200 rows" },
];

export default function ArchiveRetention() {
  const [rules, setRules] = useState(Object.fromEntries(ARCHIVE_RULES.map(r => [r.id, true])));
  const [archivePeriod, setArchivePeriod] = useState("12");
  const [accountingYears, setAccountingYears] = useState("7");
  const [payrollYears, setPayrollYears] = useState("7");
  const [securityMonths, setSecurityMonths] = useState("24");
  const [saved, setSaved] = useState(false);

  const toggle = (id) => (v) => setRules(r => ({ ...r, [id]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Archive & Retention</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400 font-heading uppercase">⚠ Permanent deletion of accounting, BAS, payroll, or audit records requires Super Admin approval. Archive does not delete — it retains records in read-only mode.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Archive Rules */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)] flex items-center justify-between">
              <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Auto-Archive Rules</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30 font-heading uppercase">Inactive Period:</span>
                <Select value={archivePeriod} onValueChange={setArchivePeriod}>
                  <SelectTrigger className="w-28 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                    {["6", "12", "18", "24", "36"].map(v => <SelectItem key={v} value={v}>{v} months</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="px-4">
              {ARCHIVE_RULES.map(r => (
                <Toggle key={r.id} label={r.label} desc={r.desc} value={rules[r.id]} onChange={toggle(r.id)} />
              ))}
            </div>
          </div>

          {/* Archive History */}
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)]">
              <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Archive History</p>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["Type","Name","Archived","Records","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {DEMO_ARCHIVE.map(a => (
                  <tr key={a.id} className="hover:bg-[hsl(0,0%,11%)]">
                    <td className="px-4 py-2.5 text-white/50">{a.type}</td>
                    <td className="px-4 py-2.5 text-white">{a.name}</td>
                    <td className="px-4 py-2.5 text-white/40">{a.archived}</td>
                    <td className="px-4 py-2.5 text-white/40">{a.size}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${STATUS_COLORS[a.status] || ""}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <button className="px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-[hsl(0,0%,14%)] text-white/50 border border-[hsl(0,0%,22%)] hover:text-white">Restore</button>
                        <button className="px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Retention Settings */}
        <div className="space-y-3">
          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-4">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Retention Periods</p>
            {[
              { label: "Accounting Records", opts: ["5", "7", "10", "Indefinite"], val: accountingYears, set: setAccountingYears, unit: "years" },
              { label: "Payroll Records",    opts: ["5", "7", "10", "Indefinite"], val: payrollYears, set: setPayrollYears, unit: "years" },
              { label: "Security Logs",      opts: ["6", "12", "24", "36"],        val: securityMonths, set: setSecurityMonths, unit: "months" },
            ].map(r => (
              <div key={r.label}>
                <label className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-2 block">{r.label}</label>
                <Select value={r.val} onValueChange={r.set}>
                  <SelectTrigger className="w-full bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                    {r.opts.map(v => <SelectItem key={v} value={v}>{v === "Indefinite" ? v : `${v} ${r.unit}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-3">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Archive Status Types</p>
            {Object.entries(STATUS_COLORS).map(([s, cls]) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${cls}`}>{s}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-sm">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-heading uppercase font-bold">Permanent Deletion</span>
            </div>
            <p className="text-[10px] text-red-400/70">Requires Super Admin approval. Accounting, BAS, payroll and audit records cannot be permanently deleted without written approval record.</p>
          </div>
        </div>
      </div>
    </div>
  );
}