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
import { generateDocNumber, previewDocNumber } from "@/hooks/useDocNumber";

const newLine = () => ({ part_number: "", description: "", supplier_sku: "", quantity: 1, unit_cost: 0, total: 0 });

export default function POForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState({
    supplier_name: "", status: "draft", expected_date: "", reference: "", notes: "",
    items: [newLine()], subtotal: 0, gst: 0, total: 0,
    ...initial,
    items: initial?.items?.length ? initial.items : [newLine()],
  });
  const [poType, setPoType] = useState(initial?.po_type || "parts");
  const [saving, setSaving] = useState(false);
  const [previewPO, setPreviewPO] = useState("");

  const loadPreview = async (type) => {
    const subtype = type === "parts" ? "parts" : "company_expense";
    const num = await previewDocNumber("purchase_order", subtype);
    setPreviewPO(num || "");
  };

  useState(() => { loadPreview(poType); }, []);
  const supplierAC = useAutocomplete("Supplier", "name");
  const partAC = useAutocomplete("Part", "part_number");

  // Track which line's autocomplete is active to sync state
  const [activeLineIndex, setActiveLineIndex] = useState(null);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateLine = (i, k, v) => {
    const items = form.items.map((line, idx) => {
      if (idx !== i) return line;
      const updated = { ...line, [k]: v };
      if (k === "quantity" || k === "unit_cost") {
        updated.total = (Number(updated.quantity) || 0) * (Number(updated.unit_cost) || 0);
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
    const data = { ...form, po_type: poType };
    if (!data.po_number) {
      const subtype = poType === "parts" ? "parts" : "company_expense";
      data.po_number = await generateDocNumber("purchase_order", subtype);
    }
    if (initial?.id) {
      await base44.entities.PurchaseOrder.update(initial.id, data);
    } else {
      await base44.entities.PurchaseOrder.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="bg-[hsl(0,0%,6%)] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
          {initial ? "Edit Purchase Order" : "New Purchase Order"}
        </h2>
        <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Supplier & Details */}
        <div className="w-72 flex-shrink-0 border-r border-border bg-card p-3 flex flex-col gap-2 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-[9px]">1</span>
              </div>
              <h3 className="font-heading text-[11px] font-semibold uppercase tracking-wider">Supplier</h3>
            </div>
            <div className="space-y-2">
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Supplier *</label>
                <Autocomplete
                  value={form.supplier_name}
                  suggestions={supplierAC.suggestions}
                  open={supplierAC.open}
                  loading={supplierAC.loading}
                  onInputChange={(val) => { u("supplier_name", val); supplierAC.handleInputChange(val); }}
                  onSelect={(item) => { u("supplier_name", item.name); supplierAC.handleSelectSuggestion(item); }}
                  onShowAll={supplierAC.handleShowAll}
                  placeholder="Search supplier..."
                  className="rounded-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-[9px]">2</span>
              </div>
              <h3 className="font-heading text-[11px] font-semibold uppercase tracking-wider">Order Details</h3>
            </div>
            <div className="space-y-2">
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">PO Type *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { value: "parts", label: "Parts Purchase", prefix: "PO-PS" },
                    { value: "company_expense", label: "Company Expense / Capex", prefix: "PO-CE" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setPoType(opt.value); loadPreview(opt.value); }}
                      className={`px-2 py-2 text-[10px] font-heading font-semibold uppercase tracking-wider rounded-sm border transition-colors text-left ${
                        poType === opt.value
                          ? "bg-primary text-black border-primary"
                          : "bg-[hsl(0,0%,14%)] text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className={`font-mono text-[9px] mt-0.5 ${poType === opt.value ? "text-black/60" : "text-muted-foreground"}`}>
                        {poType === opt.value && previewPO ? previewPO : `${opt.prefix}00001`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {previewPO && (
                <div>
                  <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">PO Number (Auto-assigned)</label>
                  <div className="h-9 px-3 flex items-center rounded-sm border border-border bg-muted font-mono text-sm font-semibold text-primary">
                    {previewPO}
                  </div>
                </div>
              )}
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Status</label>
                <Select value={form.status} onValueChange={v => u("status", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["draft","sent","confirmed","partial","received","cancelled"].map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Expected Date</label>
                <Input type="date" value={form.expected_date} onChange={e => u("expected_date", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">PO Reference</label>
                <Input value={form.reference} onChange={e => u("reference", e.target.value)} placeholder="e.g. PO-12345" className="rounded-sm" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Notes</label>
            <Textarea value={form.notes} onChange={e => u("notes", e.target.value)}
              placeholder="Special instructions, freight notes..." className="rounded-sm h-20 resize-none text-xs" />
          </div>
        </div>

        {/* RIGHT: Order Lines */}
        <div className="flex-1 flex flex-col min-h-0 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-primary flex items-center justify-center rounded-sm">
              <span className="font-heading font-bold text-black text-[9px]">3</span>
            </div>
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-wider">Order Lines</h3>
            <Button variant="outline" size="sm" onClick={addLine} className="ml-auto rounded-sm font-heading text-xs uppercase tracking-wider h-7">
              <Plus className="w-3 h-3 mr-1" /> Add Line
            </Button>
          </div>

          <div className="flex-1 border border-border rounded-sm overflow-auto">
             <table className="text-sm border-collapse">
               <thead className="bg-[hsl(0,0%,11%)] border-b border-border sticky top-0">
                 <tr>
                    <th className="text-left px-2 py-1 font-heading text-[9px] uppercase tracking-wider text-foreground/50 w-24 border-r border-border">Part #</th>
                    <th className="text-left px-2 py-1 font-heading text-[9px] uppercase tracking-wider text-foreground/50 flex-1 border-r border-border">Description</th>
                    <th className="text-right px-2 py-1 font-heading text-[9px] uppercase tracking-wider text-foreground/50 w-12 border-r border-border">Qty</th>
                    <th className="text-right px-2 py-1 font-heading text-[9px] uppercase tracking-wider text-foreground/50 w-20 border-r border-border">Unit Cost</th>
                    <th className="text-right px-2 py-1 font-heading text-[9px] uppercase tracking-wider text-foreground/50 w-20">Total</th>
                    <th className="w-8" />
                 </tr>
               </thead>
               <tbody>
                 {form.items.map((line, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-2 py-1 w-24 border-r border-border/50">
                        <PartAutocomplete 
                          value={line.supplier_sku || line.part_number}
                          onSelect={(part) => { 
                            const items = form.items.map((line, idx) => {
                              if (idx !== i) return line;
                              const updated = {
                                ...line,
                                part_number: part.part_number,
                                supplier_sku: part.supplier_sku || part.app_part_number || "",
                                description: part.description || part.name || "",
                                unit_cost: part.unit_cost || 0,
                                quantity: 1
                              };
                              updated.total = (updated.quantity || 0) * (updated.unit_cost || 0);
                              return updated;
                            });
                            const subtotal = items.reduce((s, l) => s + (Number(l.total) || 0), 0);
                            setForm(f => ({ ...f, items, subtotal, gst: subtotal * 0.1, total: subtotal * 1.1 }));
                          }}
                          onChange={(val) => updateLine(i, "supplier_sku", val)}
                          placeholder="Part #"
                          className="rounded-sm h-7 text-xs font-mono w-full"
                        />
                      </td>
                      <td className="px-2 py-1 flex-1 border-r border-border/50">
                         <input 
                           value={line.description || ""} 
                           onChange={e => updateLine(i, "description", e.target.value)}
                           placeholder="Description" 
                           className="h-7 text-xs w-full bg-[hsl(0,0%,10%)] border border-input rounded-sm px-2 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors" 
                         />
                       </td>
                      <td className="px-2 py-1 w-12 border-r border-border/50">
                        <Input type="number" min="1" value={line.quantity || 1} onChange={e => updateLine(i, "quantity", Number(e.target.value))}
                          className="rounded-sm h-7 text-xs text-right" />
                      </td>
                      <td className="px-2 py-1 w-20 border-r border-border/50">
                        <Input type="number" step="0.01" value={line.unit_cost || 0} onChange={e => updateLine(i, "unit_cost", Number(e.target.value))}
                          className="rounded-sm h-7 text-xs text-right" />
                      </td>
                      <td className="px-2 py-1 w-20 text-right font-semibold text-sm">${(line.total || 0).toFixed(2)}</td>
                      <td className="px-1 py-1 w-8 flex items-center justify-center">
                        <button onClick={() => removeLine(i)} className="text-muted-foreground hover:text-red-500 p-0.5">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>

          <div className="flex justify-end mt-2">
            <div className="w-56 space-y-0.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span className="font-heading text-[10px] uppercase tracking-wider">Subtotal</span>
                <span>${form.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span className="font-heading text-[10px] uppercase tracking-wider">GST (10%)</span>
                <span>${form.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-border pt-1 mt-1">
                <span className="font-heading uppercase tracking-wider">Total</span>
                <span className="text-primary">${form.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2 bg-muted/30 border-t border-border flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
        <Button onClick={save} disabled={saving || !form.supplier_name}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          {saving ? "Saving..." : initial ? "Update PO" : "Create PO"}
        </Button>
      </div>
    </div>
  );
}