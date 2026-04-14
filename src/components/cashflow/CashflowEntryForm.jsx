import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "wages", label: "Wages / Payroll" },
  { value: "rent", label: "Rent / Lease" },
  { value: "utilities", label: "Utilities" },
  { value: "insurance", label: "Insurance" },
  { value: "supplier_payment", label: "Supplier Payment" },
  { value: "cogs", label: "COGS" },
  { value: "freight", label: "Freight" },
  { value: "maintenance", label: "Maintenance" },
  { value: "tax", label: "Tax / BAS" },
  { value: "loan", label: "Loan / Finance" },
  { value: "sales_revenue", label: "Sales Revenue" },
  { value: "invoice_payment", label: "Invoice Payment" },
  { value: "other", label: "Other" },
];

export default function CashflowEntryForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState(initial || {
    title: "", type: "outgoing", category: "other",
    amount: "", due_date: "", status: "scheduled",
    recurrence: "once", recurrence_end: "", supplier_name: "", reference: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount) || 0 };
    if (initial?.id) await base44.entities.CashflowEntry.update(initial.id, payload);
    else await base44.entities.CashflowEntry.create(payload);
    setSaving(false);
    onSaved();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    await base44.entities.CashflowEntry.delete(initial.id);
    setDeleting(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-10 overflow-y-auto">
      <div className="bg-card w-full max-w-lg rounded-sm shadow-2xl mb-10">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
            {initial ? "Edit Entry" : "New Cashflow Entry"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Title *</label>
            <Input value={form.title} onChange={e => update("title", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Type</label>
            <Select value={form.type} onValueChange={v => update("type", v)}>
              <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="outgoing">💸 Outgoing</SelectItem>
                <SelectItem value="incoming">💰 Incoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
            <Select value={form.category} onValueChange={v => update("category", v)}>
              <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Amount (AUD) *</label>
            <Input type="number" value={form.amount} onChange={e => update("amount", e.target.value)} className="rounded-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Due Date *</label>
            <Input type="date" value={form.due_date} onChange={e => update("due_date", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Status</label>
            <Select value={form.status} onValueChange={v => update("status", v)}>
              <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Recurrence</label>
            <Select value={form.recurrence} onValueChange={v => update("recurrence", v)}>
              <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once (no repeat)</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.recurrence !== "once" && (
            <div>
              <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Repeat Until</label>
              <Input type="date" value={form.recurrence_end || ""} onChange={e => update("recurrence_end", e.target.value)} className="rounded-sm" />
            </div>
          )}
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Supplier / Party</label>
            <Input value={form.supplier_name} onChange={e => update("supplier_name", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Reference #</label>
            <Input value={form.reference} onChange={e => update("reference", e.target.value)} className="rounded-sm" />
          </div>
          <div className="col-span-2">
            <label className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">Notes</label>
            <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} className="rounded-sm" rows={2} />
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center gap-3">
          {initial?.id && (
            <Button variant="outline" onClick={handleDelete} disabled={deleting}
              className="rounded-sm font-heading text-xs uppercase tracking-wider text-red-400 border-red-500/40 hover:bg-red-500/10 hover:text-red-400 mr-auto">
              <Trash2 className="w-3.5 h-3.5 mr-1" />{deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
          <Button onClick={save} disabled={saving || !form.title || !form.amount || !form.due_date}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            {saving ? "Saving..." : initial?.id ? "Update" : "Add Entry"}
          </Button>
        </div>
      </div>
    </div>
  );
}