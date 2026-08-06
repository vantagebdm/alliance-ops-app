import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/ui/Autocomplete";
import PartAutocomplete from "@/components/ui/PartAutocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { generateDocNumber } from "@/hooks/useDocNumber";

const newLine = () => ({ app_part_number: "", part_number: "", description: "", quantity: 1, unit_price: 0, total: 0, eta_days: "", eta_comment: "" });

export default function QuoteForm({ onClose, onSaved, initial, prefillCustomer }) {
  const [form, setForm] = useState(initial || {
    customer_name: prefillCustomer?.name || "",
    customer_email: prefillCustomer?.email || "", 
    company: prefillCustomer?.company || "",
    status: "draft", 
    valid_until: "", 
    notes: "",
    items: [newLine()],
    subtotal: 0, 
    gst: 0, 
    total: 0,
  });
  const [saving, setSaving] = useState(false);
  const customerAC = useAutocomplete("Customer", "name");
  const companyAC = useAutocomplete("Customer", "company");

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fillCustomer = (item) => {
    setForm(f => ({
      ...f,
      customer_name: item.name || f.customer_name,
      company: item.company || f.company,
      customer_email: item.email || f.customer_email,
    }));
  };

  const updateLine = (i, k, v) => {
    const items = form.items.map((line, idx) => {
      if (idx !== i) return line;
      const updated = { ...line, [k]: v };
      if (k === "quantity" || k === "unit_price") {
        updated.total = (Number(updated.quantity) || 0) * (Number(updated.unit_price) || 0);
      }
      return updated;
    });
    recalc(items);
  };

  const recalc = (items) => {
    const subtotal = items.reduce((s, l) => s + (Number(l.total) || 0), 0);
    const gst = subtotal * 0.1;
    setForm(f => ({ ...f, items, subtotal, gst, total: subtotal + gst }));
  };

  const addLine = () => recalc([...form.items, newLine()]);
  const removeLine = (i) => recalc(form.items.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        valid_until: form.valid_until || undefined,
        items: form.items.map(({ part_category, part_price_per_pack, part_price_per_litre, part_commercial_price, pricing_basis, ...l }) => ({
          ...l,
          eta_days: l.eta_days === "" ? undefined : l.eta_days,
          quantity: Number(l.quantity) || 0,
          unit_price: Number(l.unit_price) || 0,
          total: Number(l.total) || 0,
        })),
      };
      if (!data.quote_number) data.quote_number = await generateDocNumber("quote");
      if (prefillCustomer?.id) data.customer_id = prefillCustomer.id;
      if (initial?.id) {
        await base44.entities.Quote.update(initial.id, data);
      } else {
        await base44.entities.Quote.create(data);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="bg-[hsl(0,0%,6%)] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
          {initial ? "Edit Quote" : "New Quote"}
        </h2>
        <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Customer & Details */}
        <div className="w-80 flex-shrink-0 border-r border-border bg-card p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-[10px]">1</span>
              </div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider">Customer</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Customer Name *</label>
                <Autocomplete
                  value={form.customer_name}
                  suggestions={customerAC.suggestions}
                  open={customerAC.open}
                  loading={customerAC.loading}
                  onInputChange={(val) => { u("customer_name", val); customerAC.handleInputChange(val); }}
                  onSelect={(item) => { fillCustomer(item); customerAC.handleSelectSuggestion(item); }}
                  onShowAll={customerAC.handleShowAll}
                  placeholder="Search customer..."
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Company</label>
                <Autocomplete
                  value={form.company}
                  suggestions={companyAC.suggestions}
                  open={companyAC.open}
                  loading={companyAC.loading}
                  onInputChange={(val) => { u("company", val); companyAC.handleInputChange(val); }}
                  onSelect={(item) => { fillCustomer(item); companyAC.handleSelectSuggestion(item); }}
                  onShowAll={companyAC.handleShowAll}
                  placeholder="Search company..."
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Email</label>
                <Input value={form.customer_email} onChange={e => u("customer_email", e.target.value)} className="rounded-sm" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-[10px]">2</span>
              </div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider">Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Status</label>
                <Select value={form.status} onValueChange={v => u("status", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["draft","sent","accepted","rejected","expired"].map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Valid Until</label>
                <Input type="date" value={form.valid_until} onChange={e => u("valid_until", e.target.value)} className="rounded-sm" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-[10px]">3</span>
              </div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider">Notes</h3>
            </div>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)}
              placeholder="Terms, conditions, delivery notes..." className="rounded-sm h-32 resize-none" />
          </div>
        </div>

        {/* RIGHT: Line Items */}
        <div className="flex-1 flex flex-col min-h-0 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-primary flex items-center justify-center rounded-sm">
              <span className="font-heading font-bold text-black text-[10px]">4</span>
            </div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider">Line Items</h3>
            <Button variant="outline" size="sm" onClick={addLine} className="ml-auto rounded-sm font-heading text-xs uppercase tracking-wider h-7">
              <Plus className="w-3 h-3 mr-1" /> Add Line
            </Button>
          </div>

          <div className="flex-1 border border-border rounded-sm overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(0,0%,11%)] border-b border-border sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-44">Part #</th>
                  <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Description</th>
                  <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-20">Qty</th>
                  <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-56">Unit Price</th>
                  <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-20">ETA (days)</th>
                  <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-32">ETA Comment</th>
                  <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-28">Total</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {form.items.map((line, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-2 py-1.5">
                      <PartAutocomplete
                        value={line.app_part_number || line.part_number}
                        onSelect={(part) => {
                           const items = form.items.map((line, idx) => {
                             if (idx !== i) return line;
                             const isOil = part.category === "oils";
                             const basis = isOil ? "per_litre" : "standard";
                             let unit_price = part.sell_price || 0;
                             if (isOil) unit_price = part.price_per_litre || 0;
                             const updated = {
                               ...line,
                               app_part_number: part.app_part_number || part.part_number,
                               part_number: part.part_number,
                               description: part.description || part.name || "",
                               part_category: part.category,
                               part_price_per_pack: part.price_per_pack || part.sell_price || 0,
                               part_price_per_litre: part.price_per_litre || 0,
                               part_commercial_price: part.commercial_price || 0,
                               pricing_basis: basis,
                               unit_price,
                               quantity: 1
                             };
                             updated.total = (updated.quantity || 0) * (updated.unit_price || 0);
                             return updated;
                           });
                           recalc(items);
                        }}
                        onChange={(val) => updateLine(i, "app_part_number", val)}
                        onClear={() => {
                           const items = form.items.map((line, idx) => {
                             if (idx !== i) return line;
                             return { ...line, app_part_number: "", part_number: "", description: "", unit_price: 0, total: 0, eta_days: "", eta_comment: "", part_category: "", pricing_basis: "standard", part_price_per_pack: 0, part_price_per_litre: 0, part_commercial_price: 0 };
                           });
                           recalc(items);
                        }}
                        placeholder="Part #"
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
                      {line.part_category === "oils" ? (
                        <div className="space-y-1">
                          <Select value={line.pricing_basis || "per_litre"} onValueChange={(v) => {
                            const items = form.items.map((l, idx) => {
                              if (idx !== i) return l;
                              let unit_price = l.unit_price;
                              if (v === "per_litre") unit_price = l.part_price_per_litre || 0;
                              else if (v === "unit_cost") unit_price = l.part_price_per_pack || 0;
                              else if (v === "commercial") unit_price = l.part_commercial_price || 0;
                              const total = (Number(l.quantity) || 0) * (Number(unit_price) || 0);
                              return { ...l, pricing_basis: v, unit_price, total };
                            });
                            recalc(items);
                          }}>
                            <SelectTrigger className="rounded-sm h-7 text-[10px] uppercase font-heading tracking-wider px-2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="per_litre">Per Litre — ${(line.part_price_per_litre || 0).toFixed(2)}</SelectItem>
                              <SelectItem value="unit_cost">Per Pack — ${(line.part_price_per_pack || 0).toFixed(2)}</SelectItem>
                              <SelectItem value="commercial">Commercial — ${(line.part_commercial_price || 0).toFixed(2)}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="number" step="0.01" value={line.unit_price} onChange={e => updateLine(i, "unit_price", Number(e.target.value))}
                            className="rounded-sm h-8 text-xs text-right" />
                        </div>
                      ) : (
                        <Input type="number" step="0.01" value={line.unit_price} onChange={e => updateLine(i, "unit_price", Number(e.target.value))}
                          className="rounded-sm h-8 text-xs text-right" />
                      )}
                    </td>
                    <td className="px-2 py-1.5">
                      <Input type="number" min="0" value={line.eta_days} onChange={e => updateLine(i, "eta_days", e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="—" className="rounded-sm h-8 text-xs text-right" />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input value={line.eta_comment} onChange={e => updateLine(i, "eta_comment", e.target.value)}
                        placeholder="e.g. ex east" className="rounded-sm h-8 text-xs" />
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold text-sm">${(line.total || 0).toFixed(2)}</td>
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

          {/* Totals */}
          <div className="flex justify-end mt-3">
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
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-3 bg-muted/30 border-t border-border flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
        <Button onClick={save} disabled={saving || !form.customer_name}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          {saving ? "Saving..." : initial ? "Update Quote" : "Create Quote"}
        </Button>
      </div>
    </div>
  );
}