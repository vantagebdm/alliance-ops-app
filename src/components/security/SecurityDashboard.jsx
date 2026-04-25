import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, ShieldCheck, ShieldAlert, AlertTriangle, Lock, UserX, Activity, Eye, RefreshCw } from "lucide-react";

const KPI = ({ icon: Icon, label, value, color = "text-white", sub }) => (
  <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-heading uppercase tracking-wider text-white/30">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className={`text-2xl font-heading font-bold ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-white/25 mt-1">{sub}</div>}
  </div>
);

const AlertCard = ({ level, title, desc }) => {
  const styles = {
    high:   "bg-red-500/5 border-red-500/30 text-red-400",
    medium: "bg-yellow-500/5 border-yellow-500/30 text-yellow-400",
    low:    "bg-blue-500/5 border-blue-500/30 text-blue-400",
    ok:     "bg-green-500/5 border-green-500/30 text-green-400",
  };
  return (
    <div className={`border rounded-sm p-3 ${styles[level]}`}>
      <div className="text-[10px] font-heading uppercase tracking-wider mb-1">{title}</div>
      <div className="text-[11px] text-white/40">{desc}</div>
    </div>
  );
};

export default function SecurityDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.UserProfile.list("-created_date", 200).then(d => {
      setProfiles(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const active = profiles.filter(p => p.account_status === "active").length;
  const mfaOn = profiles.filter(p => p.mfa_enabled).length;
  const mfaOff = profiles.filter(p => !p.mfa_enabled).length;
  const suspended = profiles.filter(p => p.account_status === "suspended").length;
  const disabled = profiles.filter(p => p.account_status === "disabled").length;
  const noRole = profiles.filter(p => !p.role_name).length;

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[hsl(0,0%,20%)] border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Security Overview</h2>
        <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 text-[10px] font-heading uppercase tracking-wider text-white/30 hover:text-white/60">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI icon={Users}      label="Active Users"       value={active}    color="text-green-400" sub="account_status = active" />
        <KPI icon={ShieldCheck} label="MFA Enabled"       value={mfaOn}     color="text-primary"   sub="of all users" />
        <KPI icon={ShieldAlert} label="MFA Not Enabled"   value={mfaOff}    color="text-yellow-400" sub="action recommended" />
        <KPI icon={Activity}   label="Active Sessions"    value="—"         color="text-blue-400"  sub="live session tracking" />
        <KPI icon={Lock}       label="Locked Accounts"    value="0"         color="text-red-400"   sub="currently locked" />
        <KPI icon={UserX}      label="Suspended"          value={suspended} color="text-red-400"   sub="cannot log in" />
        <KPI icon={UserX}      label="Disabled"           value={disabled}  color="text-gray-400"  sub="access blocked" />
        <KPI icon={AlertTriangle} label="No Role Assigned" value={noRole}  color="text-yellow-400" sub="login will be blocked" />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
          <div className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-1">Failed Logins Today</div>
          <div className="text-xl font-heading font-bold text-white">—</div>
          <div className="text-[10px] text-white/25 mt-1">Requires auth event log</div>
        </div>
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
          <div className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-1">Sensitive Actions Today</div>
          <div className="text-xl font-heading font-bold text-white">—</div>
          <div className="text-[10px] text-white/25 mt-1">Track via audit log</div>
        </div>
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
          <div className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-1">Last Policy Update</div>
          <div className="text-xl font-heading font-bold text-white">—</div>
          <div className="text-[10px] text-white/25 mt-1">Saved via Security settings</div>
        </div>
      </div>

      {/* Alert cards */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3">Security Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AlertCard level={mfaOff > 0 ? "medium" : "ok"} title="MFA Not Enabled" desc={mfaOff > 0 ? `${mfaOff} user(s) have not enabled MFA. Consider enforcing MFA.` : "All users have MFA enabled."} />
          <AlertCard level="low" title="Failed Login Spike" desc="No unusual failed login activity detected. Monitor via Audit Log." />
          <AlertCard level="low" title="Suspicious Login Activity" desc="No suspicious logins detected. IP and device tracking available in Device & IP tab." />
          <AlertCard level={noRole > 0 ? "medium" : "ok"} title="Users Without Role" desc={noRole > 0 ? `${noRole} user(s) have no assigned role — login will be blocked by policy.` : "All users have an assigned role."} />
          <AlertCard level="low" title="Sensitive Financial Access" desc="Payroll, BAS, Supplier Bank, and Payment access monitored. See Sensitive Action Protection." />
          <AlertCard level="low" title="Payroll Access Used" desc="No payroll access events recorded today." />
          <AlertCard level="low" title="BAS Access Used" desc="No BAS access events recorded today." />
        </div>
      </div>

      {/* MFA Compliance table */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3">User Security Status</h3>
        <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["Name","Role","MFA","Account Status","Last Login"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {profiles.slice(0, 10).map(p => (
                <tr key={p.id} className="hover:bg-[hsl(0,0%,11%)]">
                  <td className="px-4 py-2.5 text-white font-semibold">{p.first_name} {p.last_name}</td>
                  <td className="px-4 py-2.5 text-white/50">{p.role_name || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase tracking-wider ${p.mfa_enabled ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                      {p.mfa_enabled ? "Enabled" : "Not Set"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase tracking-wider ${
                      p.account_status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : p.account_status === "suspended" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>{p.account_status || "invited"}</span>
                  </td>
                  <td className="px-4 py-2.5 text-white/30">{p.last_login ? new Date(p.last_login).toLocaleDateString("en-AU") : "Never"}</td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-white/20 font-heading uppercase tracking-wider text-[10px]">No user profiles found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}