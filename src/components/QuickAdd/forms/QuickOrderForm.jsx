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
  const customerAC = useAutocomplete("Customer", "name");
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

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-3 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">New Sales Order</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <div>
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

          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[hsl(0,0%,96%)]">
                <tr className="border-b border-border">
                  <th className="text-left px-2 py-1 font-heading tracking-wider text-foreground/50">Part #</th>
                  <th className="text-left px-2 py-1 font-heading tracking-wider text-foreground/50">Description</th>
                  <th className="text-right px-2 py-1 font-heading tracking-wider text-foreground/50 w-12">Qty</th>
                  <th className="text-right px-2 py-1 font-heading tracking-wider text-foreground/50 w-16">Price</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {form.items.map((line, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-1">
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
                          partAC.handleSelectSuggestion(item);
                        }}
                        placeholder="SKU"
                        className="rounded-sm h-7 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(i, "description", e.target.value)}
                        placeholder="Desc"
                        className="w-full h-7 px-2 text-xs border border-input rounded-sm"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(i, "quantity", Number(e.target.value))}
                        className="w-full h-7 px-2 text-xs border border-input rounded-sm text-right"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={line.unit_price}
                        onChange={(e) => updateLine(i, "unit_price", Number(e.target.value))}
                        className="w-full h-7 px-2 text-xs border border-input rounded-sm text-right"
                      />
                    </td>
                    <td className="px-1 py-1">
                      <button
                        onClick={() => removeLine(i)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addLine}
            className="text-xs font-heading uppercase tracking-wider text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Line
          </button>
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} size="sm" className="rounded-sm text-xs">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving || !form.customer_name || form.items.some(l => !l.part_number)}
            className="bg-primary text-black hover:bg-primary/90 text-xs rounded-sm"
            size="sm"
          >
            {saving ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}