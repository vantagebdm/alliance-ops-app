import { useState } from "react";
import { Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Toggle = ({ label, desc, value, onChange, locked }) => (
  <div className="flex items-start justify-between py-3 border-b border-[hsl(0,0%,14%)] last:border-0">
    <div className="flex-1 pr-4">
      <div className="text-xs font-heading uppercase tracking-wider text-white flex items-center gap-2">
        {label}{locked && <Lock className="w-3 h-3 text-yellow-400" />}
      </div>
      {desc && <div className="text-[10px] text-white/30 mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => !locked && onChange(!value)} disabled={locked}
      className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 mt-0.5 ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"} ${locked ? "opacity-40 cursor-not-allowed" : ""}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

const SelectRow = ({ label, options, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-[hsl(0,0%,14%)] last:border-0">
    <span className="text-xs font-heading uppercase tracking-wider text-white/60">{label}</span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-52 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
        {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

const GL_ACCOUNTS = ["1100 – Accounts Receivable", "2100 – Accounts Payable", "1300 – Inventory Asset", "4000 – Sales Income", "5000 – Cost of Goods Sold", "4100 – Freight Income", "6100 – Freight Expense", "5900 – Stock Adjustment", "6900 – Bad Debt Expense", "1000 – Business Bank Account"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CURRENCIES = ["AUD","USD","NZD","EUR","GBP"];
const ROUNDING = ["None","Round to nearest cent","Round to nearest $1","Round to nearest $5","Round to nearest $10"];
const TERMS = ["COD","Net 7","Net 14","Net 30","Net 30 EOM","Net 60","Custom"];

export default function FinancialSettings() {
  const [settings, setSettings] = useState({
    fy_start: "July", currency: "AUD", decimal_places: "2",
    rounding: "Round to nearest cent",
    default_terms: "Net 30", customer_terms: "Net 30", supplier_terms: "Net 30",
    bank_account: "1000 – Business Bank Account",
    ar_account: "1100 – Accounts Receivable", ap_account: "2100 – Accounts Payable",
    inventory_account: "1300 – Inventory Asset", sales_account: "4000 – Sales Income",
    cogs_account: "5000 – Cost of Goods Sold", freight_income: "4100 – Freight Income",
    freight_expense: "6100 – Freight Expense", stock_adj_account: "5900 – Stock Adjustment",
    bad_debt_account: "6900 – Bad Debt Expense",
    lock_financial_periods: false, lock_after_reconciliation: true,
    lock_bas_periods: true, require_approval_locked: true,
    allow_manual_journals: true, require_journal_approval: true,
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));
  const toggle = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Financial Settings</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 mb-4 border-b border-[hsl(0,0%,16%)] pb-2">Operating Defaults</h3>
        <SelectRow label="Financial Year Start Month" options={MONTHS} value={settings.fy_start} onChange={set("fy_start")} />
        <SelectRow label="Default Currency" options={CURRENCIES} value={settings.currency} onChange={set("currency")} />
        <SelectRow label="Decimal Places" options={["2","3","4"]} value={settings.decimal_places} onChange={set("decimal_places")} />
        <SelectRow label="Rounding Rule" options={ROUNDING} value={settings.rounding} onChange={set("rounding")} />
        <SelectRow label="Default Payment Terms" options={TERMS} value={settings.default_terms} onChange={set("default_terms")} />
        <SelectRow label="Default Customer Terms" options={TERMS} value={settings.customer_terms} onChange={set("customer_terms")} />
        <SelectRow label="Default Supplier Terms" options={TERMS} value={settings.supplier_terms} onChange={set("supplier_terms")} />
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 mb-4 border-b border-[hsl(0,0%,16%)] pb-2">Default GL Accounts</h3>
        {[
          ["Bank Account","bank_account"], ["Accounts Receivable","ar_account"], ["Accounts Payable","ap_account"],
          ["Inventory Asset","inventory_account"], ["Sales Income","sales_account"], ["Cost of Goods Sold","cogs_account"],
          ["Freight Income","freight_income"], ["Freight Expense","freight_expense"],
          ["Stock Adjustment","stock_adj_account"], ["Bad Debt Expense","bad_debt_account"],
        ].map(([l, k]) => (
          <SelectRow key={k} label={l} options={GL_ACCOUNTS} value={settings[k]} onChange={set(k)} />
        ))}
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 mb-4 border-b border-[hsl(0,0%,16%)] pb-2">Period Controls</h3>
        <Toggle label="Lock Financial Periods" desc="Prevent posting to locked periods" value={settings.lock_financial_periods} onChange={toggle("lock_financial_periods")} />
        <Toggle label="Lock Month After Reconciliation" value={settings.lock_after_reconciliation} onChange={toggle("lock_after_reconciliation")} />
        <Toggle label="Lock BAS Lodged Periods" desc="Requires Super Admin to unlock" value={settings.lock_bas_periods} onChange={toggle("lock_bas_periods")} locked />
        <Toggle label="Require Approval to Post Into Locked Period" value={settings.require_approval_locked} onChange={toggle("require_approval_locked")} />
        <Toggle label="Allow Manual Journals" value={settings.allow_manual_journals} onChange={toggle("allow_manual_journals")} />
        <Toggle label="Require Journal Approval" value={settings.require_journal_approval} onChange={toggle("require_journal_approval")} />
      </div>
    </div>
  );
}