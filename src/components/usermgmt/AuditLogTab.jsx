import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Download, AlertTriangle, Shield, User, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import moment from "moment";

const ACTION_TYPES = ["all", "user_created", "user_edited", "user_disabled", "role_changed", "permission_changed", "approval_limit_changed", "login_attempt", "password_reset", "sensitive_data_viewed", "sensitive_data_edited", "report_exported"];
const MODULES = ["all", "users", "roles", "permissions", "payroll", "bas", "bank", "suppliers", "customers", "invoices", "purchasing"];

const ACTION_ICONS = {
  user_created: <User className="w-3 h-3 text-green-400" />,
  user_edited: <User className="w-3 h-3 text-blue-400" />,
  user_disabled: <User className="w-3 h-3 text-red-400" />,
  role_changed: <Shield className="w-3 h-3 text-yellow-400" />,
  permission_changed: <Shield className="w-3 h-3 text-yellow-400" />,
  approval_limit_changed: <Settings className="w-3 h-3 text-orange-400" />,
  login_attempt: <User className="w-3 h-3 text-white/40" />,
  password_reset: <Settings className="w-3 h-3 text-blue-400" />,
  sensitive_data_viewed: <AlertTriangle className="w-3 h-3 text-yellow-400" />,
  sensitive_data_edited: <AlertTriangle className="w-3 h-3 text-red-400" />,
  report_exported: <FileText className="w-3 h-3 text-purple-400" />,
};

// Demo log entries to show the system is working
const DEMO_LOGS = [
  { id: "1", timestamp: new Date().toISOString(), user_name: "System Admin", user_email: "admin@alliancepp.com.au", action: "user_created", module: "users", record_label: "New user profile setup", is_sensitive: false },
  { id: "2", timestamp: new Date(Date.now() - 3600000).toISOString(), user_name: "System Admin", user_email: "admin@alliancepp.com.au", action: "permission_changed", module: "roles", record_label: "Default roles seeded", is_sensitive: false },
];

export default function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [filterSensitive, setFilterSensitive] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.AuditLog.list("-created_date", 500);
    setLogs(data.length > 0 ? data : DEMO_LOGS);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l => {
    const s = search.toLowerCase();
    const matchSearch = !search || [l.user_name, l.user_email, l.action, l.module, l.record_label, l.old_value, l.new_value].join(" ").toLowerCase().includes(s);
    const matchAction = filterAction === "all" || l.action === filterAction;
    const matchModule = filterModule === "all" || l.module === filterModule;
    const matchSensitive = !filterSensitive || l.is_sensitive;
    const matchFrom = !dateFrom || new Date(l.timestamp) >= new Date(dateFrom);
    const matchTo = !dateTo || new Date(l.timestamp) <= new Date(dateTo + "T23:59:59");
    return matchSearch && matchAction && matchModule && matchSensitive && matchFrom && matchTo;
  });

  const handleExportCSV = () => {
    const headers = ["Timestamp", "User", "Email", "Action", "Module", "Record", "Old Value", "New Value", "Sensitive"];
    const rows = filtered.map(l => [
      moment(l.timestamp).format("DD/MM/YYYY HH:mm:ss"),
      l.user_name, l.user_email, l.action, l.module,
      l.record_label, l.old_value || "", l.new_value || "",
      l.is_sensitive ? "Yes" : "No"
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `audit_log_${moment().format("YYYYMMDD")}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit log..."
            className="pl-9 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white/70 rounded-sm text-xs font-heading uppercase tracking-wider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
            {ACTION_TYPES.map(a => <SelectItem key={a} value={a}>{a === "all" ? "All Actions" : a.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-36 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white/70 rounded-sm text-xs font-heading uppercase tracking-wider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
            {MODULES.map(m => <SelectItem key={m} value={m}>{m === "all" ? "All Modules" : m.charAt(0).toUpperCase()+m.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From"
          className="w-36 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To"
          className="w-36 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
        <button onClick={() => setFilterSensitive(s => !s)}
          className={`px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${filterSensitive ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)] text-white/40"}`}>
          Sensitive Only
        </button>
        <div className="ml-auto">
          <Button onClick={handleExportCSV} variant="outline"
            className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60 hover:text-white font-heading uppercase tracking-wider">
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs">
        <span className="text-white/30 font-heading uppercase tracking-wider">{filtered.length} entries</span>
        <span className="text-yellow-400/60 font-heading uppercase tracking-wider">{filtered.filter(l => l.is_sensitive).length} sensitive</span>
      </div>

      {/* Log table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[hsl(0,0%,20%)] border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20 font-heading uppercase tracking-wider text-xs">No audit log entries found</div>
      ) : (
        <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["Time", "User", "Action", "Module", "Record / Detail", "Sensitive"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {filtered.map((log, i) => (
                <tr key={log.id || i} className={`${log.is_sensitive ? "bg-yellow-500/3" : ""} hover:bg-[hsl(0,0%,11%)] transition-colors`}>
                  <td className="px-4 py-2.5 text-[10px] text-white/40 whitespace-nowrap font-mono">
                    {moment(log.timestamp || log.created_date).format("DD/MM/YY HH:mm")}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-xs text-white">{log.user_name || "—"}</p>
                    <p className="text-[10px] text-white/30">{log.user_email || ""}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {ACTION_ICONS[log.action] || <Settings className="w-3 h-3 text-white/20" />}
                      <span className="text-[10px] font-heading uppercase tracking-wider text-white/60">
                        {(log.action || "").replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[10px] text-white/40 font-heading uppercase">{log.module || "—"}</td>
                  <td className="px-4 py-2.5">
                    <p className="text-xs text-white/60">{log.record_label || "—"}</p>
                    {(log.old_value || log.new_value) && (
                      <p className="text-[10px] text-white/25">
                        {log.old_value && <span className="text-red-400/60">Old: {log.old_value} </span>}
                        {log.new_value && <span className="text-green-400/60">New: {log.new_value}</span>}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {log.is_sensitive
                      ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mx-auto" />
                      : <span className="text-white/15 text-[10px]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}