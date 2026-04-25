import { useState } from "react";
import { Download, Search, Filter, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RESULT_COLORS = {
  Success: "text-primary",
  Failed:  "text-red-400",
  Partial: "text-yellow-400",
  Pending: "text-blue-400",
};

const ACTION_COLORS = {
  Import:        "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Export:        "bg-primary/10 text-primary border-primary/20",
  Backup:        "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Restore:       "bg-red-500/10 text-red-400 border-red-500/20",
  "Bulk Update": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Archive:       "bg-[hsl(0,0%,16%)] text-white/40 border-[hsl(0,0%,22%)]",
  Migration:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Merge:         "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const DEMO_LOGS = [
  { id: 1,  dt: "2026-04-25 09:05", user: "Admin User",   role: "Super Admin",       action: "Backup",        module: "Full System",      file: "backup-2026-04-25.zip", rows: null,  result: "Success", sensitive: false, approval: false, approved_by: "" },
  { id: 2,  dt: "2026-04-25 09:15", user: "Admin User",   role: "Super Admin",       action: "Import",        module: "Parts Master",     file: "parts-april.csv",       rows: 84,    result: "Success", sensitive: false, approval: false, approved_by: "" },
  { id: 3,  dt: "2026-04-25 10:00", user: "Sarah A",      role: "Accounts Manager",  action: "Export",        module: "Customers",        file: "customers-export.xlsx", rows: 134,   result: "Success", sensitive: false, approval: false, approved_by: "" },
  { id: 4,  dt: "2026-04-25 10:22", user: "Sarah A",      role: "Accounts Manager",  action: "Export",        module: "Payroll Summary",  file: "payroll-q2.csv",        rows: 12,    result: "Failed",  sensitive: true,  approval: true,  approved_by: "" },
  { id: 5,  dt: "2026-04-25 11:00", user: "Admin User",   role: "Super Admin",       action: "Bulk Update",   module: "Parts — Cost Price",file: null,                    rows: 42,    result: "Success", sensitive: true,  approval: true,  approved_by: "Admin" },
  { id: 6,  dt: "2026-04-25 11:45", user: "Mike P",       role: "Payroll Officer",   action: "Export",        module: "Payroll Summary",  file: "payroll-export.xlsx",   rows: 12,    result: "Success", sensitive: true,  approval: true,  approved_by: "Admin" },
  { id: 7,  dt: "2026-04-25 12:00", user: "Admin User",   role: "Super Admin",       action: "Merge",         module: "Customers",        file: null,                    rows: 2,     result: "Success", sensitive: false, approval: false, approved_by: "" },
  { id: 8,  dt: "2026-04-25 13:00", user: "Admin User",   role: "Super Admin",       action: "Import",        module: "Bank Transactions",file: "anz-april.csv",         rows: 201,   result: "Partial", sensitive: true,  approval: false, approved_by: "" },
  { id: 9,  dt: "2026-04-24 15:00", user: "Admin User",   role: "Super Admin",       action: "Restore",       module: "Full System",      file: "backup-2026-04-24.zip", rows: null,  result: "Success", sensitive: true,  approval: true,  approved_by: "Admin" },
  { id: 10, dt: "2026-04-24 09:00", user: "Scheduled",    role: "System",            action: "Backup",        module: "Full System",      file: "backup-2026-04-24.zip", rows: null,  result: "Success", sensitive: false, approval: false, approved_by: "" },
  { id: 11, dt: "2026-04-23 08:30", user: "Admin User",   role: "Super Admin",       action: "Archive",       module: "Quotes",           file: null,                    rows: 14,    result: "Success", sensitive: false, approval: false, approved_by: "" },
  { id: 12, dt: "2026-04-22 11:00", user: "Admin User",   role: "Super Admin",       action: "Migration",     module: "Xero → ERP",       file: "xero-export.csv",       rows: 1271,  result: "Success", sensitive: true,  approval: true,  approved_by: "Admin" },
];

const ACTION_TYPES = ["All Actions", "Import", "Export", "Backup", "Restore", "Bulk Update", "Archive", "Migration", "Merge"];

export default function DataAuditLog() {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("All Actions");
  const [sensitiveOnly, setSensitiveOnly] = useState(false);
  const [failedOnly, setFailedOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");

  const filtered = DEMO_LOGS.filter(log => {
    const matchSearch = !search || [log.user, log.module, log.file || "", log.action].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "All Actions" || log.action === filterAction;
    const matchSensitive = !sensitiveOnly || log.sensitive;
    const matchFailed = !failedOnly || log.result !== "Success";
    return matchSearch && matchAction && matchSensitive && matchFailed;
  });

  const handleExportCSV = () => {
    const headers = ["Date/Time", "User", "Role", "Action", "Module", "File", "Records", "Result", "Sensitive", "Approval Required", "Approved By"];
    const rows = filtered.map(l => [l.dt, l.user, l.role, l.action, l.module, l.file || "—", l.rows || "—", l.result, l.sensitive ? "Yes" : "No", l.approval ? "Yes" : "No", l.approved_by || "—"]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "data-audit-log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Data Audit Log</h2>
        <Button onClick={handleExportCSV} variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60 hover:text-white">
          <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user, module, file..."
            className="pl-9 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-44 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white text-xs rounded-sm font-heading uppercase tracking-wider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
            {ACTION_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="w-40 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
        <button onClick={() => setSensitiveOnly(s => !s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${sensitiveOnly ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-[hsl(0,0%,11%)] text-white/30 border-[hsl(0,0%,20%)]"}`}>
          <ShieldAlert className="w-3 h-3" /> Sensitive Only
        </button>
        <button onClick={() => setFailedOnly(s => !s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${failedOnly ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-[hsl(0,0%,11%)] text-white/30 border-[hsl(0,0%,20%)]"}`}>
          <Filter className="w-3 h-3" /> Failed Only
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-3">
        {[
          { label: "Total", val: filtered.length, cls: "text-white" },
          { label: "Imports", val: filtered.filter(l => l.action === "Import").length, cls: "text-blue-400" },
          { label: "Exports", val: filtered.filter(l => l.action === "Export").length, cls: "text-primary" },
          { label: "Backups", val: filtered.filter(l => l.action === "Backup").length, cls: "text-purple-400" },
          { label: "Sensitive", val: filtered.filter(l => l.sensitive).length, cls: "text-yellow-400" },
          { label: "Failed", val: filtered.filter(l => l.result !== "Success").length, cls: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm px-3 py-1.5">
            <span className="text-[10px] font-heading uppercase tracking-wider text-white/30">{s.label}: </span>
            <span className={`text-xs font-heading font-bold ${s.cls}`}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[960px]">
          <thead>
            <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
              {["Date/Time","User","Role","Action","Module","File","Records","Result","Sensitive","Approval","Approved By"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-3 py-2.5 text-white/40 font-mono text-[10px] whitespace-nowrap">{log.dt}</td>
                <td className="px-3 py-2.5 text-white font-semibold whitespace-nowrap">{log.user}</td>
                <td className="px-3 py-2.5 text-white/40 whitespace-nowrap text-[11px]">{log.role}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${ACTION_COLORS[log.action] || "bg-[hsl(0,0%,14%)] text-white/40 border-[hsl(0,0%,22%)]"}`}>{log.action}</span>
                </td>
                <td className="px-3 py-2.5 text-white/60 whitespace-nowrap">{log.module}</td>
                <td className="px-3 py-2.5 text-white/40 font-mono text-[10px]">{log.file || "—"}</td>
                <td className="px-3 py-2.5 text-white/50">{log.rows !== null ? log.rows.toLocaleString() : "—"}</td>
                <td className="px-3 py-2.5">
                  <span className={`font-heading text-[10px] uppercase font-bold ${RESULT_COLORS[log.result] || "text-white/40"}`}>{log.result}</span>
                </td>
                <td className="px-3 py-2.5">
                  {log.sensitive ? (
                    <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-heading uppercase"><ShieldAlert className="w-3 h-3" /> Yes</span>
                  ) : <span className="text-[10px] text-white/20 font-heading uppercase">No</span>}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] font-heading uppercase ${log.approval ? "text-yellow-400" : "text-white/20"}`}>{log.approval ? "Yes" : "No"}</span>
                </td>
                <td className="px-3 py-2.5 text-white/40">{log.approved_by || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No audit events match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}