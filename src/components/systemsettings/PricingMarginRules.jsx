import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const PctField = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">{label}</label>
    <div className="relative">
      <Input value={value} onChange={onChange} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs pr-8" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">%</span>
    </div>
  </div>
);

const PRICING_TIERS = ["Retail","Trade","Fleet","Mining","Internal","Priority Parts Plus","Emergency 24/7"];

export default function PricingMarginRules() {
  const [s, setS] = useState({
    default_markup: "35", default_margin: "26", min_margin: "15", target_margin: "30",
    trade_margin: "25", retail_margin: "35", fleet_margin: "22", mining_margin: "28",
    emergency_surcharge: "20", freight_markup: "15", consumables_markup: "40", supplier_buffer: "5",
    auto_sell_from_cost: true, auto_calculate_margin: true,
    warn_below_min: true, block_below_min: false, allow_override: true,
    require_approval_override: true, track_override_audit: true,
  });
  const [saved, setSaved] = useState(false);
  const inp = (k) => (e) => setS(s => ({ ...s, [k]: e.target.value }));
  const toggle = (k) => (v) => setS(s => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Pricing & Margin Rules</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Global Margin Targets</h3>
        <div className="grid grid-cols-2 gap-4">
          <PctField label="Default Markup" value={s.default_markup} onChange={inp("default_markup")} />
          <PctField label="Default Gross Margin" value={s.default_margin} onChange={inp("default_margin")} />
          <PctField label="Minimum Acceptable Margin" value={s.min_margin} onChange={inp("min_margin")} />
          <PctField label="Target Margin" value={s.target_margin} onChange={inp("target_margin")} />
          <PctField label="Emergency / After-Hours Surcharge" value={s.emergency_surcharge} onChange={inp("emergency_surcharge")} />
          <PctField label="Freight Markup" value={s.freight_markup} onChange={inp("freight_markup")} />
          <PctField label="Consumables Markup" value={s.consumables_markup} onChange={inp("consumables_markup")} />
          <PctField label="Supplier Price Increase Buffer" value={s.supplier_buffer} onChange={inp("supplier_buffer")} />
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Customer Tier Margins</h3>
        <div className="grid grid-cols-2 gap-4">
          <PctField label="Trade Customer Margin" value={s.trade_margin} onChange={inp("trade_margin")} />
          <PctField label="Retail Customer Margin" value={s.retail_margin} onChange={inp("retail_margin")} />
          <PctField label="Fleet Customer Margin" value={s.fleet_margin} onChange={inp("fleet_margin")} />
          <PctField label="Mining Customer Margin" value={s.mining_margin} onChange={inp("mining_margin")} />
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Controls</h3>
        <Toggle label="Auto-Calculate Sell Price from Cost" value={s.auto_sell_from_cost} onChange={toggle("auto_sell_from_cost")} />
        <Toggle label="Auto-Calculate Margin" value={s.auto_calculate_margin} onChange={toggle("auto_calculate_margin")} />
        <Toggle label="Warn Below Minimum Margin" value={s.warn_below_min} onChange={toggle("warn_below_min")} />
        <Toggle label="Block Sale Below Minimum Margin Unless Approved" value={s.block_below_min} onChange={toggle("block_below_min")} />
        <Toggle label="Allow User Margin Override" value={s.allow_override} onChange={toggle("allow_override")} />
        <Toggle label="Require Approval for Margin Override" value={s.require_approval_override} onChange={toggle("require_approval_override")} />
        <Toggle label="Track Margin Override in Audit Log" value={s.track_override_audit} onChange={toggle("track_override_audit")} />
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Pricing Tiers</h3>
        <div className="flex flex-wrap gap-2">
          {PRICING_TIERS.map(t => (
            <span key={t} className="px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase border bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/60">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}