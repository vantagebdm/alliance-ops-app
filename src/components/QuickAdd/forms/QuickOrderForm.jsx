import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Autocomplete from "@/components/ui/Autocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";

const newLine = () => ({ part_number: "", description: "", quantity: 1, unit_price: 0 });

export default function QuickOrderForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    customer_name: "",
    items: [newLine()],
  });
  const [saving, setSaving] = useState(false);
  const customerAC = useAutocomplete("Customer", "name", ["company", "trading_name"]);
  const partAC = useAutocomplete("Part", "part_number");

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fillCustomer = (item) => {
    setForm(f => ({
      ...f,
      customer_name: item.name || f.customer_name,
      company: item.company || f.company,
    }));
  };

  const updateLine = (i, k, v) => {
    const items = form.items.map((line, idx) => (idx === i ? { ...line, [k]: v } : line));
    setForm(f => ({ ...f, items }));
  };

  const addLine = () => setForm(f => ({ ...f, items: [...f.items, newLine()] }));
  const removeLine = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const items = form.items.map(line => ({
        ...line,
        total: line.quantity * line.unit_price,
      }));
      const subtotal = items.reduce((s, l) => s + l.total, 0);
      const data = {
        customer_name: form.customer_name,
        customer_po_number: form.customer_po_number || "",
        items,
        subtotal,
        gst: subtotal * 0.1,
        total: subtotal * 1.1,
        status: "pending",
        order_number: `SO-${Date.now().toString(36).toUpperCase()}`,
      };
      await base44.entities.SalesOrder.create(data);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  const subtotal = form.items.reduce((s, l) => s + (l.quantity * l.unit_price), 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl my-6">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">New Sales Order</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-sm">
              <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Customer *</label>
              <Autocomplete
                value={form.customer_name}
                suggestions={customerAC.suggestions}
                open={customerAC.open}
                loading={customerAC.loading}
                onInputChange={(val) => {
                  u("customer_name", val);
                  customerAC.handleInputChange(val);
                }}
                onSelect={(item) => {
                  fillCustomer(item);
                  customerAC.handleSelectSuggestion(item);
                }}
                placeholder="Search customer..."
                className="rounded-sm"
              />
            </div>
            <div className="flex-1 max-w-xs">
              <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Client PO Number *</label>
              <input
                type="text"
                value={form.customer_po_number || ""}
                onChange={(e) => u("customer_po_number", e.target.value)}
                placeholder="Enter client PO #"
                className={`flex h-9 w-full rounded-sm border px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 bg-transparent ${
                  form.customer_po_number
                    ? "border-input focus-visible:ring-ring"
                    : "border-red-500 ring-1 ring-red-500 bg-red-500/5 focus-visible:ring-red-500"
                }`}
              />
            </div>
          </div>

          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(0,0%,96%)]">
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 font-heading text-[11px] uppercase tracking-wider text-foreground/50 w-40">Part #</th>
                  <th className="text-left px-3 py-2 font-heading text-[11px] uppercase tracking-wider text-foreground/50">Description</th>
                  <th className="text-right px-3 py-2 font-heading text-[11px] uppercase tracking-wider text-foreground/50 w-20">Qty</th>
                  <th className="text-right px-3 py-2 font-heading text-[11px] uppercase tracking-wider text-foreground/50 w-28">Unit Price (ex GST)</th>
                  <th className="text-right px-3 py-2 font-heading text-[11px] uppercase tracking-wider text-foreground/50 w-24">Line Total (ex GST)</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {form.items.map((line, i) => {
                  const lineTotal = line.quantity * line.unit_price;
                  return (
                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <Autocomplete
                          value={line.part_number}
                          suggestions={partAC.suggestions}
                          open={partAC.open}
                          loading={partAC.loading}
                          onInputChange={(val) => {
                            updateLine(i, "part_number", val);
                            partAC.handleInputChange(val);
                          }}
                          onSelect={(item) => {
                            updateLine(i, "part_number", item.part_number);
                            updateLine(i, "description", item.name);
                            updateLine(i, "unit_price", item.sell_price || 0);
                            partAC.handleSelectSuggestion(item);
                          }}
                          placeholder="SKU"
                          className="rounded-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(i, "description", e.target.value)}
                          placeholder="Description"
                          className="w-full h-9 px-2 text-sm border border-input rounded-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => updateLine(i, "quantity", Number(e.target.value))}
                          className="w-full h-9 px-2 text-sm border border-input rounded-sm text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(e) => updateLine(i, "unit_price", Number(e.target.value))}
                          className="w-full h-9 px-2 text-sm border border-input rounded-sm text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-body text-sm text-foreground/80">
                        ${lineTotal.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button onClick={() => removeLine(i)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-start justify-between">
            <button
              onClick={addLine}
              className="text-xs font-heading uppercase tracking-wider text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
            >
              <Plus className="w-3 h-3" /> Add Line
            </button>

            <div className="text-sm space-y-1 text-right">
              <div className="flex justify-between gap-12 text-foreground/60">
                <span className="font-heading text-[11px] uppercase tracking-wider">Subtotal (ex GST)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-12 text-foreground/60">
                <span className="font-heading text-[11px] uppercase tracking-wider">GST (10%)</span>
                <span>${gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-12 font-semibold text-base border-t border-border pt-1">
                <span className="font-heading text-[11px] uppercase tracking-wider">Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving || !form.customer_name || !form.customer_po_number || form.items.some(l => !l.part_number)}
            className="bg-primary text-black hover:bg-primary/90 font-heading font-semibold uppercase text-xs tracking-wider rounded-sm"
          >
            {saving ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}