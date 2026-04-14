import { Star, ShoppingCart, Upload, FileText, Phone, Edit2, CheckCircle, PauseCircle } from "lucide-react";

const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-300 border-green-500/30",
  preferred: "bg-primary/20 text-primary border-primary/30",
  inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  on_hold: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  under_review: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const QUICK_ACTIONS = [
  { icon: Edit2, label: "Edit" },
  { icon: ShoppingCart, label: "New PO" },
  { icon: Upload, label: "Upload Price List" },
  { icon: FileText, label: "View Open POs" },
  { icon: CheckCircle, label: "Mark Preferred" },
  { icon: PauseCircle, label: "Set On Hold" },
];

export default function SupplierProfileHeader({ supplier, onEdit, onClose }) {
  const statusColor = STATUS_COLORS[supplier.status] || STATUS_COLORS.active;
  const statusLabel = (supplier.status || "active").replace("_", " ").toUpperCase();

  return (
    <div className="bg-[hsl(0,0%,8%)] px-6 py-5 rounded-t-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-heading text-xl font-bold text-white uppercase tracking-wide truncate">
              {supplier.name}
            </h2>
            <span className={`inline-flex px-2 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider border rounded-sm flex-shrink-0 ${statusColor}`}>
              {statusLabel}
            </span>
            {supplier.preferred_supplier && (
              <span className="inline-flex px-2 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider border rounded-sm flex-shrink-0 bg-primary/20 text-primary border-primary/30">
                ★ Preferred
              </span>
            )}
          </div>
          {supplier.trading_name && (
            <p className="text-white/40 text-xs font-heading uppercase tracking-wider">Trading: {supplier.trading_name}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-3 text-[11px]">
            {supplier.supplier_code && (
              <span className="text-white/50 font-heading uppercase tracking-wider">Code: <span className="text-white/80">{supplier.supplier_code}</span></span>
            )}
            {supplier.account_number && (
              <span className="text-white/50 font-heading uppercase tracking-wider">Account: <span className="text-white/80">{supplier.account_number}</span></span>
            )}
            {supplier.payment_terms && (
              <span className="text-white/50 font-heading uppercase tracking-wider">Terms: <span className="text-white/80">{(supplier.payment_terms || "").replace("_", " ")}</span></span>
            )}
            {supplier.lead_time_standard && (
              <span className="text-white/50 font-heading uppercase tracking-wider">Lead: <span className="text-white/80">{supplier.lead_time_standard}d std</span></span>
            )}
            {supplier.city && (
              <span className="text-white/50 font-heading uppercase tracking-wider">Location: <span className="text-white/80">{supplier.city}{supplier.state ? `, ${supplier.state}` : ""}</span></span>
            )}
          </div>

          {supplier.rating && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < supplier.rating ? "text-amber-400 fill-amber-400" : "text-white/20"}`} />
              ))}
              <span className="text-white/40 text-[10px] ml-1">{supplier.rating}/5</span>
            </div>
          )}
        </div>

        <button onClick={onClose} className="text-white/40 hover:text-white flex-shrink-0 mt-1 text-lg leading-none">✕</button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
        {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
          <button key={label}
            onClick={label === "Edit" ? onEdit : undefined}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-heading uppercase tracking-wider text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-sm transition-colors bg-white/0 hover:bg-white/5">
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}