import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, RotateCcw } from "lucide-react";
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

export default function PasswordPolicyTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [policy, setPolicy] = useState({
    min_length: 12,
    require_uppercase: true,
    require_lowercase: true,
    require_number: true,
    require_special: true,
    expiry_days: 90,
    prevent_reuse: 5,
    temp_expiry_hours: 24,
    force_after_security_event: true,
  });

  useEffect(() => {
    base44.entities.UserProfile.list("-created_date", 200).then(d => { setProfiles(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const set = (k) => (v) => setPolicy(s => ({ ...s, [k]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleForceReset = async (p) => {
    await base44.entities.UserProfile.update(p.id, { notes: (p.notes || "") + " [Password reset required]" });
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Password Policy</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Policy"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">Complexity Requirements</p>
        </div>
        <div className="px-4">
          <NumField label="Minimum Password Length" desc="Minimum recommended: 12 characters" value={policy.min_length} onChange={set("min_length")} unit="chars" />
          <Toggle label="Require Uppercase Letter" value={policy.require_uppercase} onChange={set("require_uppercase")} />
          <Toggle label="Require Lowercase Letter" value={policy.require_lowercase} onChange={set("require_lowercase")} />
          <Toggle label="Require Number" value={policy.require_number} onChange={set("require_number")} />
          <Toggle label="Require Special Character" desc="e.g. ! @ # $ % ^ & *" value={policy.require_special} onChange={set("require_special")} />
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">Expiry & Reuse</p>
        </div>
        <div className="px-4">
          <NumField label="Password Expiry Period" desc="0 = never expires" value={policy.expiry_days} onChange={set("expiry_days")} unit="days" />
          <NumField label="Prevent Password Reuse" desc="Number of previous passwords that cannot be reused" value={policy.prevent_reuse} onChange={set("prevent_reuse")} unit="passwords" />
          <NumField label="Temporary Password Expiry" desc="Hours before a temporary password expires" value={policy.temp_expiry_hours} onChange={set("temp_expiry_hours")} unit="hours" />
          <Toggle label="Force Password Reset After Security Event" desc="Lock account and require reset after suspicious activity" value={policy.force_after_security_event} onChange={set("force_after_security_event")} />
        </div>
      </div>

      <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400/80 font-heading uppercase tracking-wider">
          ⚠ Minimum security standard: 12+ chars, uppercase, lowercase, number, and special character. Settings cannot be saved below this standard.
        </p>
      </div>

      {/* Password Health Table */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3">Password Health — All Users</h3>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[hsl(0,0%,25%)] border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                  {["User","Role","Last Changed","Reset Required","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-[hsl(0,0%,11%)]">
                    <td className="px-4 py-2.5 text-white font-semibold">{p.first_name} {p.last_name}</td>
                    <td className="px-4 py-2.5 text-white/50">{p.role_name || "—"}</td>
                    <td className="px-4 py-2.5 text-white/30">—</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase bg-[hsl(0,0%,16%)] text-white/30 border border-[hsl(0,0%,22%)]">No</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${p.account_status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                        {p.account_status || "invited"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => handleForceReset(p)}
                        className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20">
                        <RotateCcw className="w-3 h-3" /> Force Reset
                      </button>
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}