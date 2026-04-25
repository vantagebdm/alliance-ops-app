import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Unlock, RotateCcw, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const NumField = ({ label, desc, value, onChange, unit }) => (
  <div className="flex items-center justify-between py-3 border-b border-[hsl(0,0%,14%)] last:border-0">
    <div className="flex-1 pr-4">
      <div className="text-xs font-heading uppercase tracking-wider text-white">{label}</div>
      {desc && <div className="text-[10px] text-white/30 mt-0.5">{desc}</div>}
    </div>
    <div className="flex items-center gap-2">
      <Input type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-20 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs text-right" />
      {unit && <span className="text-[10px] text-white/30 font-heading uppercase">{unit}</span>}
    </div>
  </div>
);

export default function AccountLockoutTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    max_attempts: 5,
    lockout_duration: 30,
    notify_admin_after: 3,
    notify_user: true,
    require_password_reset_after_lockout: true,
    require_mfa_reset_after_suspicious: true,
    force_password_reset_repeated: true,
  });

  useEffect(() => {
    base44.entities.UserProfile.list("-created_date", 200).then(d => { setProfiles(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleUnlock = async (p) => {
    await base44.entities.UserProfile.update(p.id, { account_status: "active" });
    const data = await base44.entities.UserProfile.list("-created_date", 200);
    setProfiles(data);
  };

  const handleSuspend = async (p) => {
    await base44.entities.UserProfile.update(p.id, { account_status: "suspended" });
    const data = await base44.entities.UserProfile.list("-created_date", 200);
    setProfiles(data);
  };

  const lockedOrSuspended = profiles.filter(p => ["suspended", "disabled"].includes(p.account_status));

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Account Lockout Rules</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">Lockout Configuration</p>
        </div>
        <div className="px-4">
          <NumField label="Failed Login Attempt Limit" desc="Lock account after this many failed attempts" value={settings.max_attempts} onChange={set("max_attempts")} unit="attempts" />
          <NumField label="Lockout Duration" desc="Minutes the account remains locked before auto-unlock" value={settings.lockout_duration} onChange={set("lockout_duration")} unit="mins" />
          <NumField label="Notify Admin After" desc="Alert admin after this many failed attempts" value={settings.notify_admin_after} onChange={set("notify_admin_after")} unit="attempts" />
          <Toggle label="Notify User After Failed Attempts" desc="Send email notification to user after failed login" value={settings.notify_user} onChange={set("notify_user")} />
          <Toggle label="Require Password Reset After Lockout" desc="User must reset password before regaining access after lockout" value={settings.require_password_reset_after_lockout} onChange={set("require_password_reset_after_lockout")} />
          <Toggle label="Require MFA Reset After Suspicious Activity" desc="Force MFA re-setup after suspicious login pattern detected" value={settings.require_mfa_reset_after_suspicious} onChange={set("require_mfa_reset_after_suspicious")} />
          <Toggle label="Force Password Reset After Repeated Lockouts" desc="Escalate to mandatory reset if user is repeatedly locked out" value={settings.force_password_reset_repeated} onChange={set("force_password_reset_repeated")} />
        </div>
      </div>

      <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400/80 font-heading uppercase tracking-wider">
          ⚠ Default: Lock after 5 failed attempts — 30 minute lockout — Admin notified after 3 failures.
        </p>
      </div>

      {/* Locked accounts table */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3">Suspended / Disabled Accounts</h3>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[hsl(0,0%,25%)] border-t-primary rounded-full animate-spin" /></div>
        ) : lockedOrSuspended.length === 0 ? (
          <div className="border border-[hsl(0,0%,18%)] rounded-sm p-8 text-center text-white/20 font-heading uppercase text-[10px]">No locked or suspended accounts</div>
        ) : (
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                  {["User","Role","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {lockedOrSuspended.map(p => (
                  <tr key={p.id} className="hover:bg-[hsl(0,0%,11%)]">
                    <td className="px-4 py-2.5 text-white font-semibold">{p.first_name} {p.last_name}</td>
                    <td className="px-4 py-2.5 text-white/50">{p.role_name || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${p.account_status === "suspended" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {p.account_status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleUnlock(p)}
                          className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20">
                          <Unlock className="w-3 h-3" /> Unlock
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20">
                          <RotateCcw className="w-3 h-3" /> Force Reset
                        </button>
                        <button onClick={() => handleSuspend(p)}
                          className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                          <UserX className="w-3 h-3" /> Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}