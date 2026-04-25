import { useState } from "react";
import { Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const DELIVERY_STATUSES = ["Awaiting Pick","Picked","Packed","Ready for Dispatch","Dispatched","In Transit","Delivered","POD Received","Delivery Failed"];
const FREIGHT_METHODS = ["Road Freight","Air Freight","Courier","Local Delivery","Customer Pickup","Mine Site Delivery"];
const DELIVERY_TERMS = ["EXW","FOB","CIF","DAP","DDP","Collect"];

export default function FreightDelivery() {
  const [s, setS] = useState({
    default_method: "Road Freight", default_terms: "DAP",
    freight_taxable: true, allow_freight_override: true,
    require_freight_cost: true, require_tracking: false,
    require_pod: false, enable_pickup: true,
    enable_local: true, enable_regional: true, enable_mine_site: true,
  });
  const [couriers, setCouriers] = useState(["Toll IPEC","StarTrack","TNT","Couriers Please","Northline"]);
  const [newCourier, setNewCourier] = useState("");
  const [saved, setSaved] = useState(false);
  const toggle = (k) => (v) => setS(x => ({ ...x, [k]: v }));
  const addCourier = () => { if (newCourier.trim()) { setCouriers(c => [...c, newCourier.trim()]); setNewCourier(""); } };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Freight & Delivery Settings</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Default Freight Method</label>
            <Select value={s.default_method} onValueChange={v => setS(x => ({ ...x, default_method: v }))}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{FREIGHT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Default Delivery Terms</label>
            <Select value={s.default_terms} onValueChange={v => setS(x => ({ ...x, default_terms: v }))}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{DELIVERY_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Controls</h3>
        <Toggle label="Freight Charge Taxable" value={s.freight_taxable} onChange={toggle("freight_taxable")} />
        <Toggle label="Allow Freight Override" value={s.allow_freight_override} onChange={toggle("allow_freight_override")} />
        <Toggle label="Require Freight Cost on Dispatch" value={s.require_freight_cost} onChange={toggle("require_freight_cost")} />
        <Toggle label="Require Tracking Number" value={s.require_tracking} onChange={toggle("require_tracking")} />
        <Toggle label="Require Proof of Delivery Upload" value={s.require_pod} onChange={toggle("require_pod")} />
        <Toggle label="Enable Customer Pickup" value={s.enable_pickup} onChange={toggle("enable_pickup")} />
        <Toggle label="Enable Local Delivery" value={s.enable_local} onChange={toggle("enable_local")} />
        <Toggle label="Enable Regional Freight" value={s.enable_regional} onChange={toggle("enable_regional")} />
        <Toggle label="Enable Mine Site Delivery" value={s.enable_mine_site} onChange={toggle("enable_mine_site")} />
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-3">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Courier List</h3>
        <div className="flex flex-wrap gap-2">
          {couriers.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white/60 text-[10px] font-heading uppercase">
              {c}
              <button onClick={() => setCouriers(x => x.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-400"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newCourier} onChange={e => setNewCourier(e.target.value)} onKeyDown={e => e.key === "Enter" && addCourier()}
            placeholder="Add courier..." className="flex-1 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          <Button onClick={addCourier} className="h-9 bg-primary text-black font-heading uppercase text-[10px] rounded-sm px-3"><Plus className="w-3 h-3" /></Button>
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Delivery Status Workflow</h3>
        <div className="flex flex-wrap gap-2">
          {DELIVERY_STATUSES.map((status, i) => (
            <div key={status} className="flex items-center gap-1">
              <span className="px-2.5 py-1 rounded-sm text-[10px] font-heading uppercase border bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/60">{status}</span>
              {i < DELIVERY_STATUSES.length - 1 && <span className="text-white/20 text-[10px]">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}