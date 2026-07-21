import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { postInvoiceToLedger } from "@/lib/accountingLedger";
import { previewDocNumber, generateDocNumber } from "@/hooks/useDocNumber";
import { generateAndUploadInvoicePDF } from "@/lib/invoicePdf";
import { X, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const today = format(new Date(), "yyyy-MM-dd");

const INVOICE_BASIS = [
  { value: "dispatched", label: "Invoice Dispatched Items Only" },
  { value: "remaining", label: "Invoice All Remaining Order Lines" },
  { value: "selected", label: "Invoice Selected Lines Only" },
];

const INELIGIBLE_STATUSES = ["cancelled", "pending"];
const ELIGIBLE_STATUSES = ["confirmed", "processing", "ready", "dispatched", "delivered"];

function calcDueDate(terms) {
  const d = new Date();
  if (!terms) return today;
  if (terms === "7_days") d.setDate(d.getDate() + 7);
  else if (terms === "14_days") d.setDate(d.getDate() + 14);
  else if (terms === "21_days") d.setDate(d.getDate() + 21);
  else if (terms === "30_days") d.setDate(d.getDate() + 30);
  else if (terms === "30_days_eom") { d.setMonth(d.getMonth() + 1); d.setDate(0); d.setDate(d.getDate() + 30); }
  return format(d, "yyyy-MM-dd");
}

function FieldLabel({ children, required }) {
  return (
    <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1 block">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export default function InvoiceFromOrderModal({ order, onClose, onSaved }) {
  const [basis, setBasis] = useState("dispatched");
  const [lines, setLines] = useState([]);
  const [form, setForm] = useState({
    invoice_number: "",
    invoice_date: today,
    due_date: calcDueDate(order.payment_terms),
    reference: "",
    billing_email: order.billing_email || "",
    customer_po_number: order.customer_po_number || "",
    job_number: order.job_number || "",
    internal_notes: order.notes || "",
    customer_notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveAction, setSaveAction] = useState("invoice");
  const [warning, setWarning] = useState(null);
  const [existingInvoices, setExistingInvoices] = useState([]);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load preview invoice number on mount
  useEffect(() => {
    previewDocNumber("invoice").then(num => {
      if (num) setForm(f => ({ ...f, invoice_number: num }));
    }).catch(() => {});
  }, []);

  // Load existing invoices for this order to compute already-invoiced quantities
  useEffect(() => {
    base44.entities.Invoice.filter({ order_id: order.id }, "-created_date", 50)
      .then(setExistingInvoices)
      .catch(() => setExistingInvoices([]));
  }, [order.id]);

  // Build lines whenever basis or existingInvoices changes
  useEffect(() => {
    const orderItems = order.items || [];

    // Build already-invoiced qty map per part_number+description
    const invoicedMap = {};
    existingInvoices.forEach(inv => {
      if (inv.status === "cancelled") return;
      (inv.items || []).forEach(li => {
        const key = `${li.part_number || ""}|${li.description || ""}`;
        invoicedMap[key] = (invoicedMap[key] || 0) + (Number(li.quantity) || 0);
      });
    });

    const built = orderItems.map(item => {
      const ordered = Number(item.quantity) || 0;
      const dispatched = Number(item.dispatched_qty) || 0;
      const key = `${item.part_number || ""}|${item.description || ""}`;
      const invoiced = invoicedMap[key] || 0;

      let available = 0;
      if (basis === "dispatched") available = Math.max(0, dispatched - invoiced);
      else available = Math.max(0, ordered - invoiced);

      return {
        _key: key,
        part_number: item.part_number || "",
        description: item.description || "",
        ordered_qty: ordered,
        dispatched_qty: dispatched,
        invoiced_qty: invoiced,
        available_qty: available,
        invoice_qty: available,
        unit_price: Number(item.unit_price) || 0,
        discount: 0,
        gst: true,
        selected: available > 0,
        total: available * (Number(item.unit_price) || 0),
      };
    });

    setLines(built);

    // Warnings
    const allInvoiced = built.every(l => l.available_qty === 0);
    if (allInvoiced) setWarning("This order has already been fully invoiced.");
    else if (basis === "dispatched" && built.every(l => l.dispatched_qty === 0)) {
      setWarning("No items have been dispatched yet. Invoice may be premature.");
    } else setWarning(null);
  }, [basis, existingInvoices, order.items]);

  const updateLine = (i, k, v) => {
    setLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l;
      const updated = { ...l, [k]: v };
      if (["invoice_qty", "unit_price", "discount"].includes(k)) {
        const qty = Number(updated.invoice_qty) || 0;
        const price = Number(updated.unit_price) || 0;
        const disc = Number(updated.discount) || 0;
        updated.total = qty * price * (1 - disc / 100);
      }
      return updated;
    }));
  };

  const addChargeLine = (desc) => setLines(prev => [...prev, {
    _key: `charge_${Date.now()}`,
    part_number: "", description: desc, ordered_qty: 0, dispatched_qty: 0,
    invoiced_qty: 0, available_qty: 0, invoice_qty: 1,
    unit_price: 0, discount: 0, gst: true, selected: true,
    total: 0, _charge: true,
  }]);

  const removeLine = (i) => setLines(prev => prev.filter((_, idx) => idx !== i));

  const activeLines = lines.filter(l => basis === "selected" ? l.selected : l.invoice_qty > 0);

  const subtotal = activeLines.reduce((s, l) => s + (Number(l.total) || 0), 0);
  const gstAmount = activeLines.filter(l => l.gst).reduce((s, l) => s + (Number(l.total) || 0) * 0.1, 0);
  const totalAmount = subtotal + gstAmount;

  const isIneligible = INELIGIBLE_STATUSES.includes(order.status);

  const validate = (action) => {
    if (!activeLines.length || activeLines.every(l => !(l.invoice_qty > 0) && !l._charge)) return "No invoiceable lines selected.";
    if (totalAmount <= 0) return "Invoice total must be greater than $0.";
    if (action === "email" && !form.billing_email) return "Billing email required to email invoice.";
    return null;
  };

  const save = async (action) => {
    setSaveAction(action);
    const err = validate(action);
    if (err) { alert(err); return; }
    setSaving(true);
    try {
      // Use the preview number already shown to the user (with duplicate check)
      const invoiceNumber = await generateDocNumber("invoice", null, form.invoice_number);
      setForm(f => ({ ...f, invoice_number: invoiceNumber }));

      const invoiceItems = activeLines
        .filter(l => l._charge ? true : l.invoice_qty > 0)
        .map(l => ({
          part_number: l.part_number,
          description: l.description,
          quantity: l.invoice_qty,
          unit_price: l.unit_price,
          discount: l.discount,
          total: l.total,
        }));

      const invoiceStatus = action === "draft" ? "draft" : action === "paid" ? "paid" : "sent";
      const paidDate = action === "paid" ? today : null;

      const invoiceData = {
        ...form,
        invoice_number: invoiceNumber,
        invoice_source: "sales_order",
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        company: order.company || "",
        billing_address: order.delivery_address || "",
        delivery_address: order.delivery_address || "",
        sales_order_reference: order.order_number,
        items: invoiceItems,
        subtotal,
        gst: gstAmount,
        total: totalAmount,
        status: invoiceStatus,
        paid_date: paidDate,
        payment_method: "bank_transfer",
      };

      const invoice = await base44.entities.Invoice.create(invoiceData);

      // Auto-regenerate PDF when marked as paid
      if (action === "paid") {
        try {
          await generateAndUploadInvoicePDF({ ...invoiceData, paid_date: paidDate }, base44);
        } catch (_) {}
      }

      // Post to accounting ledger
      await postInvoiceToLedger(invoice);

      // Update order: compute newly invoiced state
      const updatedItems = (order.items || []).map(item => {
        const match = activeLines.find(l => l.part_number === item.part_number && l.description === item.description);
        if (!match) return item;
        return { ...item, invoiced_qty: (Number(item.invoiced_qty) || 0) + (Number(match.invoice_qty) || 0) };
      });

      // Determine new invoice_status for order
      const totalOrdered = updatedItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
      const totalInvoiced = updatedItems.reduce((s, i) => s + (Number(i.invoiced_qty) || 0), 0);
      const newInvoiceStatus = totalInvoiced >= totalOrdered ? "fully_invoiced" : totalInvoiced > 0 ? "partially_invoiced" : "not_invoiced";

      await base44.entities.SalesOrder.update(order.id, {
        items: updatedItems,
        invoice_status: newInvoiceStatus,
        linked_invoice_id: invoice.id,
        linked_invoice_number: invoice.invoice_number,
      });

      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  if (isIneligible) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[hsl(0,0%,10%)] w-full max-w-md rounded-sm shadow-2xl">
          <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
            <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">Create Invoice</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-semibold text-sm uppercase tracking-wider mb-1">Order Not Eligible</p>
              <p className="text-sm text-white/60">Orders with status <strong className="capitalize text-white">{order.status}</strong> cannot be invoiced. Invoice creation is available for confirmed, processing, ready, dispatched, or delivered orders.</p>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end">
            <Button onClick={onClose} variant="outline" className="rounded-sm font-heading text-xs uppercase tracking-wider">Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-[hsl(0,0%,10%)] w-full max-w-5xl rounded-sm shadow-2xl mx-4 flex flex-col">

        {/* Header */}
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-start justify-between rounded-t-sm sticky top-0 z-10">
          <div>
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Create Invoice</h2>
            <p className="text-white/40 text-xs font-body mt-0.5">
              From Order <span className="text-primary font-mono font-semibold">{order.order_number}</span>
              {" · "}{order.customer_name}
              {order.company ? ` · ${order.company}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-white/40">{form.invoice_number}</span>
            <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Warning Banner */}
        {warning && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-amber-600 text-xs font-heading font-semibold uppercase tracking-wider">{warning}</span>
          </div>
        )}

        <div className="p-6 space-y-5">

          {/* INVOICE BASIS */}
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2.5">
              <span className="font-heading text-xs font-semibold text-white uppercase tracking-wider">Invoice Basis</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {INVOICE_BASIS.map(b => (
                  <button key={b.value} type="button" onClick={() => setBasis(b.value)}
                    className={`px-3 py-2.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm border transition-colors ${
                      basis === b.value ? "bg-primary text-black border-primary" : "bg-[hsl(0,0%,14%)] text-white/70 border-[hsl(0,0%,22%)] hover:border-primary/50"
                    }`}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INVOICE DETAILS */}
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2.5">
              <span className="font-heading text-xs font-semibold text-white uppercase tracking-wider">Invoice Details</span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <FieldLabel required>Invoice Number</FieldLabel>
                <Input value={form.invoice_number} onChange={e => u("invoice_number", e.target.value)} className="rounded-sm font-mono text-xs h-8" />
              </div>
              <div>
                <FieldLabel required>Invoice Date</FieldLabel>
                <Input type="date" value={form.invoice_date} onChange={e => u("invoice_date", e.target.value)} className="rounded-sm h-8 text-xs" />
              </div>
              <div>
                <FieldLabel>Due Date</FieldLabel>
                <Input type="date" value={form.due_date} onChange={e => u("due_date", e.target.value)} className="rounded-sm h-8 text-xs" />
              </div>
              <div>
                <FieldLabel>Reference</FieldLabel>
                <Input value={form.reference} onChange={e => u("reference", e.target.value)} className="rounded-sm h-8 text-xs" />
              </div>
              <div>
                <FieldLabel>Customer PO #</FieldLabel>
                <Input value={form.customer_po_number} onChange={e => u("customer_po_number", e.target.value)} className="rounded-sm h-8 text-xs" />
              </div>
              <div>
                <FieldLabel>Job Number</FieldLabel>
                <Input value={form.job_number} onChange={e => u("job_number", e.target.value)} className="rounded-sm h-8 text-xs" />
              </div>
              <div>
                <FieldLabel>Billing Email</FieldLabel>
                <Input type="email" value={form.billing_email} onChange={e => u("billing_email", e.target.value)} className="rounded-sm h-8 text-xs" />
              </div>
              <div>
                <FieldLabel>Sales Order Ref</FieldLabel>
                <Input value={order.order_number} readOnly className="rounded-sm h-8 text-xs bg-muted/30 text-muted-foreground font-mono" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Customer Notes</FieldLabel>
                <Textarea value={form.customer_notes} onChange={e => u("customer_notes", e.target.value)} rows={2} className="rounded-sm text-xs" placeholder="Visible to customer..." />
              </div>
              <div className="col-span-2">
                <FieldLabel>Internal Notes</FieldLabel>
                <Textarea value={form.internal_notes} onChange={e => u("internal_notes", e.target.value)} rows={2} className="rounded-sm text-xs" placeholder="Internal only..." />
              </div>
            </div>
          </div>

          {/* LINE ITEMS */}
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2.5 flex items-center justify-between">
              <span className="font-heading text-xs font-semibold text-white uppercase tracking-wider">Line Items</span>
              <span className="text-white/40 text-xs">{activeLines.filter(l => l.invoice_qty > 0).length} invoiceable lines</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[900px]">
                <thead className="bg-[hsl(0,0%,8%)] border-b border-[hsl(0,0%,18%)]">
                  <tr>
                    {basis === "selected" && <th className="w-8 px-2 py-2" />}
                    <th className="text-left px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-24">Part #</th>
                    <th className="text-left px-3 py-2 font-heading uppercase tracking-wider text-white/30">Description</th>
                    <th className="text-right px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-16">Ordered</th>
                    <th className="text-right px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-16">Dispatched</th>
                    <th className="text-right px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-16">Invoiced</th>
                    <th className="text-right px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-16">Available</th>
                    <th className="text-right px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-20">Inv Qty</th>
                    <th className="text-right px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-24">Unit Price</th>
                    <th className="text-right px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-14">Disc%</th>
                    <th className="text-center px-2 py-2 font-heading uppercase tracking-wider text-white/30 w-10">GST</th>
                    <th className="text-right px-3 py-2 font-heading uppercase tracking-wider text-white/30 w-24">Total</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => {
                    const isCharge = !!line._charge;
                    const exceeds = !isCharge && line.invoice_qty > line.available_qty;
                    return (
                      <tr key={i} className={`border-b border-[hsl(0,0%,16%)] ${isCharge ? "bg-blue-500/10" : line.available_qty === 0 && !isCharge ? "bg-white/5 opacity-60" : ""}`}>
                        {basis === "selected" && (
                          <td className="px-2 py-2 text-center">
                            {!isCharge && (
                              <input type="checkbox" checked={line.selected} onChange={e => updateLine(i, "selected", e.target.checked)}
                                className="h-3.5 w-3.5 accent-primary" />
                            )}
                          </td>
                        )}
                        <td className="px-3 py-2 font-mono text-primary text-[11px]">{line.part_number || (isCharge ? <span className="text-blue-400 text-[10px] font-heading uppercase">{line.description}</span> : "—")}</td>
                         <td className="px-3 py-2 max-w-[200px]">
                           {isCharge ? (
                             <input value={line.description} onChange={e => updateLine(i, "description", e.target.value)}
                               className="w-full h-7 px-2 border border-[hsl(0,0%,24%)] bg-[hsl(0,0%,14%)] text-white rounded-sm text-xs" />
                           ) : (
                             <span className="text-sm text-white/80">{line.description}</span>
                           )}
                         </td>
                         <td className="px-3 py-2 text-right text-white/40">{isCharge ? "—" : line.ordered_qty}</td>
                         <td className="px-3 py-2 text-right text-white/40">{isCharge ? "—" : line.dispatched_qty || <span className="text-amber-400">0</span>}</td>
                         <td className="px-3 py-2 text-right text-white/40">{isCharge ? "—" : line.invoiced_qty || 0}</td>
                         <td className={`px-3 py-2 text-right font-semibold ${line.available_qty === 0 && !isCharge ? "text-red-400" : "text-white"}`}>
                          {isCharge ? "—" : line.available_qty}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number" min="0" step="0.01"
                            max={isCharge ? undefined : line.available_qty}
                            value={line.invoice_qty}
                            onChange={e => {
                              const val = Number(e.target.value);
                              if (!isCharge && val > line.available_qty) return;
                              updateLine(i, "invoice_qty", val);
                            }}
                            className={`w-full h-7 px-2 border rounded-sm text-xs text-right bg-[hsl(0,0%,14%)] text-white ${exceeds ? "border-red-400" : "border-[hsl(0,0%,24%)]"}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" value={line.unit_price} onChange={e => updateLine(i, "unit_price", Number(e.target.value))}
                            className="w-full h-7 px-2 border border-[hsl(0,0%,24%)] bg-[hsl(0,0%,14%)] text-white rounded-sm text-xs text-right" />
                            </td>
                            <td className="px-3 py-2">
                            <input type="number" min="0" max="100" value={line.discount} onChange={e => updateLine(i, "discount", Number(e.target.value))}
                              className="w-full h-7 px-2 border border-[hsl(0,0%,24%)] bg-[hsl(0,0%,14%)] text-white rounded-sm text-xs text-right" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <input type="checkbox" checked={line.gst} onChange={e => updateLine(i, "gst", e.target.checked)}
                            className="h-3.5 w-3.5 accent-primary" />
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-white">${(line.total || 0).toFixed(2)}</td>
                        <td className="px-1 py-2">
                          {(isCharge || line.available_qty === 0) && (
                            <button onClick={() => removeLine(i)} className="text-white/30 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-[hsl(0,0%,18%)] bg-[hsl(0,0%,9%)] flex flex-wrap gap-2">
              {["Freight","Handling","Remote Delivery Surcharge","After-hours Surcharge","Miscellaneous"].map(label => (
                <button key={label} onClick={() => addChargeLine(label)} type="button"
                  className="px-2.5 py-1 text-[11px] font-heading font-semibold uppercase tracking-wider rounded-sm border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                  + {label}
                </button>
              ))}
            </div>

            {/* Totals */}
            <div className="p-4 flex justify-end border-t border-[hsl(0,0%,18%)] bg-[hsl(0,0%,9%)]">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-white/40">
                  <span className="font-heading text-[11px] uppercase tracking-wider">Subtotal</span>
                  <span className="text-white/80">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span className="font-heading text-[11px] uppercase tracking-wider">GST (10%)</span>
                  <span className="text-white/80">${gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-[hsl(0,0%,20%)] pt-2">
                  <span className="font-heading uppercase tracking-wider text-white">Total</span>
                  <span className="text-primary">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[hsl(0,0%,6%)] border-t border-border flex flex-wrap items-center justify-between gap-3 rounded-b-sm sticky bottom-0">
          <div className="text-white/50 text-xs font-heading uppercase tracking-wider">
            Invoice Total: <span className="text-primary font-bold text-base ml-1">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onClose} size="sm" disabled={saving}
              className="rounded-sm font-heading text-xs uppercase tracking-wider border-white/20 text-white/70 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={() => save("draft")} disabled={saving} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-secondary text-white hover:bg-secondary/80">
              {saving && saveAction === "draft" ? "Saving..." : "Save Draft"}
            </Button>
            <Button onClick={() => save("invoice")} disabled={saving} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-primary text-black hover:bg-primary/90">
              {saving && saveAction === "invoice" ? "Creating..." : "Create Invoice"}
            </Button>
            <Button onClick={() => save("email")} disabled={saving} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700">
              {saving && saveAction === "email" ? "Sending..." : "Create & Email"}
            </Button>
            <Button onClick={() => save("paid")} disabled={saving} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-green-600 text-white hover:bg-green-700">
              {saving && saveAction === "paid" ? "Saving..." : "Create & Mark Paid"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}