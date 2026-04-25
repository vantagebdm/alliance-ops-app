import { useState } from "react";
import { Download, Search, Filter, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MODULE_COLORS = {
  "Company Profile":     "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Financial Settings":  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "GST & BAS":           "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Sales Settings":      "bg-green-500/10 text-green-400 border-green-500/20",
  "Purchasing":          "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Inventory":           "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Pricing & Margin":    "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Integrations":        "bg-red-500/10 text-red-400 border-red-500/20",
  "System Preferences":  "bg-[hsl(0,0%,16%)] text-white/40 border-[hsl(0,0%,22%)]",
  "Workflow":            "bg-primary/10 text-primary border-primary/20",
  "Branches":            "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Notifications":       "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Email Templates":     "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Document Defaults":   "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Freight":             "bg-lime-500/10 text-lime-400 border-lime-500/20",
};

const DEMO_LOGS = [
  { id: 1,  dt: "2026-04-25 09:00", user: "Admin User", role: "Super Admin", module: "Company Profile",    setting: "Trading Name",           old: "APP Parts", new_val: "Alliance Priority Parts", sensitive: false, approval: false, approved_by: "" },
  { id: 2,  dt: "2026-04-25 09:10", user: "Admin User", role: "Super Admin", module: "Financial Settings", setting: "Financial Year Start",    old: "January",   new_val: "July",                   sensitive: true,  approval: true,  approved_by: "Director" },
  { id: 3,  dt: "2026-04-25 09:20", user: "Admin User", role: "Super Admin", module: "GST & BAS",          setting: "BAS Frequency",          old: "Monthly",   new_val: "Quarterly",              sensitive: true,  approval: true,  approved_by: "Director" },
  { id: 4,  dt: "2026-04-25 09:30", user: "Sarah A",    role: "Accounts Mgr", module: "Sales Settings",   setting: "Max Discount",           old: "5%",        new_val: "10%",                    sensitive: false, approval: false, approved_by: "" },
  { id: 5,  dt: "2026-04-25 10:00", user: "Admin User", role: "Super Admin", module: "Integrations",       setting: "Email API Key",          old: "••••••",    new_val: "sg_live_••••",            sensitive: true,  approval: true,  approved_by: "Admin" },
  { id: 6,  dt: "2026-04-25 10:15", user: "Admin User", role: "Super Admin", module: "Pricing & Margin",   setting: "Minimum Margin",         old: "10%",       new_val: "15%",                    sensitive: false, approval: false, approved_by: "" },
  { id: 7,  dt: "2026-04-25 10:30", user: "Admin User", role: "Super Admin", module: "Workflow",           setting: "PO Approval",            old: "Disabled",  new_val: "Enabled",                sensitive: false, approval: false, approved_by: "" },
  { id: 8,  dt: "2026-04-25 11:00", user: "Mike P",     role: "Payroll Mgr", module: "Purchasing",         setting: "Supplier Terms",         old: "Net 14",    new_val: "Net 30",                  sensitive: false, approval: false, approved_by: "" },
  { id: 9,  dt: "2026-04-25 11:20", user: "Admin User", role: "Super Admin", module: "Branches",           setting: "Dampier Branch Added",   old: "—",         new_val: "Branch: DAM",             sensitive: false, approval: false, approved_by: "" },
  { id: 10, dt: "2026-04-24 15:00", user: "Admin User", role: "Super Admin", module: "Notifications",      setting: "Security Alert Channel", old: "In-App",    new_val: "In-App + Email",          sensitive: false, approval: false, approved_by: "" },
  { id: 11, dt: "2026-04-24 09:00", user: "Admin User", role: "Super Admin", module: "Email Templates",    setting: "Invoice Email Subject",  old: "Invoice",   new_val: "Invoice {{document_number}}", sensitive: false, approval: false, approved_by: "" },
  { id: 12, dt: "2026-04-23 08:00", user: "Admin User", role: "Super Admin", module: "Inventory",          setting: "Valuation Method",       old: "FIFO",      new_val: "Weighted Average",        sensitive: true,  approval: true,  approved_by: "Director" },
];

const MODULES = ["All Modules", ...Object.keys(MODULE_COLORS)];

export default function SettingsAuditLog() {
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("All Modules");
  const [sensitiveOnly, setSensitiveOnly] = useState(false);

  const filtered = DEMO_LOGS.filter(l => {
    const matchSearch = !search || [l.user, l.setting, l.module].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === "All Modules" || l.module === filterModule;
    const matchSensitive = !sensitiveOnly || l.sensitive;
    return matchSearch && matchModule && matchSensitive;
  });

  const exportCSV = () => {
    const headers = ["Date/Time","User","Role","Module","Setting Changed","Old Value","New Value","Sensitive","Approval Required","Approved By"];
    const rows = filtered.map(l => [l.dt, l.user, l.role, l.module, l.setting, l.old, l.new_val, l.sensitive?"Yes":"No", l.approval?"Yes":"No", l.approved_by||"—"]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "settings-audit-log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Settings Audit Log</h2>
        <Button onClick={exportCSV} variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60 hover:text-white">
          <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user, setting..."
            className="pl-9 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
        </div>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-52 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white text-xs rounded-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
            {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <button onClick={() => setSensitiveOnly(s => !s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${sensitiveOnly ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-[hsl(0,0%,11%)] text-white/30 border-[hsl(0,0%,20%)]"}`}>
          <ShieldAlert className="w-3 h-3" /> Sensitive Only
        </button>
      </div>

      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Date/Time","User","Role","Module","Setting Changed","Old Value","New Value","Sensitive","Approval","Approved By"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30 whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-3 py-2.5 text-white/40 font-mono text-[10px] whitespace-nowrap">{log.dt}</td>
                <td className="px-3 py-2.5 text-white font-semibold whitespace-nowrap">{log.user}</td>
                <td className="px-3 py-2.5 text-white/40 text-[11px]">{log.role}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-heading uppercase border ${MODULE_COLORS[log.module] || "bg-[hsl(0,0%,14%)] text-white/40 border-[hsl(0,0%,22%)]"}`}>{log.module}</span>
                </td>
                <td className="px-3 py-2.5 text-white/70">{log.setting}</td>
                <td className="px-3 py-2.5 text-white/40 font-mono text-[10px]">{log.old}</td>
                <td className="px-3 py-2.5 text-primary font-mono text-[10px]">{log.new_val}</td>
                <td className="px-3 py-2.5">
                  {log.sensitive ? <span className="flex items-center gap-1 text-[10px] text-yellow-400"><ShieldAlert className="w-3 h-3" /> Yes</span>
                    : <span className="text-[10px] text-white/20">No</span>}
                </td>
                <td className="px-3 py-2.5"><span className={`text-[10px] font-heading uppercase ${log.approval ? "text-yellow-400" : "text-white/20"}`}>{log.approval ? "Yes" : "No"}</span></td>
                <td className="px-3 py-2.5 text-white/40">{log.approved_by || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No audit events match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}