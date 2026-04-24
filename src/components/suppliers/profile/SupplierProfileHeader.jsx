import { useState, useRef } from "react";
import { Star, ShoppingCart, Upload, FileText, Edit2, CheckCircle, PauseCircle, PowerOff, RotateCcw, LogIn } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-300 border-green-500/30",
  preferred: "bg-primary/20 text-primary border-primary/30",
  inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  on_hold: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  under_review: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function SupplierProfileHeader({ supplier, onEdit, onClose, onStatusChanged, onNewPO, onViewOpenPOs }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const statusColor = STATUS_COLORS[supplier.status] || STATUS_COLORS.active;
  const statusLabel = (supplier.status || "active").replace("_", " ").toUpperCase();
  const isInactive = supplier.status === "inactive";
  const isOnHold = supplier.status === "on_hold";
  const isPreferred = supplier.preferred_supplier;

  const handleDeactivate = async () => {
    if (!confirm(isInactive ? "Reactivate this supplier?" : "Deactivate this supplier? It will remain in the system for record keeping.")) return;
    setSaving(true);
    await base44.entities.Supplier.update(supplier.id, { status: isInactive ? "active" : "inactive" });
    setSaving(false);
    onStatusChanged?.();
  };

  const handleMarkPreferred = async () => {
    setSaving(true);
    await base44.entities.Supplier.update(supplier.id, { preferred_supplier: !isPreferred, status: !isPreferred ? "preferred" : "active" });
    setSaving(false);
    onStatusChanged?.();
  };

  const handleSetOnHold = async () => {
    if (!confirm(isOnHold ? "Remove this supplier from hold?" : "Put this supplier on hold?")) return;
    setSaving(true);
    await base44.entities.Supplier.update(supplier.id, { status: isOnHold ? "active" : "on_hold" });
    setSaving(false);
    onStatusChanged?.();
  };

  const handleUploadPriceList = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const existing = supplier.attachments || [];
      await base44.entities.Supplier.update(supplier.id, {
        attachments: [...existing, {
          doc_type: "price_list",
          filename: file.name,
          url: file_url,
          uploaded_by: "user",
          upload_date: new Date().toISOString().split("T")[0],
        }],
        price_file_available: true,
      });
      onStatusChanged?.();
      alert("Price list uploaded successfully.");
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSupplierLogin = () => {
    if (!supplier.portal_url) return;
    const url = supplier.portal_url.startsWith("http") ? supplier.portal_url : `https://${supplier.portal_url}`;
    window.open(url, "_blank");
  };

  const QUICK_ACTIONS = [
    { icon: Edit2, label: "Edit", onClick: onEdit },
    { icon: ShoppingCart, label: "New PO", onClick: onNewPO },
    { icon: Upload, label: uploading ? "Uploading..." : "Upload Price List", onClick: handleUploadPriceList, disabled: uploading },
    { icon: FileText, label: "View Open POs", onClick: onViewOpenPOs },
    { icon: CheckCircle, label: isPreferred ? "Unmark Preferred" : "Mark Preferred", onClick: handleMarkPreferred, active: isPreferred },
    { icon: PauseCircle, label: isOnHold ? "Remove Hold" : "Set On Hold", onClick: handleSetOnHold, active: isOnHold },
    {
      icon: isInactive ? RotateCcw : PowerOff,
      label: isInactive ? "Reactivate" : "Deactivate",
      onClick: handleDeactivate,
      danger: !isInactive,
    },
  ];

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

        <div className="flex items-start gap-3 flex-shrink-0">
          {supplier.portal_url && (
            <button
              onClick={handleSupplierLogin}
              className="flex items-center gap-2 px-4 py-2 text-[11px] font-heading uppercase tracking-wider border-2 border-primary rounded-sm text-primary font-bold animate-pulse hover:animate-none hover:bg-primary hover:text-black transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" /> Supplier Login
            </button>
          )}
          <button onClick={onClose} className="text-white/40 hover:text-white mt-1 text-lg leading-none">✕</button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.xls,.xlsx,.csv" className="hidden" onChange={handleFileSelected} />
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
        {QUICK_ACTIONS.map(({ icon: Icon, label, onClick, danger, active, disabled, login }) => (
          <button key={label}
            onClick={onClick}
            disabled={disabled || saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-heading uppercase tracking-wider border rounded-sm transition-colors disabled:opacity-50 ${
              danger
                ? "bg-white/0 text-red-400/70 hover:text-red-400 border-red-500/20 hover:border-red-500/40 hover:bg-white/5"
                : login
                ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30 hover:bg-primary/30"
                : active
                ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30"
                : "bg-white/0 text-white/50 hover:text-white border-white/10 hover:border-white/30 hover:bg-white/5"
            }`}>
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}