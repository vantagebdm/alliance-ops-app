import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Field = ({ label, children, required }) => (
  <div>
    <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">
      {label}{required && " *"}
    </label>
    {children}
  </div>
);

const WAREHOUSES = ["Main Warehouse", "Karratha Branch", "Remote Store", "Workshop"];

const RECEIPT_TYPE_LABELS = {
  po_receipt: "PO Receipt",
  manual: "Manual Receipt",
  supplier_return_replacement: "Supplier Return Replacement",
  transfer_in: "Transfer In",
  warranty_replacement: "Warranty Replacement",
};

export default function ReceiptHeader({ form, update, grNumber, receiptType }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-heading text-base font-bold uppercase tracking-wider mb-1">Receipt Header</h2>
        <p className="text-xs text-muted-foreground">Core receipt identification and reference information.</p>
      </div>

      {/* Auto-generated info bar */}
      <div className="flex gap-4 bg-muted/30 border border-border rounded-sm px-4 py-3">
        <div>
          <div className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">GR Number</div>
          <div className="font-heading font-bold text-sm text-primary">{grNumber || "Auto-generated"}</div>
        </div>
        <div className="border-l border-border pl-4">
          <div className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Receipt Type</div>
          <div className="font-heading font-bold text-sm">{RECEIPT_TYPE_LABELS[receiptType] || receiptType}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Receipt Date" required>
          <Input type="date" value={form.receipt_date || ""} onChange={e => update("receipt_date", e.target.value)} className="rounded-sm h-8 text-sm" />
        </Field>
        <Field label="Received By">
          <Input value={form.received_by || ""} onChange={e => update("received_by", e.target.value)} placeholder="Staff name" className="rounded-sm h-8 text-sm" />
        </Field>
        <Field label="Checked By">
          <Input value={form.checked_by || ""} onChange={e => update("checked_by", e.target.value)} placeholder="Staff name" className="rounded-sm h-8 text-sm" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Supplier Invoice Number">
          <Input value={form.supplier_invoice_number || ""} onChange={e => update("supplier_invoice_number", e.target.value)} placeholder="INV-XXXXX" className="rounded-sm h-8 text-sm" />
        </Field>
        <Field label="Supplier Invoice Date">
          <Input type="date" value={form.supplier_invoice_date || ""} onChange={e => update("supplier_invoice_date", e.target.value)} className="rounded-sm h-8 text-sm" />
        </Field>
        <Field label="Supplier Invoice Total ($)">
          <Input type="number" value={form.supplier_invoice_total || ""} onChange={e => update("supplier_invoice_total", parseFloat(e.target.value) || 0)} placeholder="0.00" className="rounded-sm h-8 text-sm" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Packing Slip / Delivery Docket">
          <Input value={form.packing_slip_number || ""} onChange={e => update("packing_slip_number", e.target.value)} placeholder="DS-XXXXX" className="rounded-sm h-8 text-sm" />
        </Field>
        <Field label="Freight Reference / Consignment">
          <Input value={form.freight_reference || ""} onChange={e => update("freight_reference", e.target.value)} placeholder="CON-XXXXX" className="rounded-sm h-8 text-sm" />
        </Field>
        <Field label="Receiving Warehouse" required>
          <select
            value={form.warehouse || ""}
            onChange={e => update("warehouse", e.target.value)}
            className="flex h-8 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select warehouse...</option>
            {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Notes">
        <Textarea value={form.notes || ""} onChange={e => update("notes", e.target.value)} placeholder="Delivery notes, special conditions, etc." className="rounded-sm text-sm h-20" />
      </Field>
    </div>
  );
}