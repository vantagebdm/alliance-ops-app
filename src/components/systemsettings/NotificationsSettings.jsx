import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "app_notification_settings";

const PRIORITIES = { low: "text-blue-400 border-blue-400/30 bg-blue-500/10", medium: "text-yellow-400 border-yellow-400/30 bg-yellow-500/10", high: "text-orange-400 border-orange-400/30 bg-orange-500/10", critical: "text-red-400 border-red-400/30 bg-red-500/10" };

const TRIGGERS = [
  { key: "low_stock", label: "Low Stock", priority: "medium" },
  { key: "negative_stock", label: "Negative Stock", priority: "high" },
  { key: "reorder_required", label: "Reorder Required", priority: "medium" },
  { key: "po_approval", label: "Purchase Order Approval Required", priority: "high" },
  { key: "bill_approval", label: "Supplier Bill Approval Required", priority: "medium" },
  { key: "so_approval", label: "Sales Order Approval Required", priority: "medium" },
  { key: "credit_exceeded", label: "Customer Credit Limit Exceeded", priority: "high" },
  { key: "overdue_invoice", label: "Customer Overdue Invoice", priority: "medium" },
  { key: "bill_due", label: "Supplier Bill Due", priority: "medium" },
  { key: "bas_due", label: "BAS Due", priority: "high" },
  { key: "payroll_due", label: "Payroll Due", priority: "high" },
  { key: "stocktake_due", label: "Stocktake Due", priority: "medium" },
  { key: "backup_overdue", label: "Backup Overdue", priority: "medium" },
  { key: "failed_import", label: "Failed Import", priority: "high" },
  { key: "security_alert", label: "Security Alert", priority: "critical" },
  { key: "user_locked", label: "User Locked Out", priority: "high" },
  { key: "sensitive_changed", label: "Sensitive Data Changed", priority: "critical" },
  { key: "margin_below", label: "Gross Margin Below Threshold", priority: "high" },
  { key: "dispatch_overdue", label: "Dispatch Overdue", priority: "medium" },
  { key: "account_suspended", label: "Customer Account Suspended", priority: "high" },
];

const DEFAULT_NOTIFICATIONS = Object.fromEntries(TRIGGERS.map(t => [t.key, { in_app: true, email: false, sms: false }]));

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export default function NotificationsSettings() {
  const stored = loadSettings();
  const [channels, setChannels] = useState(stored?.channels ?? { in_app: true, email: true, sms: true });
  const [notifications, setNotifications] = useState(stored?.notifications ?? DEFAULT_NOTIFICATIONS);
  const [notifEmail, setNotifEmail] = useState(stored?.notifEmail ?? "mitch@alliancepartsgroup.com.au");
  const [notifSms, setNotifSms] = useState(stored?.notifSms ?? "0402 910 119");
  const [saved, setSaved] = useState(false);

  const toggleChannel = (k) => setChannels(c => ({ ...c, [k]: !c[k] }));
  const toggleNotif = (key, ch) => setNotifications(n => ({ ...n, [key]: { ...n[key], [ch]: !n[key][ch] } }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ channels, notifications, notifEmail, notifSms }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Notifications</h2>
        <Button onClick={handleSave}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Channel toggles */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 flex gap-4 flex-wrap">
        {[["in_app","In-App"],["email","Email"],["sms","SMS"]].map(([k,l]) => (
          <button key={k} onClick={() => toggleChannel(k)}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm border text-[10px] font-heading uppercase tracking-wider transition-all ${channels[k] ? "bg-primary/10 border-primary text-primary" : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/30"}`}>
            <span className={`w-2 h-2 rounded-full ${channels[k] ? "bg-primary" : "bg-[hsl(0,0%,30%)]"}`} />
            {l}
          </button>
        ))}
      </div>

      {/* Email & SMS destinations */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-heading uppercase tracking-wider text-white/40 mb-1.5">Notification Email</label>
          <Input value={notifEmail} onChange={e => setNotifEmail(e.target.value)}
            placeholder="email@example.com"
            className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
        </div>
        <div>
          <label className="block text-[10px] font-heading uppercase tracking-wider text-white/40 mb-1.5">SMS Number</label>
          <Input value={notifSms} onChange={e => setNotifSms(e.target.value)}
            placeholder="04XX XXX XXX"
            className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
        </div>
      </div>

      {/* Triggers table */}
      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            <th className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">Notification Event</th>
            <th className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">Priority</th>
            <th className="px-4 py-2.5 text-center font-heading text-[9px] uppercase tracking-wider text-white/30">In-App</th>
            <th className="px-4 py-2.5 text-center font-heading text-[9px] uppercase tracking-wider text-white/30">Email</th>
            <th className="px-4 py-2.5 text-center font-heading text-[9px] uppercase tracking-wider text-white/30">SMS</th>
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {TRIGGERS.map(t => (
              <tr key={t.key} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-4 py-2.5 text-white/70 text-[11px]">{t.label}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-heading uppercase border ${PRIORITIES[t.priority]}`}>{t.priority}</span>
                </td>
                {["in_app","email","sms"].map(ch => (
                  <td key={ch} className="px-4 py-2.5 text-center">
                    <button onClick={() => toggleNotif(t.key, ch)}
                      className={`w-8 h-4 rounded-full transition-all relative inline-flex ${notifications[t.key]?.[ch] ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${notifications[t.key]?.[ch] ? "left-4" : "left-0.5"}`} />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}