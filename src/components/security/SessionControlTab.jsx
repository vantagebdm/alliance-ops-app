import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, LogOut } from "lucide-react";
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

export default function SessionControlTab() {
  const [profiles, setProfiles] = useState([]);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    idle_timeout: 30,
    concurrent_sessions: 2,
    require_reauth_timeout: true,
    require_reauth_sensitive: true,
    idle_logout: true,
  });

  useEffect(() => {
    base44.entities.UserProfile.list("-created_date", 200).then(setProfiles).catch(() => {});
  }, []);

  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // Generate mock active sessions from profiles
  const activeSessions = profiles.filter(p => p.account_status === "active").slice(0, 5).map(p => ({
    ...p,
    loginTime: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString("en-AU"),
    lastActivity: new Date(Date.now() - Math.random() * 600000).toLocaleTimeString("en-AU"),
  }));

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Session Control</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-sm text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Force Logout All
          </Button>
          <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">Session Settings</p>
        </div>
        <div className="px-4">
          <NumField label="Idle Session Timeout" desc="Minutes of inactivity before automatic logout" value={settings.idle_timeout} onChange={set("idle_timeout")} unit="mins" />
          <NumField label="Max Concurrent Sessions" desc="Maximum simultaneous logins per user" value={settings.concurrent_sessions} onChange={set("concurrent_sessions")} unit="sessions" />
          <Toggle label="Idle Logout" desc="Automatically log out users after idle timeout" value={settings.idle_logout} onChange={set("idle_logout")} />
          <Toggle label="Require Re-Authentication After Timeout" desc="User must re-enter password after idle logout" value={settings.require_reauth_timeout} onChange={set("require_reauth_timeout")} />
          <Toggle label="Require Re-Authentication Before Sensitive Actions" desc="Users must confirm identity before financial or admin actions" value={settings.require_reauth_sensitive} onChange={set("require_reauth_sensitive")} />
        </div>
      </div>

      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3">Active Sessions</h3>
        <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["User","Role","Login Time","Last Activity","Device","IP","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {activeSessions.length > 0 ? activeSessions.map(p => (
                <tr key={p.id} className="hover:bg-[hsl(0,0%,11%)]">
                  <td className="px-4 py-2.5 text-white font-semibold">{p.first_name} {p.last_name}</td>
                  <td className="px-4 py-2.5 text-white/50">{p.role_name || "—"}</td>
                  <td className="px-4 py-2.5 text-white/40">{p.loginTime}</td>
                  <td className="px-4 py-2.5 text-white/40">{p.lastActivity}</td>
                  <td className="px-4 py-2.5 text-white/30">— (placeholder)</td>
                  <td className="px-4 py-2.5 text-white/30">— (placeholder)</td>
                  <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase bg-green-500/10 text-green-400 border border-green-500/20">Active</span></td>
                  <td className="px-4 py-2.5">
                    <button className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                      <LogOut className="w-3 h-3" /> Logout
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No active sessions detected</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}