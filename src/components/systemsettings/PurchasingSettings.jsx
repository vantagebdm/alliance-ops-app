import { useState } from "react";
import { Save } from "lucide-react";
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

const FREIGHT_METHODS = ["By Quantity","By Value","By Weight","Manual Allocation"];
const TERMS = ["COD","Net 7","Net 14","Net 30","Net 30 EOM","Net 60"];

export default function PurchasingSettings() {
  const [s, setS] = useState({
    default_supplier_terms: "Net 30", po_approval_limit: "5000", over_recv_tolerance: "5",
    require_all_po_approval: false, require_approval_above: true,
    allow_bill_without_po: false, allow_inactive_supplier: false,
    allow_price_override: true, require_reason_price_override: true,
    auto_bill_from_receipt: true, allow_partial_receiving: true,
    allow_over_receiving: false, require_delivery_docket: true,
    require_supplier_invoice: true, require_landed_cost: false,
    freight_allocation_method: "By Value",
  });
  const [saved, setSaved] = useState(false);
  const toggle = (k) => (v) => setS(s => ({ ...s, [k]: v }));
  const inp = (k) => (e) => setS(s => ({ ...s, [k]: e.target.value }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Purchasing Settings</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Default Supplier Terms</label>
            <Select value={s.default_supplier_terms} onValueChange={v => setS(x => ({ ...x, default_supplier_terms: v }))}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Default PO Approval Limit ($)</label>
            <Input value={s.po_approval_limit} onChange={inp("po_approval_limit")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Over-Receiving Tolerance (%)</label>
            <Input value={s.over_recv_tolerance} onChange={inp("over_recv_tolerance")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Freight Allocation Method</label>
            <Select value={s.freight_allocation_method} onValueChange={v => setS(x => ({ ...x, freight_allocation_method: v }))}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{FREIGHT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Rules & Controls</h3>
        <Toggle label="Require Approval for All Purchase Orders" value={s.require_all_po_approval} onChange={toggle("require_all_po_approval")} />
        <Toggle label="Require Approval Above Value Threshold" value={s.require_approval_above} onChange={toggle("require_approval_above")} />
        <Toggle label="Allow Direct Supplier Bill Without PO" value={s.allow_bill_without_po} onChange={toggle("allow_bill_without_po")} />
        <Toggle label="Allow Purchase from Inactive Supplier" value={s.allow_inactive_supplier} onChange={toggle("allow_inactive_supplier")} />
        <Toggle label="Allow Price Override on PO" value={s.allow_price_override} onChange={toggle("allow_price_override")} />
        <Toggle label="Require Reason for Price Override" value={s.require_reason_price_override} onChange={toggle("require_reason_price_override")} />
        <Toggle label="Auto-Create Supplier Bill from Received Stock" value={s.auto_bill_from_receipt} onChange={toggle("auto_bill_from_receipt")} />
        <Toggle label="Allow Partial Receiving" value={s.allow_partial_receiving} onChange={toggle("allow_partial_receiving")} />
        <Toggle label="Allow Over-Receiving" value={s.allow_over_receiving} onChange={toggle("allow_over_receiving")} />
        <Toggle label="Require Delivery Docket Upload" value={s.require_delivery_docket} onChange={toggle("require_delivery_docket")} />
        <Toggle label="Require Supplier Invoice Upload" value={s.require_supplier_invoice} onChange={toggle("require_supplier_invoice")} />
        <Toggle label="Require Landed Cost Allocation" value={s.require_landed_cost} onChange={toggle("require_landed_cost")} />
      </div>
    </div>
  );
}