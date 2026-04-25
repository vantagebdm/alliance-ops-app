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

const STATUSES = ["Draft","Pending Approval","Approved","Picked","Packed","Dispatched","Invoiced","Closed","Cancelled"];
const PRICE_LEVELS = ["Retail","Trade","Fleet","Mining","Internal","Priority Parts Plus","Emergency 24/7"];
const TERMS = ["COD","Net 7","Net 14","Net 30","Net 30 EOM","Net 60"];

export default function SalesSettings() {
  const [s, setS] = useState({
    quote_validity: "30", order_expiry: "60", invoice_due: "Net 30",
    default_price_level: "Trade", max_discount: "10", min_margin: "15",
    allow_backorders: true, allow_negative_sales: false, allow_discounting: true,
    require_approval_margin: true, credit_check: true,
    block_suspended: true, block_credit_exceeded: true,
    allow_partial_invoice: true, allow_partial_dispatch: true,
    auto_quote_to_order: false, auto_invoice_from_dispatch: true,
    require_po_number: true, require_delivery_address: true,
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (v) => setS(s => ({ ...s, [k]: v }));
  const toggle = (k) => (v) => setS(s => ({ ...s, [k]: v }));
  const inp = (k) => (e) => setS(s => ({ ...s, [k]: e.target.value }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Sales Settings</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Quote Validity (Days)</label>
            <Input value={s.quote_validity} onChange={inp("quote_validity")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Sales Order Expiry (Days)</label>
            <Input value={s.order_expiry} onChange={inp("order_expiry")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Default Invoice Terms</label>
            <Select value={s.invoice_due} onValueChange={set("invoice_due")}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Default Customer Price Level</label>
            <Select value={s.default_price_level} onValueChange={set("default_price_level")}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{PRICE_LEVELS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Max Discount Without Approval (%)</label>
            <Input value={s.max_discount} onChange={inp("max_discount")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Minimum Gross Margin (%)</label>
            <Input value={s.min_margin} onChange={inp("min_margin")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Rules & Controls</h3>
        <Toggle label="Allow Backorders" value={s.allow_backorders} onChange={toggle("allow_backorders")} />
        <Toggle label="Allow Negative Stock Sales" value={s.allow_negative_sales} onChange={toggle("allow_negative_sales")} />
        <Toggle label="Allow Discounting" value={s.allow_discounting} onChange={toggle("allow_discounting")} />
        <Toggle label="Require Approval Below Minimum Margin" value={s.require_approval_margin} onChange={toggle("require_approval_margin")} />
        <Toggle label="Require Customer Credit Check Before Sales Order" value={s.credit_check} onChange={toggle("credit_check")} />
        <Toggle label="Block Sales if Account is Suspended" value={s.block_suspended} onChange={toggle("block_suspended")} />
        <Toggle label="Block Sales if Credit Limit Exceeded" value={s.block_credit_exceeded} onChange={toggle("block_credit_exceeded")} />
        <Toggle label="Allow Partial Invoicing" value={s.allow_partial_invoice} onChange={toggle("allow_partial_invoice")} />
        <Toggle label="Allow Partial Dispatch" value={s.allow_partial_dispatch} onChange={toggle("allow_partial_dispatch")} />
        <Toggle label="Auto-Convert Quote to Sales Order" value={s.auto_quote_to_order} onChange={toggle("auto_quote_to_order")} />
        <Toggle label="Auto-Create Invoice from Dispatched Order" value={s.auto_invoice_from_dispatch} onChange={toggle("auto_invoice_from_dispatch")} />
        <Toggle label="Require PO Number for Account Customers" value={s.require_po_number} onChange={toggle("require_po_number")} />
        <Toggle label="Require Delivery Address Before Dispatch" value={s.require_delivery_address} onChange={toggle("require_delivery_address")} />
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Order Status Workflow</h3>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status, i) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-sm text-[10px] font-heading uppercase border bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/60">{status}</span>
              {i < STATUSES.length - 1 && <span className="text-white/20 text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}