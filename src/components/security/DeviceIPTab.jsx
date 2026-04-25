import { useState } from "react";
import { Plus, Trash2, ShieldCheck, ShieldAlert, Monitor } from "lucide-react";
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

const STATUS_COLORS = {
  Trusted:  "bg-green-500/10 text-green-400 border-green-500/20",
  Pending:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Blocked:  "bg-red-500/10 text-red-400 border-red-500/20",
  Unknown:  "bg-[hsl(0,0%,16%)] text-white/30 border-[hsl(0,0%,22%)]",
};

const DEMO_DEVICES = [
  { id: 1, name: "Windows PC — Chrome",   user: "Admin User",   lastUsed: "Today",     status: "Trusted" },
  { id: 2, name: "MacBook — Safari",      user: "Accounts",     lastUsed: "Yesterday", status: "Trusted" },
  { id: 3, name: "iPhone — Mobile",       user: "Sales Rep",    lastUsed: "2 days ago",status: "Pending" },
  { id: 4, name: "Unknown Device",        user: "Unknown",      lastUsed: "Today",     status: "Unknown" },
];

const DEMO_IPS = [
  { id: 1, ip: "203.0.113.10",  label: "Head Office",     type: "allowed" },
  { id: 2, ip: "198.51.100.22", label: "Remote Worker",   type: "allowed" },
  { id: 3, ip: "192.0.2.55",    label: "Blocked Source",  type: "blocked" },
];

export default function DeviceIPTab() {
  const [devices, setDevices] = useState(DEMO_DEVICES);
  const [ips, setIps] = useState(DEMO_IPS);
  const [newIp, setNewIp] = useState({ ip: "", label: "", type: "allowed" });
  const [settings, setSettings] = useState({
    require_device_approval: false,
    notify_admin_new_device: true,
    block_unknown_device: false,
    trusted_devices_only: false,
  });

  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));

  const addIp = () => {
    if (!newIp.ip) return;
    setIps(prev => [...prev, { ...newIp, id: Date.now() }]);
    setNewIp({ ip: "", label: "", type: "allowed" });
  };

  const updateDevice = (id, status) => setDevices(prev => prev.map(d => d.id === id ? { ...d, status } : d));

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Device & IP Access</h2>
        <span className="text-[10px] font-heading uppercase tracking-wider text-yellow-400 border border-yellow-400/30 px-2 py-1 rounded-sm">Placeholder — Production Ready</span>
      </div>

      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-sm">
        <p className="text-[11px] text-blue-400/80">Device and IP controls are configured here and ready for production enforcement. Actual device fingerprinting and IP restriction enforcement requires backend authentication integration.</p>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">Device Controls</p>
        </div>
        <div className="px-4">
          <Toggle label="Require Approval for New Device" desc="Admin must approve new devices before access is granted" value={settings.require_device_approval} onChange={set("require_device_approval")} />
          <Toggle label="Notify Admin on New Device Login" desc="Send alert when a user logs in from an unrecognised device" value={settings.notify_admin_new_device} onChange={set("notify_admin_new_device")} />
          <Toggle label="Block Unknown Devices (Placeholder)" desc="Only trusted/approved devices can log in" value={settings.block_unknown_device} onChange={set("block_unknown_device")} />
          <Toggle label="Allow Trusted Devices Only (Placeholder)" desc="Strict device whitelist — all others blocked" value={settings.trusted_devices_only} onChange={set("trusted_devices_only")} />
        </div>
      </div>

      {/* Device table */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3">Registered Devices</h3>
        <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["Device","User","Last Used","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {devices.map(d => (
                <tr key={d.id} className="hover:bg-[hsl(0,0%,11%)]">
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Monitor className="w-3.5 h-3.5 text-white/25" /><span className="text-white">{d.name}</span></div></td>
                  <td className="px-4 py-2.5 text-white/50">{d.user}</td>
                  <td className="px-4 py-2.5 text-white/40">{d.lastUsed}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${STATUS_COLORS[d.status]}`}>{d.status}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => updateDevice(d.id, "Trusted")} className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20">
                        <ShieldCheck className="w-3 h-3" /> Trust
                      </button>
                      <button onClick={() => updateDevice(d.id, "Blocked")} className="flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                        <ShieldAlert className="w-3 h-3" /> Block
                      </button>
                      <button onClick={() => setDevices(prev => prev.filter(x => x.id !== d.id))} className="p-1 text-white/20 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IP Rules */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3">IP Address Rules</h3>
        <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["IP Address","Label","Type","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {ips.map(ip => (
                <tr key={ip.id} className="hover:bg-[hsl(0,0%,11%)]">
                  <td className="px-4 py-2.5 text-white font-mono">{ip.ip}</td>
                  <td className="px-4 py-2.5 text-white/50">{ip.label}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${ip.type === "allowed" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {ip.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setIps(prev => prev.filter(x => x.id !== ip.id))} className="p-1 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <Input value={newIp.ip} onChange={e => setNewIp(p => ({ ...p, ip: e.target.value }))} placeholder="IP Address" className="w-40 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          <Input value={newIp.label} onChange={e => setNewIp(p => ({ ...p, label: e.target.value }))} placeholder="Label" className="flex-1 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          <select value={newIp.type} onChange={e => setNewIp(p => ({ ...p, type: e.target.value }))}
            className="bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-2">
            <option value="allowed">Allowed</option>
            <option value="blocked">Blocked</option>
          </select>
          <Button onClick={addIp} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add IP
          </Button>
        </div>
      </div>
    </div>
  );
}