import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Search, AlertTriangle, CheckCircle, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_APPROVAL_LIMITS } from "@/lib/permissions";

const APPROVAL_TYPES = [
  { key: "purchase_order", label: "Purchase Order", symbol: "$", desc: "Max PO value this user can approve" },
  { key: "supplier_bill", label: "Supplier Bill", symbol: "$", desc: "Max supplier bill amount" },
  { key: "sales_discount_pct", label: "Sales Discount", symbol: "%", desc: "Max discount percentage on quotes/orders" },
  { key: "credit_note", label: "Credit Note", symbol: "$", desc: "Max credit note value" },
  { key: "stock_adjustment", label: "Stock Adjustment", symbol: "$", desc: "Max stock adjustment value" },
  { key: "customer_credit_limit", label: "Customer Credit Limit", symbol: "$", desc: "Max credit limit they can set on customers" },
  { key: "supplier_payment", label: "Supplier Payment", symbol: "$", desc: "Max supplier payment amount" },
  { key: "payroll", label: "Payroll Authority", symbol: "bool", desc: "Can approve and process payroll runs" },
  { key: "journal", label: "Journal Entry", symbol: "$", desc: "Max journal entry value" },
  { key: "bas_lodgement", label: "BAS Lodgement", symbol: "bool", desc: "Can mark BAS as lodged with ATO" },
];

function LimitInput({ value, symbol, onChange }) {
  if (symbol === "bool") {
    return (
      <button onClick={() => onChange(!value)}
        className={`px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${value
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
        {value ? <><CheckCircle className="w-3 h-3 inline mr-1" />Authorised</> : "Not Authorised"}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <span className="text-white/40 text-xs font-heading px-2 py-1 bg-[hsl(0,0%,15%)] border border-r-0 border-[hsl(0,0%,22%)] rounded-l-sm">{symbol}</span>
        <Input
          type="number"
          value={value === -1 ? "" : (value || "")}
          onChange={e => onChange(e.target.value === "" ? -1 : parseFloat(e.target.value) || 0)}
          placeholder="Unlimited"
          className="w-28 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm rounded-l-none text-xs text-right"
        />
      </div>
      {value === -1 && <span className="text-[10px] text-primary font-heading uppercase">Unlimited</span>}
      {value === 0 && <span className="text-[10px] text-red-400 font-heading uppercase">No Authority</span>}
    </div>
  );
}

export default function ApprovalLimitsTab() {
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [limits, setLimits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.UserProfile.list("-created_date", 200);
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSelect = (p) => {
    setSelected(p);
    const roleLimits = DEFAULT_APPROVAL_LIMITS[p.role_name] || {};
    setLimits({ ...roleLimits, ...(p.approval_limits || {}) });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.entities.UserProfile.update(selected.id, { approval_limits: limits });
    setSaving(false);
    await load();
  };

  const setLimit = (key, value) => setLimits(l => ({ ...l, [key]: value }));

  const getLimitDisplay = (value, symbol) => {
    if (symbol === "bool") return value ? "Authorised" : "None";
    if (value === -1) return "Unlimited";
    if (value === 0) return "None";
    return `${symbol}${value?.toLocaleString() || 0}`;
  };

  const filtered = profiles.filter(p =>
    !search || `${p.first_name} ${p.last_name} ${p.email} ${p.role_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-4">
      {/* User list */}
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
              const roleLimits = DEFAULT_APPROVAL_LIMITS[p.role_name] || {};
              const poLimit = p.approval_limits?.purchase_order ?? roleLimits.purchase_order ?? 0;
              return (
                <div key={p.id} onClick={() => handleSelect(p)}
                  className={`px-3 py-2.5 rounded-sm cursor-pointer transition-all border ${selected?.id === p.id ? "bg-primary/10 border-primary/30" : "bg-[hsl(0,0%,11%)] border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,25%)]"}`}>
                  <p className="text-xs font-heading text-white">{p.first_name} {p.last_name}</p>
                  <p className="text-[10px] text-white/30">{p.role_name || "No Role"}</p>
                  <p className="text-[10px] text-primary/60 mt-0.5">PO: {poLimit === -1 ? "Unlimited" : `$${(poLimit||0).toLocaleString()}`}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Limits editor */}
      <div className="flex-1 space-y-4">
        {!selected ? (
          <div className="text-center py-16 text-white/25 font-heading uppercase tracking-wider text-xs">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-white/10" />
            Select a user to set approval limits
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm uppercase tracking-wider text-white">{selected.first_name} {selected.last_name}</h3>
                <p className="text-xs text-white/30">{selected.role_name} — custom limits override role defaults</p>
              </div>
              <Button onClick={handleSave} disabled={saving}
                className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
                <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving..." : "Save Limits"}
              </Button>
            </div>

            <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,9%)]">
                <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Approval Limits</p>
                <p className="text-[10px] text-white/20 mt-0.5">Enter -1 or leave blank for unlimited. 0 = no approval authority.</p>
              </div>
              <div className="divide-y divide-[hsl(0,0%,14%)]">
                {APPROVAL_TYPES.map(({ key, label, symbol, desc }) => (
                  <div key={key} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs font-heading uppercase tracking-wider text-white">{label}</p>
                      <p className="text-[10px] text-white/30">{desc}</p>
                    </div>
                    <LimitInput value={limits[key]} symbol={symbol} onChange={v => setLimit(key, v)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
              <p className="text-[10px] text-yellow-400/70 font-heading uppercase tracking-wider">
                ⚠ If a transaction exceeds a user's approval limit, it will be locked and flagged for escalation to an authorised approver. All approvals are recorded in the Audit Log.
              </p>
            </div>

            {/* Role defaults reference */}
            <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,9%)]">
                <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Role Default Limits for: {selected.role_name}</p>
              </div>
              <div className="px-4 py-2 flex flex-wrap gap-3">
                {APPROVAL_TYPES.map(({ key, label, symbol }) => {
                  const defVal = DEFAULT_APPROVAL_LIMITS[selected.role_name]?.[key];
                  return (
                    <div key={key} className="text-[10px] text-white/40">
                      <span className="text-white/25">{label}: </span>
                      <span className="text-white/50">{getLimitDisplay(defVal, symbol)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}