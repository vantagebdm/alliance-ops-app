import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/ui/Autocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";

const newLine = () => ({ part_number: "", description: "", quantity: 1, unit_price: 0, total: 0 });

export default function SalesOrderForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState(initial || {
    customer_name: "", company: "", status: "pending", priority: "normal",
    delivery_method: "pickup", delivery_address: "", notes: "",
    items: [newLine()], subtotal: 0, gst: 0, total: 0,
  });
  const [saving, setSaving] = useState(false);
  const customerAC = useAutocomplete("Customer", "name");
  const companyAC = useAutocomplete("Customer", "company");
  const partAC = useAutocomplete("Part", "part_number");

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateLine = (i, k, v) => {
    const items = form.items.map((line, idx) => {
      if (idx !== i) return line;
      const updated = { ...line, [k]: v };
      if (k === "quantity" || k === "unit_price") {
        updated.total = (Number(updated.quantity) || 0) * (Number(updated.unit_price) || 0);
      }
      return updated;
    });
    const subtotal = items.reduce((s, l) => s + (Number(l.total) || 0), 0);
    setForm(f => ({ ...f, items, subtotal, gst: subtotal * 0.1, total: subtotal * 1.1 }));
  };

  const addLine = () => setForm(f => ({ ...f, items: [...f.items, newLine()] }));
  const removeLine = (i) => {
    const items = form.items.filter((_, idx) => idx !== i);
    const subtotal = items.reduce((s, l) => s + (Number(l.total) || 0), 0);
    setForm(f => ({ ...f, items, subtotal, gst: subtotal * 0.1, total: subtotal * 1.1 }));
  };

  const save = async () => {
    setSaving(true);
    const data = { ...form };
    if (!data.order_number) data.order_number = `SO-${Date.now().toString(36).toUpperCase()}`;
    if (initial?.id) {
      await base44.entities.SalesOrder.update(initial.id, data);
    } else {
      await base44.entities.SalesOrder.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl mx-4">
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
            {initial ? "Edit Order" : "New Sales Order"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-xs">1</span>
              </div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Customer & Order Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1 block">Customer Name *</label>
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
                    u("customer_name", item.name);
                    customerAC.handleSelectSuggestion(item);
                  }}
                  placeholder="Search customer..."
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1 block">Company</label>
                <Autocomplete
                  value={form.company}
                  suggestions={companyAC.suggestions}
                  open={companyAC.open}
                  loading={companyAC.loading}
                  onInputChange={(val) => {
                    u("company", val);
                    companyAC.handleInputChange(val);
                  }}
                  onSelect={(item) => {
                    u("company", item.company);
                    companyAC.handleSelectSuggestion(item);
                  }}
                  placeholder="Search company..."
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1 block">Priority</label>
                <Select value={form.priority} onValueChange={v => u("priority", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1 block">Delivery Method</label>
                <Select value={form.delivery_method} onValueChange={v => u("delivery_method", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup — Karratha</SelectItem>
                    <SelectItem value="local_delivery">Local Delivery</SelectItem>
                    <SelectItem value="freight">Freight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.delivery_method !== "pickup" && (
                <div className="col-span-2">
                  <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1 block">Delivery Address</label>
                  <Input value={form.delivery_address} onChange={e => u("delivery_address", e.target.value)} className="rounded-sm" />
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-xs">2</span>
              </div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Line Items</h3>
            </div>
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(0,0%,96%)] border-b border-border">
                  <tr>
                    <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-28">Part #</th>
                    <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Description</th>
                    <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-16">Qty</th>
                    <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-24">Unit Price</th>
                    <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-24">Total</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((line, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-2 py-1.5">
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
                          className="rounded-sm h-8 text-xs font-mono"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input value={line.description} onChange={e => updateLine(i, "description", e.target.value)}
                          placeholder="Description" className="rounded-sm h-8 text-xs" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" min="1" value={line.quantity} onChange={e => updateLine(i, "quantity", Number(e.target.value))}
                          className="rounded-sm h-8 text-xs text-right" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" step="0.01" value={line.unit_price} onChange={e => updateLine(i, "unit_price", Number(e.target.value))}
                          className="rounded-sm h-8 text-xs text-right" />
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold">${(line.total || 0).toFixed(2)}</td>
                      <td className="px-2 py-1.5">
                        <button onClick={() => removeLine(i)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={addLine} className="mt-2 rounded-sm font-heading text-xs uppercase tracking-wider">
              <Plus className="w-3 h-3 mr-1" /> Add Line
            </Button>

            {/* Totals */}
            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-heading text-[11px] uppercase tracking-wider">Subtotal</span>
                  <span>${form.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-heading text-[11px] uppercase tracking-wider">GST (10%)</span>
                  <span>${form.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
                  <span className="font-heading uppercase tracking-wider">Total</span>
                  <span className="text-primary">${form.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1.5 block">Notes</label>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)}
              placeholder="Internal notes, special handling, delivery instructions..." className="rounded-sm" rows={2} />
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
          <Button onClick={save} disabled={saving || !form.customer_name}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            {saving ? "Saving..." : initial ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}