import { useState } from "react";
import { EQUIPMENT_TYPES } from "./EquipmentTypeSelector";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function PartForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState(initial || {
    part_number: "", name: "", description: "", category: "other", brand: "",
    oem_number: "", compatible_vehicles: "", unit_cost: 0, sell_price: 0,
    stock_quantity: 0, min_stock_level: 0, location: "", supplier_name: "", status: "active",
    equipment_type: "",
  });
  const [saving, setSaving] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    if (initial?.id) {
      await base44.entities.Part.update(initial.id, form);
    } else {
      await base44.entities.Part.create(form);
    }
    setSaving(false);
    onSaved();
  };

  const CATEGORIES = ["engine","transmission","brakes","suspension","electrical","body","filters","hydraulic","driveline","cooling","fuel","tyres","other"];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-10 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl mb-10">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
            {initial ? "Edit Part" : "New Part"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-sm">1</span>
              </div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Part Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Part Number *</label>
                <Input value={form.part_number} onChange={e => update("part_number", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Name *</label>
                <Input value={form.name} onChange={e => update("name", e.target.value)} className="rounded-sm" />
              </div>
              <div className="col-span-2">
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Equipment Type</label>
                <Select value={form.equipment_type || ""} onValueChange={v => update("equipment_type", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select equipment type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>— Not specified —</SelectItem>
                    {EQUIPMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => update("category", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Brand</label>
                <Input value={form.brand} onChange={e => update("brand", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">OEM Number</label>
                <Input value={form.oem_number} onChange={e => update("oem_number", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Compatible Vehicles</label>
                <Input value={form.compatible_vehicles} onChange={e => update("compatible_vehicles", e.target.value)} className="rounded-sm" />
              </div>
              <div className="col-span-2">
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Description</label>
                <Textarea value={form.description} onChange={e => update("description", e.target.value)} className="rounded-sm" rows={2} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-sm">2</span>
              </div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Pricing & Stock</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Unit Cost</label>
                <Input type="number" step="0.01" value={form.unit_cost} onChange={e => update("unit_cost", Number(e.target.value))} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Sell Price</label>
                <Input type="number" step="0.01" value={form.sell_price} onChange={e => update("sell_price", Number(e.target.value))} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Stock Quantity</label>
                <Input type="number" value={form.stock_quantity} onChange={e => update("stock_quantity", Number(e.target.value))} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Min Stock Level</label>
                <Input type="number" value={form.min_stock_level} onChange={e => update("min_stock_level", Number(e.target.value))} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Location</label>
                <Input value={form.location} onChange={e => update("location", e.target.value)} className="rounded-sm" placeholder="e.g. Shelf A3" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Supplier</label>
                <Input value={form.supplier_name} onChange={e => update("supplier_name", e.target.value)} className="rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
          <Button onClick={save} disabled={saving || !form.part_number || !form.name}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            {saving ? "Saving..." : initial ? "Update Part" : "Add Part"}
          </Button>
        </div>
      </div>
    </div>
  );
}