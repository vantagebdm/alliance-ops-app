import { useState } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function GSTBASSettings() {
  const [settings, setSettings] = useState({
    gst_registered: true, gst_start_date: "2010-07-01",
    reporting_basis: "Accrual", bas_frequency: "Quarterly",
    gst_on_sales: "Taxable (10%)", gst_on_purchases: "Taxable (10%)",
    gst_free_code: "GST-FREE", input_taxed_code: "INPUT-TAXED",
    payg_enabled: true, bas_reminder_day: "20", bas_payment_day: "28",
    auto_calculate_gst: true, show_gst_inclusive: true,
    show_gst_exclusive: false, allow_gst_override: false,
    require_reason_gst_override: true, lock_bas_after_lodgement: true,
    require_bas_review: true,
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));
  const toggle = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">GST & BAS Settings</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-sm">
        <p className="text-[10px] text-blue-400 font-heading uppercase">BAS and GST figures are system-generated estimates and must be reviewed by a registered BAS agent or accountant before lodgement.</p>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-4">GST Registration</h3>
        <Toggle label="GST Registered" value={settings.gst_registered} onChange={toggle("gst_registered")} />
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">GST Registration Start Date</label>
            <Input type="date" value={settings.gst_start_date} onChange={e => set("gst_start_date")(e.target.value)}
              className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          {[
            ["Reporting Basis", "reporting_basis", ["Cash","Accrual"]],
            ["BAS Frequency", "bas_frequency", ["Monthly","Quarterly","Annually"]],
            ["Default GST on Sales", "gst_on_sales", ["Taxable (10%)","GST-Free","Out of Scope","Input Taxed"]],
            ["Default GST on Purchases", "gst_on_purchases", ["Taxable (10%)","GST-Free","Out of Scope","Input Taxed"]],
            ["GST-Free Sales Code", "gst_free_code", ["GST-FREE","EXEMPT","OUT-OF-SCOPE"]],
            ["Input-Taxed Purchase Code", "input_taxed_code", ["INPUT-TAXED","FINANCIAL","RESIDENTIAL"]],
          ].map(([l, k, opts]) => (
            <div key={k}>
              <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">{l}</label>
              <Select value={settings[k]} onValueChange={set(k)}>
                <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                  {opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">BAS Lodgement Reminder Day</label>
            <Input value={settings.bas_reminder_day} onChange={e => set("bas_reminder_day")(e.target.value)}
              className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">BAS Payment Due Reminder Day</label>
            <Input value={settings.bas_payment_day} onChange={e => set("bas_payment_day")(e.target.value)}
              className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-4">Controls</h3>
        <Toggle label="Automatically Calculate GST" value={settings.auto_calculate_gst} onChange={toggle("auto_calculate_gst")} />
        <Toggle label="Show GST-Inclusive Prices" value={settings.show_gst_inclusive} onChange={toggle("show_gst_inclusive")} />
        <Toggle label="Show GST-Exclusive Prices" value={settings.show_gst_exclusive} onChange={toggle("show_gst_exclusive")} />
        <Toggle label="Allow GST Override on Transactions" value={settings.allow_gst_override} onChange={toggle("allow_gst_override")} />
        <Toggle label="Require Reason for GST Override" value={settings.require_reason_gst_override} onChange={toggle("require_reason_gst_override")} />
        <Toggle label="Lock BAS Period After Lodgement" desc="Requires Super Admin to unlock" value={settings.lock_bas_after_lodgement} onChange={toggle("lock_bas_after_lodgement")} />
        <Toggle label="Require BAS Review Before Lodgement" value={settings.require_bas_review} onChange={toggle("require_bas_review")} />
        <Toggle label="PAYG Withholding Enabled" value={settings.payg_enabled} onChange={toggle("payg_enabled")} />
      </div>
    </div>
  );
}