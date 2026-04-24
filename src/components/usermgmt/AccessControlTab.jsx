import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Save, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FIELD_RESTRICTIONS = [
  { key: "hide_cost_price", label: "Cost Price", desc: "Hide unit cost and landed cost from this user" },
  { key: "hide_sell_margins", label: "Sell Margins / Gross Profit", desc: "Hide margin % and GP on quotes, orders and invoices" },
  { key: "hide_bank_balances", label: "Bank Balances", desc: "Hide all bank account balances and cashflow data" },
  { key: "hide_payroll_info", label: "Payroll Information", desc: "Restrict all payroll, pay rates, and employee banking" },
  { key: "hide_bas_gst", label: "BAS & GST Data", desc: "Restrict BAS figures and GST reporting" },
  { key: "hide_supplier_bank", label: "Supplier Bank Details", desc: "Mask supplier BSB and account numbers" },
  { key: "hide_customer_credit", label: "Customer Credit Limits", desc: "Hide credit limit and exposure data for customers" },
  { key: "hide_financial_reports", label: "Financial Reports", desc: "Restrict access to P&L, Balance Sheet, Trial Balance" },
];

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${value
        ? "bg-red-500/10 border-red-500/30 text-red-400"
        : "bg-green-500/10 border-green-500/30 text-green-400"}`}>
      {value ? <><Lock className="w-3 h-3" /> Restricted</> : <><Eye className="w-3 h-3" /> Allowed</>}
    </button>
  );
}

export default function AccessControlTab() {
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localRestrictions, setLocalRestrictions] = useState({});
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.UserProfile.list("-created_date", 200);
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSelectUser = (p) => {
    setSelected(p);
    setLocalRestrictions({
      hide_cost_price: p.hide_cost_price || false,
      hide_sell_margins: p.hide_sell_margins || false,
      hide_bank_balances: p.hide_bank_balances || false,
      hide_payroll_info: p.hide_payroll_info || false,
      hide_bas_gst: p.hide_bas_gst || false,
      hide_supplier_bank: p.hide_supplier_bank || false,
      hide_customer_credit: p.hide_customer_credit || false,
      hide_financial_reports: p.hide_financial_reports || false,
    });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.entities.UserProfile.update(selected.id, localRestrictions);
    setSaving(false);
    await load();
  };

  const filtered = profiles.filter(p =>
    !search || `${p.first_name} ${p.last_name} ${p.email} ${p.department}`.toLowerCase().includes(search.toLowerCase())
  );

  const restrictedCount = Object.values(localRestrictions).filter(Boolean).length;

  return (
    <div className="flex gap-4">
      {/* User selector */}
      <div className="w-64 flex-shrink-0 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,20%)] text-white/70 rounded-sm text-xs px-3 py-2 pl-8 focus:outline-none focus:border-primary/40" />
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[hsl(0,0%,25%)] border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {filtered.map(p => {
              const hasRestrictions = [p.hide_cost_price, p.hide_sell_margins, p.hide_bank_balances, p.hide_payroll_info, p.hide_bas_gst, p.hide_supplier_bank, p.hide_customer_credit, p.hide_financial_reports].some(Boolean);
              return (
                <div key={p.id} onClick={() => handleSelectUser(p)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-sm cursor-pointer transition-all border ${selected?.id === p.id ? "bg-primary/10 border-primary/30" : "bg-[hsl(0,0%,11%)] border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,25%)]"}`}>
                  <div className="min-w-0">
                    <p className="text-xs font-heading text-white truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-[10px] text-white/30 truncate">{p.role_name || "No Role"}</p>
                  </div>
                  {hasRestrictions && <Lock className="w-3 h-3 text-red-400 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Restriction controls */}
      <div className="flex-1 space-y-4">
        {!selected ? (
          <div className="text-center py-16 text-white/25 font-heading uppercase tracking-wider text-xs">
            <Lock className="w-10 h-10 mx-auto mb-2 text-white/10" />
            Select a user to manage field-level access restrictions
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm uppercase tracking-wider text-white">{selected.first_name} {selected.last_name}</h3>
                <p className="text-xs text-white/30">{selected.email} · {selected.role_name}</p>
              </div>
              <div className="flex items-center gap-3">
                {restrictedCount > 0 && (
                  <span className="text-[10px] font-heading uppercase tracking-wider text-red-400 border border-red-500/30 px-2 py-1 rounded-sm bg-red-500/10">
                    {restrictedCount} restriction{restrictedCount !== 1 ? "s" : ""} active
                  </span>
                )}
                <Button onClick={handleSave} disabled={saving}
                  className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
                  <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving..." : "Save Restrictions"}
                </Button>
              </div>
            </div>

            <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,9%)]">
                <h4 className="font-heading text-[10px] uppercase tracking-widest text-white/30">Field-Level Security Restrictions</h4>
                <p className="text-[10px] text-white/25 mt-0.5">Toggle ON to restrict this user from seeing the specified data.</p>
              </div>
              <div className="divide-y divide-[hsl(0,0%,14%)]">
                {FIELD_RESTRICTIONS.map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between px-4 py-3.5">
                    <div>
                      <p className="text-xs font-heading uppercase tracking-wider text-white">{label}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
                    </div>
                    <Toggle value={localRestrictions[key] || false} onChange={v => setLocalRestrictions(r => ({ ...r, [key]: v }))} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,9%)]">
                <h4 className="font-heading text-[10px] uppercase tracking-widest text-white/30">Data Scope Restrictions</h4>
              </div>
              <div className="divide-y divide-[hsl(0,0%,14%)]">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="text-xs font-heading uppercase tracking-wider text-white">Supplier Visibility</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Control which suppliers this user can see</p>
                  </div>
                  <span className="text-xs text-green-400 font-heading uppercase">All Suppliers</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="text-xs font-heading uppercase tracking-wider text-white">Customer Visibility</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Control which customers this user can see</p>
                  </div>
                  <span className="text-xs text-green-400 font-heading uppercase">All Customers</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="text-xs font-heading uppercase tracking-wider text-white">Warehouse Access</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Default warehouse: {selected.default_warehouse || "All warehouses"}</p>
                  </div>
                  <span className="text-xs text-white/40 font-heading uppercase">{selected.default_warehouse || "Unrestricted"}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
              <p className="text-[10px] text-yellow-400/70 font-heading uppercase tracking-wider">
                ⚠ Sensitive changes to user access restrictions require re-authentication and are recorded in the Audit Log.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}