import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";

const MATCH_STATUSES = {
  not_matched: { label: "Not Matched", icon: Clock, color: "text-muted-foreground bg-muted" },
  matched: { label: "Matched", icon: CheckCircle2, color: "text-green-700 bg-green-50 border-green-200" },
  variance_detected: { label: "Variance Detected", icon: AlertTriangle, color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  pending_review: { label: "Pending Review", icon: XCircle, color: "text-blue-700 bg-blue-50 border-blue-200" },
};

export default function InvoiceMatching({ form, update, receiptTotal }) {
  const invoiceTotal = parseFloat(form.supplier_invoice_total || 0);
  const variance = invoiceTotal - receiptTotal;
  const hasVariance = invoiceTotal > 0 && Math.abs(variance) > 0.01;

  const matchStatus = !form.supplier_invoice_number || invoiceTotal === 0
    ? "not_matched"
    : hasVariance
    ? "variance_detected"
    : "matched";

  const StatusInfo = MATCH_STATUSES[matchStatus];
  const StatusIcon = StatusInfo.icon;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="font-heading text-base font-bold uppercase tracking-wider mb-1">Supplier Invoice Matching</h2>
        <p className="text-xs text-muted-foreground">Match the supplier invoice against this receipt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Invoice Number</label>
              <input
                type="text"
                value={form.supplier_invoice_number || ""}
                onChange={e => update("supplier_invoice_number", e.target.value)}
                placeholder="INV-XXXXX"
                className="flex h-8 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm"
              />
            </div>
            <div>
              <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Invoice Date</label>
              <input
                type="date"
                value={form.supplier_invoice_date || ""}
                onChange={e => update("supplier_invoice_date", e.target.value)}
                className="flex h-8 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Supplier Invoice Total ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.supplier_invoice_total || ""}
              onChange={e => update("supplier_invoice_total", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="flex h-8 w-48 rounded-sm border border-input bg-transparent px-3 py-1 text-sm"
            />
          </div>

          {hasVariance && (
            <div>
              <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Variance Note *</label>
              <textarea
                value={form.variance_note || ""}
                onChange={e => update("variance_note", e.target.value)}
                placeholder="Explain the variance (price difference, freight, etc.)"
                className="flex w-full rounded-sm border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm min-h-[60px]"
              />
            </div>
          )}
        </div>

        {/* Summary panel */}
        <div className="space-y-3">
          <div className="bg-muted/20 border border-border rounded-sm p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receipt Total</span>
              <span className="font-bold">${receiptTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice Total</span>
              <span className="font-bold">${invoiceTotal.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Variance</span>
              <span className={`font-bold ${hasVariance ? "text-yellow-600" : "text-green-600"}`}>
                {variance >= 0 ? "+" : ""}${variance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs font-heading font-bold uppercase tracking-wider ${StatusInfo.color}`}>
            <StatusIcon className="w-4 h-4" />
            {StatusInfo.label}
          </div>
        </div>
      </div>
    </div>
  );
}