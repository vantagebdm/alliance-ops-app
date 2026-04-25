import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROTECTION_LEVELS = ["No Check", "Re-enter Password", "MFA Required", "Super Admin Approval", "Dual Approval"];

const SENSITIVE_ACTIONS = [
  { group: "Supplier & Payments", actions: [
    { key: "view_supplier_bank",    label: "View Supplier Bank Details" },
    { key: "edit_supplier_bank",    label: "Edit Supplier Bank Details" },
    { key: "approve_supplier_payment", label: "Approve Supplier Payments" },
  ]},
  { group: "Employee & Payroll", actions: [
    { key: "view_employee_bank",    label: "View Employee Bank Details" },
    { key: "edit_employee_bank",    label: "Edit Employee Bank Details" },
    { key: "view_pay_rates",        label: "View Payroll Pay Rates" },
    { key: "edit_pay_rates",        label: "Edit Payroll Pay Rates" },
    { key: "run_payroll",           label: "Run Payroll" },
    { key: "approve_payroll",       label: "Approve Payroll" },
  ]},
  { group: "BAS & Tax", actions: [
    { key: "prepare_bas",           label: "Prepare BAS" },
    { key: "lodge_bas",             label: "Mark BAS as Lodged" },
    { key: "unlock_bas",            label: "Unlock BAS Period" },
  ]},
  { group: "Accounting & Reconciliation", actions: [
    { key: "reverse_bank_recon",    label: "Reverse Bank Reconciliation" },
    { key: "create_journal",        label: "Create Manual Journals" },
    { key: "post_journal",          label: "Post Journals" },
    { key: "reverse_journal",       label: "Reverse Journals" },
  ]},
  { group: "Customer & Credit", actions: [
    { key: "change_credit_limit",   label: "Change Customer Credit Limit" },
    { key: "override_risk_score",   label: "Override Customer AI Risk Score" },
  ]},
  { group: "User & Permissions", actions: [
    { key: "change_permissions",    label: "Change User Permissions" },
    { key: "change_approval_limits",label: "Change Approval Limits" },
  ]},
  { group: "Exports", actions: [
    { key: "export_financial",      label: "Export Financial Reports" },
    { key: "export_payroll",        label: "Export Payroll Reports" },
    { key: "export_customer_supplier", label: "Export Customer/Supplier Data" },
  ]},
];

const DEFAULTS = {
  view_supplier_bank: "MFA Required",
  edit_supplier_bank: "MFA Required",
  approve_supplier_payment: "MFA Required",
  view_employee_bank: "MFA Required",
  edit_employee_bank: "MFA Required",
  view_pay_rates: "Re-enter Password",
  edit_pay_rates: "MFA Required",
  run_payroll: "MFA Required",
  approve_payroll: "Dual Approval",
  prepare_bas: "Re-enter Password",
  lodge_bas: "MFA Required",
  unlock_bas: "Super Admin Approval",
  reverse_bank_recon: "Super Admin Approval",
  create_journal: "Re-enter Password",
  post_journal: "MFA Required",
  reverse_journal: "Super Admin Approval",
  change_credit_limit: "Re-enter Password",
  override_risk_score: "Super Admin Approval",
  change_permissions: "Super Admin Approval",
  change_approval_limits: "Super Admin Approval",
  export_financial: "Re-enter Password",
  export_payroll: "MFA Required",
  export_customer_supplier: "Re-enter Password",
};

const levelColors = {
  "No Check":             "bg-[hsl(0,0%,16%)] text-white/30 border-[hsl(0,0%,22%)]",
  "Re-enter Password":    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "MFA Required":         "bg-primary/10 text-primary border-primary/30",
  "Super Admin Approval": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Dual Approval":        "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SensitiveActionTab() {
  const [protections, setProtections] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setProtections(p => ({ ...p, [key]: val }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Sensitive Action Protection</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <div className="p-3 bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm">
        <div className="flex flex-wrap gap-2">
          {PROTECTION_LEVELS.map(l => (
            <span key={l} className={`px-2.5 py-1 rounded-sm text-[10px] font-heading uppercase tracking-wider border ${levelColors[l]}`}>{l}</span>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-2">Select a protection level for each sensitive action. Permission must exist in User Management first — Security adds the second layer of protection.</p>
      </div>

      {SENSITIVE_ACTIONS.map(group => (
        <div key={group.group} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">{group.group}</p>
          </div>
          <div className="divide-y divide-[hsl(0,0%,14%)]">
            {group.actions.map(action => (
              <div key={action.key} className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-white/70">{action.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${levelColors[protections[action.key]] || levelColors["No Check"]}`}>
                    {protections[action.key] || "No Check"}
                  </span>
                  <Select value={protections[action.key] || "No Check"} onValueChange={v => set(action.key, v)}>
                    <SelectTrigger className="w-44 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                      {PROTECTION_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400/80 font-heading uppercase tracking-wider">
          ⚠ Access sequence: User must have permission in User Management → then must pass the security check defined above → action proceeds or is denied.
        </p>
      </div>
    </div>
  );
}