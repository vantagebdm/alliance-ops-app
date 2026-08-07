import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { X, Save, Trash2 } from "lucide-react";
import { DISTRIBUTION_SUPPLIERS } from "@/lib/distributionData";

const fmt = (n) => `$${Number(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fieldCls = "h-8 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const lblCls = "block text-[10px] font-heading uppercase tracking-wider text-white/40 mb-1";

const PROPOSAL_TYPES = [
  { id: "retail", label: "Retail" },
  { id: "trade_business", label: "Trade Business" },
  { id: "commercial", label: "Commercial" },
];
const TRADING_TERMS = [
  { id: "cod", label: "COD" },
  { id: "14_days", label: "14 Days" },
  { id: "30_days", label: "30 Days" },
  { id: "30_days_plus", label: "30 Days Plus" },
];

export default function EditProposalModal({ proposal, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(proposal);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(proposal); }, [proposal]);

  const supplier = DISTRIBUTION_SUPPLIERS.find((s) => s.id === proposal.supplier);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setItem = (idx, patch) => setForm((f) => ({
    ...f,
    items: (f.items || []).map((it, i) => (i === idx ? { ...it, ...patch } : it)),
  }));
  const removeItem = (idx) => setForm((f) => ({ ...f, items: (f.items || []).filter((_, i) => i !== idx) }));
  const addItem = () => setForm((f) => ({ ...f, items: [...(f.items || []), { supplier_sku: "", description: "", pack_size: "", quantity: 1, unit_price: 0, total: 0 }] }));

  const items = (form.items || []).map((it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unit_price) || 0;
    return { ...it, quantity: qty, unit_price: price, total: +(qty * price).toFixed(2) };
  });
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const gst = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.DistributionProposal.update(proposal.id, {
        title: form.title?.trim(),
        customer_name: form.customer_name?.trim(),
        customer_company: form.customer_company?.trim(),
        customer_email: form.customer_email?.trim(),
        best_contact: form.best_contact?.trim(),
        best_contact_phone: form.best_contact_phone?.trim(),
        best_contact_email: form.best_contact_email?.trim(),
        proposal_type: form.proposal_type,
        trading_terms: form.trading_terms,
        deposit_required: !!form.deposit_required,
        deposit_pct: Number(form.deposit_pct) || 0,
        balance_terms: form.balance_terms,
        validity_days: Number(form.validity_days) || 30,
        conditions_text: form.conditions_text,
        notes: form.notes,
        items,
        subtotal,
        gst,
        total,
      });
      toast({ title: "Proposal updated", description: proposal.proposal_number });
      onSaved();
      onClose();
    } catch (e) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-md w-full max-w-3xl max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(0,0%,18%)]">
          <h3 className="font-heading text-sm uppercase tracking-wider text-white/85">Edit {proposal.proposal_number}</h3>
          <span className="text-[10px] text-white/40">{supplier?.name} · Draft</span>
          <button onClick={onClose} className="ml-auto p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-auto p-4 space-y-4 text-sm">
          {/* Client & contact */}
          <div>
            <span className={lblCls}>Client & Contact</span>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.title || ""} onChange={(e) => set({ title: e.target.value })} className={fieldCls} placeholder="Title" />
              <input value={form.customer_name || ""} onChange={(e) => set({ customer_name: e.target.value })} className={fieldCls} placeholder="Client name" />
              <input value={form.customer_company || ""} onChange={(e) => set({ customer_company: e.target.value })} className={fieldCls} placeholder="Company" />
              <input value={form.customer_email || ""} onChange={(e) => set({ customer_email: e.target.value })} className={fieldCls} placeholder="Email" />
              <input value={form.best_contact || ""} onChange={(e) => set({ best_contact: e.target.value })} className={fieldCls} placeholder="Best contact" />
              <input value={form.best_contact_phone || ""} onChange={(e) => set({ best_contact_phone: e.target.value })} className={fieldCls} placeholder="Phone" />
            </div>
          </div>

          {/* Terms */}
          <div>
            <span className={lblCls}>Terms</span>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.proposal_type || ""} onChange={(e) => set({ proposal_type: e.target.value })} className={fieldCls}>
                <option value="">Proposal type…</option>
                {PROPOSAL_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={form.trading_terms || ""} onChange={(e) => set({ trading_terms: e.target.value })} className={fieldCls}>
                <option value="">Trading terms…</option>
                {TRADING_TERMS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <input value={form.balance_terms || ""} onChange={(e) => set({ balance_terms: e.target.value })} className={fieldCls} placeholder="Balance terms" />
              <input type="number" min="1" value={form.validity_days ?? 30} onChange={(e) => set({ validity_days: e.target.value })} className={fieldCls} placeholder="Valid days" />
            </div>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input type="checkbox" checked={!!form.deposit_required} onChange={(e) => set({ deposit_required: e.target.checked })} className="accent-primary" />
                Deposit required
              </label>
              {form.deposit_required && (
                <div className="flex items-center gap-1">
                  <input type="number" min="0" max="100" value={form.deposit_pct ?? 50} onChange={(e) => set({ deposit_pct: e.target.value })} className="h-8 w-16 rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-ring" />
                  <span className="text-xs text-white/50">% on order</span>
                </div>
              )}
            </div>
            <textarea value={form.conditions_text || ""} onChange={(e) => set({ conditions_text: e.target.value })} rows={2} className="w-full mt-2 rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Conditions" />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={lblCls + " mb-0"}>Items</span>
              <button onClick={addItem} className="ml-auto inline-flex items-center gap-1 h-7 px-2 rounded-md text-[10px] border border-primary/40 text-primary hover:bg-primary/10">+ Add line</button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left">
                  <th className="px-1 py-1.5 font-heading text-[9px] uppercase tracking-wider text-white/40">Description</th>
                  <th className="px-1 py-1.5 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-14">Qty</th>
                  <th className="px-1 py-1.5 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-20">Unit $</th>
                  <th className="px-1 py-1.5 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-20">Total</th>
                  <th className="w-7"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-t border-[hsl(0,0%,14%)] align-top">
                    <td className="px-1 py-1.5">
                      <input value={it.description || ""} onChange={(e) => setItem(idx, { description: e.target.value })} className="h-7 w-full rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Description" />
                      <div className="flex gap-1 mt-1">
                        <input value={it.supplier_sku || ""} onChange={(e) => setItem(idx, { supplier_sku: e.target.value })} className="h-6 w-20 rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-[10px] font-mono text-white/60 focus:outline-none focus:ring-1 focus:ring-ring" placeholder="SKU" />
                        <input value={it.pack_size || ""} onChange={(e) => setItem(idx, { pack_size: e.target.value })} className="h-6 w-20 rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-[10px] text-white/60 focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Pack" />
                      </div>
                    </td>
                    <td className="px-1 py-1.5 text-right"><input type="number" min="1" value={it.quantity} onChange={(e) => setItem(idx, { quantity: e.target.value })} className="h-7 w-12 text-right rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></td>
                    <td className="px-1 py-1.5 text-right"><input type="number" step="0.01" value={it.unit_price} onChange={(e) => setItem(idx, { unit_price: e.target.value })} className="h-7 w-16 text-right rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></td>
                    <td className="px-1 py-1.5 text-right text-white/85">{fmt(it.total)}</td>
                    <td className="px-1 py-1.5 text-right"><button onClick={() => removeItem(idx)} className="text-white/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-6 mt-2 text-xs">
              <div className="flex justify-between gap-3 text-white/50"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between gap-3 text-white/50"><span>GST</span><span>{fmt(gst)}</span></div>
              <div className="flex justify-between gap-3 text-white font-heading"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <span className={lblCls}>Notes</span>
            <textarea value={form.notes || ""} onChange={(e) => set({ notes: e.target.value })} rows={2} className="w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Notes" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[hsl(0,0%,18%)]">
          <button onClick={onClose} className="h-9 px-3 rounded-md border border-input text-white/60 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}