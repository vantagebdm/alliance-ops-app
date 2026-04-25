import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Send, RotateCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const Section = ({ title, children }) => (
  <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden mb-4">
    <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
      <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">{title}</p>
    </div>
    <div className="px-4">{children}</div>
  </div>
);

export default function MFAControlsTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    force_all: false,
    force_super_admin: true,
    force_director: true,
    force_accounting: true,
    force_payroll: true,
    force_bas: true,
    force_supplier_bank: true,
    force_payment_approval: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.UserProfile.list("-created_date", 200).then(d => {
      setProfiles(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleResetMFA = async (p) => {
    await base44.entities.UserProfile.update(p.id, { mfa_enabled: false });
    const data = await base44.entities.UserProfile.list("-created_date", 200);
    setProfiles(data);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">MFA Controls</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <Section title="MFA Methods Available">
        <div className="py-3 space-y-2">
          {[
            { label: "Email Code", status: "active" },
            { label: "SMS Code", status: "placeholder" },
            { label: "Authenticator App", status: "placeholder" },
            { label: "Recovery Codes", status: "placeholder" },
          ].map(m => (
            <div key={m.label} className="flex items-center justify-between">
              <span className="text-xs text-white/60">{m.label}</span>
              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase tracking-wider ${m.status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-[hsl(0,0%,18%)] text-white/30 border border-[hsl(0,0%,22%)]"}`}>
                {m.status === "active" ? "Active" : "Coming Soon"}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Force MFA by Role / Access">
        <Toggle label="Force MFA for All Users" desc="All users must have MFA enabled before any login is permitted" value={settings.force_all} onChange={set("force_all")} />
        <Toggle label="Force MFA — Super Admin" value={settings.force_super_admin} onChange={set("force_super_admin")} />
        <Toggle label="Force MFA — Director" value={settings.force_director} onChange={set("force_director")} />
        <Toggle label="Force MFA — Accounting Users" value={settings.force_accounting} onChange={set("force_accounting")} />
        <Toggle label="Force MFA — Payroll Users" value={settings.force_payroll} onChange={set("force_payroll")} />
        <Toggle label="Force MFA — BAS Users" value={settings.force_bas} onChange={set("force_bas")} />
        <Toggle label="Force MFA — Supplier Bank Detail Access" value={settings.force_supplier_bank} onChange={set("force_supplier_bank")} />
        <Toggle label="Force MFA — Payment Approval Access" value={settings.force_payment_approval} onChange={set("force_payment_approval")} />
      </Section>

      {/* User MFA status table */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3">User MFA Status</h3>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[hsl(0,0%,25%)] border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                  {["Name","Role","MFA Status","Method","Last Verified","Actions"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-[hsl(0,0%,11%)]">
                    <td className="px-4 py-2.5 text-white font-semibold">{p.first_name} {p.last_name}</td>
                    <td className="px-4 py-2.5 text-white/50">{p.role_name || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase ${p.mfa_enabled ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                        {p.mfa_enabled ? "Enabled" : "Not Set"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-white/40">Email Code</td>
                    <td className="px-4 py-2.5 text-white/30">—</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleResetMFA(p)} title="Reset MFA"
                          className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase tracking-wider bg-[hsl(0,0%,16%)] text-white/50 hover:text-white border border-[hsl(0,0%,22%)] hover:border-[hsl(0,0%,30%)]">
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                        <button title="Send MFA Invite"
                          className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20">
                          <Send className="w-3 h-3" /> Invite
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-white/20 font-heading uppercase tracking-wider text-[10px]">No user profiles found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}