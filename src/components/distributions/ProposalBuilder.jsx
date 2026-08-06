import React, { useState } from "react";
import { Trash2, Save, FileText, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { DISTRIBUTION_SUPPLIERS } from "@/lib/distributionData";

const fmt = (n) => `$${Number(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fieldCls = "h-8 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export default function ProposalBuilder({ supplierId, items, setItems, customer, setCustomer }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const supplier = DISTRIBUTION_SUPPLIERS.find((s) => s.id === supplierId);

  const updateItem = (idx, patch) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  const handleSave = async () => {
    if (!customer.name?.trim()) {
      toast({ title: "Customer name required", variant: "destructive" });
      return;
    }
    if (!items.length) {
      toast({ title: "Add at least one product", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const existing = await base44.entities.DistributionProposal.list("-created_date", 1000);
      const seq = (existing?.length || 0) + 1;
      const proposal_number = `DP-${String(seq).padStart(4, "0")}`;
      const payload = {
        proposal_number,
        supplier: supplierId,
        title: customer.title?.trim() || `${supplier?.name} Proposal`,
        customer_name: customer.name.trim(),
        customer_company: customer.company?.trim(),
        customer_email: customer.email?.trim(),
        items: items.map((it) => ({
          supplier_sku: it.supplier_sku,
          description: it.description,
          pack_size: it.pack_size,
          quantity: Number(it.quantity) || 0,
          unit_price: Number(it.unit_price) || 0,
          total: (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
        })),
        subtotal,
        gst,
        total,
        status: "draft",
        notes: customer.notes?.trim(),
      };
      await base44.entities.DistributionProposal.create(payload);
      toast({ title: "Proposal saved", description: proposal_number });
      setItems([]);
      setCustomer({ name: "", company: "", email: "", title: "", notes: "" });
    } catch (e) {
      toast({ title: "Failed to save proposal", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,14%)] rounded-md flex flex-col max-h-[calc(100vh-180px)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(0,0%,14%)]">
        <FileText className="w-4 h-4 text-primary" />
        <h2 className="font-heading text-sm uppercase tracking-wider text-white/80">Proposal Generator</h2>
        <span className="ml-auto text-[10px] text-white/40">{supplier?.name}</span>
      </div>

      <div className="p-4 space-y-3 border-b border-[hsl(0,0%,14%)]">
        <input
          value={customer.title}
          onChange={(e) => setCustomer({ ...customer, title: e.target.value })}
          placeholder="Proposal title"
          className={fieldCls}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            placeholder="Customer name *"
            className={fieldCls}
          />
          <input
            value={customer.company}
            onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
            placeholder="Company"
            className={fieldCls}
          />
        </div>
        <input
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          placeholder="Email"
          className={fieldCls}
        />
      </div>

      <div className="overflow-auto flex-1">
        {items.length === 0 ? (
          <div className="px-4 py-10 text-center text-white/40 text-sm">
            No products added yet. Click <span className="text-primary">Add</span> on a product to build your proposal.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[hsl(0,0%,10%)]">
              <tr className="text-left">
                <th className="px-3 py-2 font-heading text-[9px] uppercase tracking-wider text-white/40">Item</th>
                <th className="px-2 py-2 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-16">Qty</th>
                <th className="px-2 py-2 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-24">Unit $</th>
                <th className="px-2 py-2 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-24">Total</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-t border-[hsl(0,0%,14%)]">
                  <td className="px-3 py-2">
                    <div className="text-white/90 text-xs">{it.description}</div>
                    <div className="text-white/40 text-[10px] font-mono">{it.supplier_sku} · {it.pack_size}</div>
                    {it.per_unit_cost != null && (
                      <div className="text-primary/70 text-[10px]">
                        Cost: {fmt(it.per_unit_cost)} {it.unit_label} · Pack: {fmt(it.pack_cost)}
                      </div>
                    )}
                    {it.per_unit_cost != null && it.pack_cost != null && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <button
                          onClick={() => updateItem(idx, { pricing_basis: "per_unit", quantity: it.unit_count, unit_price: +(it.per_unit_cost * 1.65).toFixed(2) })}
                          className={it.pricing_basis === "per_unit"
                            ? "px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground"
                            : "px-1.5 py-0.5 rounded text-[9px] border border-input text-white/50 hover:text-white"}
                        >
                          Per Unit {it.unit_label} +65%
                        </button>
                        <button
                          onClick={() => updateItem(idx, { pricing_basis: "quote_total", quantity: 1, unit_price: +(it.pack_cost * 1.30).toFixed(2) })}
                          className={it.pricing_basis === "quote_total"
                            ? "px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground"
                            : "px-1.5 py-0.5 rounded text-[9px] border border-input text-white/50 hover:text-white"}
                        >
                          Quote Total +30%
                        </button>
                        <button
                          onClick={() => updateItem(idx, { pricing_basis: "commercial", quantity: 1, unit_price: +(it.pack_cost * 1.20).toFixed(2) })}
                          className={it.pricing_basis === "commercial"
                            ? "px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground"
                            : "px-1.5 py-0.5 rounded text-[9px] border border-input text-white/50 hover:text-white"}
                        >
                          Commercial +20%
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                      className="h-7 w-14 text-right rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={it.unit_price}
                      onChange={(e) => updateItem(idx, { unit_price: e.target.value })}
                      className="h-7 w-20 text-right rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="px-2 py-2 text-right text-white/90 text-xs">{fmt((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => removeItem(idx)} className="text-white/30 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t border-[hsl(0,0%,14%)] p-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-white/50">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-white/50">
          <span>GST (10%)</span>
          <span>{fmt(gst)}</span>
        </div>
        <div className="flex justify-between text-white font-heading text-base pt-1 border-t border-[hsl(0,0%,14%)] mt-1">
          <span className="uppercase tracking-wider">Total</span>
          <span>{fmt(total)}</span>
        </div>
        <div className="flex gap-2 pt-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Proposal"}
          </button>
          <button
            onClick={() => { setItems([]); }}
            disabled={!items.length}
            className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-input text-white/60 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}