import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Download, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fmt = (n) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

export default function BillDetailModal({ bill, onClose, onSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(bill || {});
  const [lines, setLines] = useState(bill?.lines || []);
  const [saving, setSaving] = useState(false);

  const calcLine = (line) => {
    const total = (line.quantity || 0) * (line.unit_price || 0);
    const gst = line.gst_treatment === "taxable" ? total / 11 : 0;
    return { ...line, gst_amount: gst, total };
  };

  const totals = () => {
    const subtotal = lines.reduce((s, l) => s + (l.total || 0), 0);
    const gst_total = lines.reduce((s, l) => s + (l.gst_amount || 0), 0);
    return { subtotal, gst_total, total: subtotal + gst_total, balance_due: subtotal + gst_total };
  };

  const save = async () => {
    setSaving(true);
    const t = totals();
    await base44.entities.SupplierBill.update(bill.id, {
      ...form,
      lines: lines.map(calcLine),
      subtotal: t.subtotal,
      gst_total: t.gst_total,
      total: t.total,
      balance_due: t.balance_due,
    });
    setIsEditing(false);
    setSaving(false);
    onSaved?.();
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SUPPLIER BILL", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Bill #: ${form.bill_number || "—"}`, 20, 35);
    doc.text(`Supplier: ${form.supplier_name}`, 20, 42);
    doc.text(`Supplier Invoice: ${form.supplier_invoice_number || "—"}`, 20, 49);
    doc.text(`Bill Date: ${form.bill_date}`, 20, 56);
    doc.text(`Due Date: ${form.due_date || "—"}`, 20, 63);

    let y = 75;
    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, y);
    doc.text("Qty", 120, y);
    doc.text("Unit Price", 140, y);
    doc.text("Total", 170, y);

    doc.setFont("helvetica", "normal");
    y += 8;
    lines.forEach((line) => {
      doc.text(line.description.slice(0, 40), 20, y);
      doc.text(String(line.quantity), 120, y);
      doc.text(fmt(line.unit_price), 140, y);
      doc.text(fmt(line.total), 170, y);
      y += 7;
    });

    y += 5;
    doc.setFont("helvetica", "bold");
    const t = totals();
    doc.text(`Subtotal: ${fmt(t.subtotal)}`, 140, y);
    y += 7;
    doc.text(`GST: ${fmt(t.gst_total)}`, 140, y);
    y += 7;
    doc.text(`Total: ${fmt(t.total)}`, 140, y);

    doc.save(`Bill-${form.bill_number || "Bill"}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-3 flex justify-between items-center">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Bill Details</h3>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button onClick={downloadPDF} className="text-primary hover:text-primary/70">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditing(true)} className="text-primary hover:text-primary/70">
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Supplier Name</label>
                  <Input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Supplier Invoice #</label>
                  <Input value={form.supplier_invoice_number} onChange={e => setForm(f => ({ ...f, supplier_invoice_number: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Bill Date</label>
                  <Input type="date" value={form.bill_date} onChange={e => setForm(f => ({ ...f, bill_date: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Due Date</label>
                  <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="rounded-sm" />
                </div>
              </div>

              <div>
                <div className="font-heading text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Line Items</div>
                <div className="space-y-2">
                  {lines.map((line, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <Input className="col-span-5 rounded-sm text-xs" placeholder="Description" value={line.description} onChange={e => setLines(ls => ls.map((l,j) => j===i ? calcLine({...l, description: e.target.value}) : l))} />
                      <Input className="col-span-2 rounded-sm text-xs" type="number" placeholder="Qty" value={line.quantity} onChange={e => setLines(ls => ls.map((l,j) => j===i ? calcLine({...l, quantity: parseFloat(e.target.value)||0}) : l))} />
                      <Input className="col-span-2 rounded-sm text-xs" type="number" placeholder="Unit $" value={line.unit_price} onChange={e => setLines(ls => ls.map((l,j) => j===i ? calcLine({...l, unit_price: parseFloat(e.target.value)||0}) : l))} />
                      <div className="col-span-2 text-xs font-bold text-right text-foreground">{fmt(line.total)}</div>
                      <button className="col-span-1 text-muted-foreground hover:text-red-400" onClick={() => setLines(ls => ls.filter((_,j) => j!==i))}><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => setLines(ls => [...ls, { description: "", quantity: 1, unit_price: 0, gst_treatment: "taxable", gst_amount: 0, total: 0 }])} className="text-xs text-primary font-heading uppercase tracking-wider hover:text-primary/70">+ Add Line</button>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex flex-col items-end gap-1 text-xs">
                <div className="flex gap-8 text-muted-foreground"><span>Subtotal</span><span className="font-bold text-foreground">{fmt(totals().subtotal)}</span></div>
                <div className="flex gap-8 text-muted-foreground"><span>GST (10%)</span><span className="font-bold text-foreground">{fmt(totals().gst_total)}</span></div>
                <div className="flex gap-8 text-foreground font-heading font-bold text-sm"><span>TOTAL</span><span className="text-primary">{fmt(totals().total)}</span></div>
              </div>

              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Notes</label>
                <Input value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-sm" />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Bill #</span>
                  <p className="font-mono text-foreground">{form.bill_number || "—"}</p>
                </div>
                <div>
                  <span className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Supplier</span>
                  <p className="text-foreground">{form.supplier_name}</p>
                </div>
                <div>
                  <span className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Supplier Invoice #</span>
                  <p className="text-foreground">{form.supplier_invoice_number || "—"}</p>
                </div>
                <div>
                  <span className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Bill Date</span>
                  <p className="text-foreground">{form.bill_date}</p>
                </div>
                <div>
                  <span className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Due Date</span>
                  <p className="text-foreground">{form.due_date || "—"}</p>
                </div>
                <div>
                  <span className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Status</span>
                  <p className="text-foreground capitalize">{form.status}</p>
                </div>
              </div>

              <div>
                <div className="font-heading text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Line Items</div>
                <div className="border border-border rounded-sm divide-y">
                  {lines.map((line, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 p-3 text-xs">
                      <div className="col-span-5">{line.description}</div>
                      <div className="col-span-2 text-right">{line.quantity}</div>
                      <div className="col-span-2 text-right">{fmt(line.unit_price)}</div>
                      <div className="col-span-3 text-right font-bold text-foreground">{fmt(line.total)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 flex flex-col items-end gap-1 text-xs">
                <div className="flex gap-8 text-muted-foreground"><span>Subtotal</span><span className="font-bold text-foreground">{fmt(totals().subtotal)}</span></div>
                <div className="flex gap-8 text-muted-foreground"><span>GST (10%)</span><span className="font-bold text-foreground">{fmt(totals().gst_total)}</span></div>
                <div className="flex gap-8 text-foreground font-heading font-bold text-sm"><span>TOTAL</span><span className="text-primary">{fmt(totals().total)}</span></div>
              </div>

              {form.notes && (
                <div className="space-y-1">
                  <span className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Notes</span>
                  <p className="text-foreground text-xs">{form.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border px-6 py-3 flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={save} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">Save Changes</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Close</Button>
          )}
        </div>
      </div>
    </div>
  );
}