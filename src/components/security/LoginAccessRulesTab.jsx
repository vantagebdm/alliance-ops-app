import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_ROLES } from "@/lib/permissions";

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

const DEFAULT_RULES = [
  { id: 1, role: "Warehouse Operator",  days: "Mon-Fri", from: "05:00", to: "18:00", restricted: true },
  { id: 2, role: "Accounts Manager",    days: "Mon-Fri", from: "07:00", to: "18:00", restricted: true },
  { id: 3, role: "Payroll Officer",     days: "Mon-Fri", from: "07:00", to: "17:00", restricted: true },
  { id: 4, role: "Super Admin",         days: "Any",     from: "00:00", to: "23:59", restricted: false },
  { id: 5, role: "Dispatch Officer",    days: "Mon-Sat", from: "05:00", to: "18:00", restricted: true },
];

export default function LoginAccessRulesTab() {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [settings, setSettings] = useState({
    enforce_hours: true,
    allow_emergency_override: true,
    restrict_by_role: true,
  });
  const [saved, setSaved] = useState(false);
  const [newRule, setNewRule] = useState({ role: "", days: "Mon-Fri", from: "07:00", to: "17:00", restricted: true });

  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const addRule = () => {
    if (!newRule.role) return;
    setRules(r => [...r, { ...newRule, id: Date.now() }]);
    setNewRule({ role: "", days: "Mon-Fri", from: "07:00", to: "17:00", restricted: true });
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Login Access Rules</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Rules"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">Global Controls</p>
        </div>
        <div className="px-4">
          <Toggle label="Enforce Login Hours" desc="Block login attempts outside approved hours for restricted roles" value={settings.enforce_hours} onChange={set("enforce_hours")} />
          <Toggle label="Allow Emergency Override (Super Admin only)" desc="Super Admin can override login hour restrictions for any user" value={settings.allow_emergency_override} onChange={set("allow_emergency_override")} />
          <Toggle label="Restrict Login by Role" desc="Apply role-specific login hour restrictions below" value={settings.restrict_by_role} onChange={set("restrict_by_role")} />
        </div>
      </div>

      {/* Blocked message preview */}
      <div className="p-3 bg-red-500/5 border border-red-500/30 rounded-sm">
        <div className="text-[10px] font-heading uppercase tracking-wider text-red-400 mb-1">Blocked Login Message Shown to Users</div>
        <div className="text-xs text-white/50 italic">"Access blocked by APP ERP Security Policy. Contact your system administrator."</div>
      </div>

      {/* Role rules table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Role Login Hour Rules</h3>
        </div>
        <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["Role","Allowed Days","From","To","Restricted","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {rules.map(r => (
                <tr key={r.id} className="hover:bg-[hsl(0,0%,11%)]">
                  <td className="px-4 py-2.5 text-white font-semibold">{r.role}</td>
                  <td className="px-4 py-2.5 text-white/50">{r.days}</td>
                  <td className="px-4 py-2.5 text-white/50">{r.from}</td>
                  <td className="px-4 py-2.5 text-white/50">{r.to}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${r.restricted ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                      {r.restricted ? "Restricted" : "Unrestricted"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setRules(prev => prev.filter(x => x.id !== r.id))} className="p-1 text-red-400/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add new rule */}
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
          <div className="font-heading text-[10px] uppercase tracking-wider text-white/30 mb-3">Add New Rule</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Select value={newRule.role} onValueChange={v => setNewRule(r => ({ ...r, role: v }))}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                {DEFAULT_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={newRule.days} onChange={e => setNewRule(r => ({ ...r, days: e.target.value }))} placeholder="Mon-Fri" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            <Input type="time" value={newRule.from} onChange={e => setNewRule(r => ({ ...r, from: e.target.value }))} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            <Input type="time" value={newRule.to} onChange={e => setNewRule(r => ({ ...r, to: e.target.value }))} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            <Button onClick={addRule} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}