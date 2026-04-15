import { Package, ClipboardList, RefreshCw, ArrowDownToLine, ShieldCheck } from "lucide-react";

const TYPES = [
  {
    value: "po_receipt",
    label: "Receive Against Purchase Order",
    desc: "Match incoming stock to an open PO",
    icon: ClipboardList,
  },
  {
    value: "manual",
    label: "Manual Stock Receipt",
    desc: "No PO — emergency, counter or initial stock load",
    icon: Package,
  },
  {
    value: "supplier_return_replacement",
    label: "Supplier Return Replacement",
    desc: "Receiving replacement goods from a supplier RMA/return",
    icon: RefreshCw,
  },
  {
    value: "transfer_in",
    label: "Transfer In Receipt",
    desc: "Stock arriving from an internal transfer",
    icon: ArrowDownToLine,
  },
  {
    value: "warranty_replacement",
    label: "Warranty Replacement Receipt",
    desc: "Receiving replacement against a warranty claim",
    icon: ShieldCheck,
  },
];

export default function ReceiptTypeSelector({ value, onChange }) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="font-heading text-xl font-bold uppercase tracking-wider mb-1">Select Receipt Type</h2>
      <p className="text-muted-foreground text-sm mb-6">Choose the type of stock receipt to proceed.</p>
      <div className="space-y-3">
        {TYPES.map(t => {
          const Icon = t.icon;
          const active = value === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-sm border transition-all text-left ${
                active
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-white hover:border-primary/40 hover:bg-muted/20"
              }`}
            >
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${active ? "bg-primary" : "bg-muted"}`}>
                <Icon className={`w-5 h-5 ${active ? "text-black" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className={`font-heading font-bold uppercase tracking-wider text-sm ${active ? "text-foreground" : "text-foreground"}`}>
                  {t.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
              </div>
              {active && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}