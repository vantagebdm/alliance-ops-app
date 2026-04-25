import { useState } from "react";
import { Download, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RISK_COLORS = {
  Low:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Medium:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  High:     "bg-red-500/10 text-red-400 border-red-500/20",
  Critical: "bg-red-900/40 text-red-300 border-red-500/50",
};

const RESULT_COLORS = {
  Success: "text-green-400",
  Failed:  "text-red-400",
  Blocked: "text-yellow-400",
  Denied:  "text-red-400",
};

const DEMO_LOGS = [
  { id: 1,  dt: "2026-04-25 08:12:03", user: "Admin User",      role: "Super Admin",        event: "Successful Login",          risk: "Low",      module: "Auth",         action: "Login",                    result: "Success" },
  { id: 2,  dt: "2026-04-25 08:45:22", user: "Sarah Accounts",  role: "Accounts Manager",   event: "Sensitive Action Attempted",risk: "Medium",   module: "Accounting",   action: "View Supplier Bank Details",result: "Blocked" },
  { id: 3,  dt: "2026-04-25 09:01:11", user: "John Smith",      role: "Payroll Officer",    event: "MFA Enabled",               risk: "Low",      module: "Security",     action: "MFA Setup",                result: "Success" },
  { id: 4,  dt: "2026-04-25 09:15:30", user: "Unknown",         role: "—",                  event: "Failed Login",              risk: "High",     module: "Auth",         action: "Login Attempt",            result: "Failed"  },
  { id: 5,  dt: "2026-04-25 09:30:44", user: "Admin User",      role: "Super Admin",        event: "Security Policy Changed",   risk: "Medium",   module: "Security",     action: "Updated lockout settings", result: "Success" },
  { id: 6,  dt: "2026-04-25 10:02:18", user: "Mike Payroll",    role: "Payroll Officer",    event: "Sensitive Action Approved",risk: "High",     module: "Payroll",      action: "Run Payroll",              result: "Success" },
  { id: 7,  dt: "2026-04-25 10:45:55", user: "Unknown",         role: "—",                  event: "Failed Login",              risk: "Critical", module: "Auth",         action: "Login Attempt",            result: "Failed"  },
  { id: 8,  dt: "2026-04-25 11:20:09", user: "Jane Director",   role: "Director",           event: "Forced Logout",             risk: "Low",      module: "Session",      action: "Admin Force Logout",       result: "Success" },
  { id: 9,  dt: "2026-04-25 11:55:32", user: "Tom Sales",       role: "Sales Representative",event: "Login Blocked",           risk: "Medium",   module: "Auth",         action: "Login Outside Hours",      result: "Blocked" },
  { id: 10, dt: "2026-04-25 12:30:00", user: "Admin User",      role: "Super Admin",        event: "Account Unlocked",          risk: "Low",      module: "Security",     action: "Unlocked Tom Sales",       result: "Success" },
];

const EVENT_TYPES = ["All Events", "Successful Login", "Failed Login", "Forced Logout", "MFA Enabled", "MFA Disabled", "Account Locked", "Account Unlocked", "Security Policy Changed", "Login Blocked", "Sensitive Action Attempted", "Sensitive Action Approved", "Sensitive Action Denied"];

export default function SecurityAuditLog() {
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterEvent, setFilterEvent] = useState("All Events");
  const [sensitiveOnly, setSensitiveOnly] = useState(false);
  const [failedOnly, setFailedOnly] = useState(false);

  const filtered = DEMO_LOGS.filter(log => {
    const matchSearch = !search || [log.user, log.role, log.event, log.action, log.module].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === "all" || log.risk === filterRisk;
    const matchEvent = filterEvent === "All Events" || log.event === filterEvent;
    const matchSensitive = !sensitiveOnly || log.event.toLowerCase().includes("sensitive");
    const matchFailed = !failedOnly || log.result === "Failed" || log.result === "Blocked";
    return matchSearch && matchRisk && matchEvent && matchSensitive && matchFailed;
  });

  const handleExportCSV = () => {
    const headers = ["Date/Time","User","Role","Event","Risk","Module","Action","Result"];
    const rows = filtered.map(l => [l.dt, l.user, l.role, l.event, l.risk, l.module, l.action, l.result]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "security-audit-log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Security Audit Log</h2>
        <Button onClick={handleExportCSV} variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60 hover:text-white">
          <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users, events..."
            className="pl-9 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
        </div>
        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className="w-36 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white text-xs rounded-sm font-heading uppercase tracking-wider">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
            <SelectItem value="all">All Risk</SelectItem>
            {["Low","Medium","High","Critical"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger className="w-56 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white text-xs rounded-sm font-heading uppercase tracking-wider">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
            {EVENT_TYPES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => setSensitiveOnly(s => !s)}
          className={`px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${sensitiveOnly ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-[hsl(0,0%,11%)] text-white/30 border-[hsl(0,0%,20%)]"}`}>
          <Filter className="w-3 h-3 inline mr-1" /> Sensitive Only
        </button>
        <button
          onClick={() => setFailedOnly(s => !s)}
          className={`px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${failedOnly ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-[hsl(0,0%,11%)] text-white/30 border-[hsl(0,0%,20%)]"}`}>
          <Filter className="w-3 h-3 inline mr-1" /> Failed Only
        </button>
      </div>

      {/* Summary counts */}
      <div className="flex gap-3">
        {[
          { label: "Total", val: filtered.length, cls: "text-white" },
          { label: "Critical", val: filtered.filter(l => l.risk === "Critical").length, cls: "text-red-400" },
          { label: "High", val: filtered.filter(l => l.risk === "High").length, cls: "text-red-400" },
          { label: "Failed", val: filtered.filter(l => l.result === "Failed").length, cls: "text-red-400" },
          { label: "Blocked", val: filtered.filter(l => l.result === "Blocked").length, cls: "text-yellow-400" },
        ].map(s => (
          <div key={s.label} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm px-3 py-1.5">
            <span className="text-[10px] font-heading uppercase tracking-wider text-white/30">{s.label}: </span>
            <span className={`text-xs font-heading font-bold ${s.cls}`}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Log table */}
      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
              {["Date/Time","User","Role","Event","Risk","Module","Action","Result"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {filtered.map(log => (
              <tr key={log.id} className={`hover:bg-[hsl(0,0%,11%)] ${log.risk === "Critical" ? "bg-red-900/10" : ""}`}>
                <td className="px-4 py-2.5 text-white/40 font-mono whitespace-nowrap">{log.dt}</td>
                <td className="px-4 py-2.5 text-white font-semibold whitespace-nowrap">{log.user}</td>
                <td className="px-4 py-2.5 text-white/50 whitespace-nowrap">{log.role}</td>
                <td className="px-4 py-2.5 text-white/70 whitespace-nowrap">{log.event}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${RISK_COLORS[log.risk]}`}>{log.risk}</span>
                </td>
                <td className="px-4 py-2.5 text-white/40 whitespace-nowrap">{log.module}</td>
                <td className="px-4 py-2.5 text-white/50">{log.action}</td>
                <td className="px-4 py-2.5">
                  <span className={`font-heading text-[10px] uppercase font-bold ${RESULT_COLORS[log.result] || "text-white/40"}`}>{log.result}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No audit events match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}