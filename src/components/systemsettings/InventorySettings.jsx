import { useState } from "react";
import { Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-[hsl(0,0%,14%)] last:border-0">
    <div className="flex-1 pr-4">
      <div className="text-xs font-heading uppercase tracking-wider text-white">{label}</div>
      {desc && <div className="text-[10px] text-white/30 mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 mt-0.5 ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

const DEFAULT_REASONS = ["Stocktake variance","Damaged stock","Lost stock","Supplier short supply","Internal use","Warranty replacement","Write-off","Correction"];
const VALUATION = ["FIFO","Weighted Average","Standard Cost"];

export default function InventorySettings() {
  const [s, setS] = useState({
    allow_negative: false, require_approval_adj: true, require_reason_adj: true,
    enable_bins: true, enable_serial: false, enable_batch: true,
    enable_expiry: true, enable_stocktake_mode: true, lock_during_stocktake: true,
    allow_cycle_counts: true, enable_reorder_points: true,
    enable_min_max: true, enable_smart_reorder: true,
    valuation_method: "Weighted Average",
  });
  const [reasons, setReasons] = useState(DEFAULT_REASONS);
  const [newReason, setNewReason] = useState("");
  const [saved, setSaved] = useState(false);
  const toggle = (k) => (v) => setS(s => ({ ...s, [k]: v }));

  const addReason = () => { if (newReason.trim()) { setReasons(r => [...r, newReason.trim()]); setNewReason(""); } };
  const removeReason = (i) => setReasons(r => r.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Inventory Settings</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Stock Valuation</h3>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs font-heading uppercase tracking-wider text-white/60">Default Stock Valuation Method</span>
          <Select value={s.valuation_method} onValueChange={v => setS(x => ({ ...x, valuation_method: v }))}>
            <SelectTrigger className="w-52 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{VALUATION.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Controls</h3>
        <Toggle label="Allow Negative Stock" value={s.allow_negative} onChange={toggle("allow_negative")} />
        <Toggle label="Require Approval for Stock Adjustments" value={s.require_approval_adj} onChange={toggle("require_approval_adj")} />
        <Toggle label="Require Reason for Stock Adjustment" value={s.require_reason_adj} onChange={toggle("require_reason_adj")} />
        <Toggle label="Enable Bin Locations" value={s.enable_bins} onChange={toggle("enable_bins")} />
        <Toggle label="Enable Serial Numbers" value={s.enable_serial} onChange={toggle("enable_serial")} />
        <Toggle label="Enable Batch Numbers" value={s.enable_batch} onChange={toggle("enable_batch")} />
        <Toggle label="Enable Expiry Dates" value={s.enable_expiry} onChange={toggle("enable_expiry")} />
        <Toggle label="Enable Stocktake Mode" value={s.enable_stocktake_mode} onChange={toggle("enable_stocktake_mode")} />
        <Toggle label="Lock Inventory During Stocktake" value={s.lock_during_stocktake} onChange={toggle("lock_during_stocktake")} />
        <Toggle label="Allow Cycle Counts" value={s.allow_cycle_counts} onChange={toggle("allow_cycle_counts")} />
        <Toggle label="Enable Reorder Points" value={s.enable_reorder_points} onChange={toggle("enable_reorder_points")} />
        <Toggle label="Enable Min/Max Levels" value={s.enable_min_max} onChange={toggle("enable_min_max")} />
        <Toggle label="Enable Smart Reorder Suggestions" value={s.enable_smart_reorder} onChange={toggle("enable_smart_reorder")} />
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-3">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Stock Adjustment Reasons</h3>
        <div className="flex flex-wrap gap-2">
          {reasons.map((r, i) => (
            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white/60 text-[10px] font-heading uppercase">
              {r}
              <button onClick={() => removeReason(i)} className="text-white/20 hover:text-red-400"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newReason} onChange={e => setNewReason(e.target.value)} onKeyDown={e => e.key === "Enter" && addReason()}
            placeholder="Add reason..." className="flex-1 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
          <Button onClick={addReason} className="h-8 bg-primary text-black font-heading uppercase text-[10px] rounded-sm px-3"><Plus className="w-3 h-3" /></Button>
        </div>
      </div>
    </div>
  );
}