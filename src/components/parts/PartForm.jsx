import { useState } from "react";
import { EQUIPMENT_TYPES } from "./EquipmentTypeSelector";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/ui/Autocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import FitmentBuilder from "./FitmentBuilder";
import { PART_CATEGORIES, SUBCATEGORIES, EXTENDED_CATEGORIES, HAZMAT_CATEGORIES } from "@/lib/categories";

export default function PartForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState(initial || {
    app_part_number: "", part_number: "", name: "", description: "", category: "other", subcategory: "", brand: "",
    oem_number: "", supplier_sku: "", aftermarket_number: "", fitments: [], unit_cost: 0, sell_price: 0,
    stock_quantity: 0, min_stock_level: 0, location: "", supplier_name: "", status: "active",
    equipment_type: "", hazardous: false, dangerous_goods: false, sds_required: false,
    storage_notes: "", expiry_date: "", batch_lot_number: "",
    compliance_type: "", compliance_reference: "", inspection_interval_days: null, regulated_item: false,
    workshop_use: false, pack_size: "", volume_size: "", issue_method: "each",
  });
  const [saving, setSaving] = useState(false);
  const [appNumberError, setAppNumberError] = useState("");
  const supplierAC = useAutocomplete("Supplier", "name");
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generateAppNumber = async (category) => {
    try {
      setAppNumberError("");
      const res = await base44.functions.invoke("generateAppPartNumber", { category });
      if (res.data.success) {
        update("app_part_number", res.data.app_part_number);
      } else {
        setAppNumberError(res.data.error || "Failed to generate number");
      }
    } catch (err) {
      setAppNumberError(err.message || "Error generating number");
    }
  };

  const handleCategoryChange = (newCategory) => {
    update("category", newCategory);
    update("subcategory", "");
    if (!initial?.id) {
      generateAppNumber(newCategory);
    }
  };

  const save = async () => {
    if (!form.app_part_number) {
      setAppNumberError("APP Internal Part Number is required");
      return;
    }
    if (!form.part_number) {
      setAppNumberError("Part Number is required");
      return;
    }
    if (!form.name) {
      setAppNumberError("Part Name is required");
      return;
    }

    setSaving(true);
    try {
      if (initial?.id) {
        await base44.entities.Part.update(initial.id, form);
      } else {
        await base44.entities.Part.create(form);
      }
      setSaving(false);
      onSaved();
    } catch (err) {
      setSaving(false);
      if (err.message?.includes("already exists")) {
        setAppNumberError("APP internal part number already exists. Please use the next available sequence or review category settings.");
      } else {
        setAppNumberError(err.message || "Error saving part");
      }
    }
  };

  const isExtended = EXTENDED_CATEGORIES.includes(form.category);
  const isHazmat = HAZMAT_CATEGORIES.includes(form.category);
  const isCompliance = form.category === "compliance";
  const isConsumable = form.category === "consumables";
  const subcatOptions = SUBCATEGORIES[form.category] || [];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl mx-4">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
            {initial ? "Edit Part" : "New Part"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1: Part Information */}
          <div>
            <SectionHeader num={1} title="Part Information" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Part Number *</FieldLabel>
                <Input value={form.part_number} onChange={e => update("part_number", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>Name *</FieldLabel>
                <Input value={form.name} onChange={e => update("name", e.target.value)} className="rounded-sm" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Equipment Type</FieldLabel>
                <Select value={form.equipment_type || ""} onValueChange={v => update("equipment_type", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select equipment type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>— Not specified —</SelectItem>
                    {EQUIPMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Category</FieldLabel>
                <Select value={form.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PART_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>APP Internal Part Number</FieldLabel>
                <Input 
                  value={form.app_part_number} 
                  readOnly
                  className="rounded-sm bg-muted text-foreground font-mono font-semibold"
                  placeholder="Auto-generated based on category"
                />
                {form.app_part_number && (
                  <p className="text-xs text-green-600 mt-1">✓ Available</p>
                )}
                {appNumberError && (
                  <p className="text-xs text-red-600 mt-1">{appNumberError}</p>
                )}
              </div>
              {isExtended && (
                <div>
                  <FieldLabel>Subcategory</FieldLabel>
                  <Select value={form.subcategory || ""} onValueChange={v => update("subcategory", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select subcategory..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>— None —</SelectItem>
                      {subcatOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <FieldLabel>Brand</FieldLabel>
                <Input value={form.brand} onChange={e => update("brand", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>OEM Number</FieldLabel>
                <Input value={form.oem_number} onChange={e => update("oem_number", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>Supplier Part Number</FieldLabel>
                <Input value={form.supplier_sku} onChange={e => update("supplier_sku", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>Aftermarket Number</FieldLabel>
                <Input value={form.aftermarket_number} onChange={e => update("aftermarket_number", e.target.value)} className="rounded-sm" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Description</FieldLabel>
                <Textarea value={form.description} onChange={e => update("description", e.target.value)} className="rounded-sm" rows={2} />
              </div>
              <div className="col-span-2">
                <FieldLabel>Compatible Fitments / Applications</FieldLabel>
                <FitmentBuilder value={form.fitments || []} onChange={v => update("fitments", v)} />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Stock */}
          <div>
            <SectionHeader num={2} title="Pricing & Stock" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Unit Cost</FieldLabel>
                <Input type="number" step="0.01" value={form.unit_cost} onChange={e => update("unit_cost", Number(e.target.value))} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>Sell Price</FieldLabel>
                <Input type="number" step="0.01" value={form.sell_price} onChange={e => update("sell_price", Number(e.target.value))} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>Stock Quantity</FieldLabel>
                <Input type="number" value={form.stock_quantity} onChange={e => update("stock_quantity", Number(e.target.value))} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>Min Stock Level</FieldLabel>
                <Input type="number" value={form.min_stock_level} onChange={e => update("min_stock_level", Number(e.target.value))} className="rounded-sm" />
              </div>
              {(isExtended || form.category === "oils" || form.category === "sprays" || form.category === "chemicals") && (
                <div>
                  <FieldLabel>Pack / Volume Size</FieldLabel>
                  <Input value={form.volume_size || form.pack_size || ""} onChange={e => { update("volume_size", e.target.value); update("pack_size", e.target.value); }} placeholder="e.g. 5L, 20L, Box of 50" className="rounded-sm" />
                </div>
              )}
              {(isConsumable) && (
                <div>
                  <FieldLabel>Issue Method</FieldLabel>
                  <Select value={form.issue_method || "each"} onValueChange={v => update("issue_method", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["each","pack","carton","weight","volume"].map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <FieldLabel>Location</FieldLabel>
                <Input value={form.location} onChange={e => update("location", e.target.value)} className="rounded-sm" placeholder="e.g. Shelf A3" />
              </div>
              <div>
                <FieldLabel>Supplier</FieldLabel>
                <Autocomplete
                  value={form.supplier_name}
                  suggestions={supplierAC.suggestions}
                  open={supplierAC.open}
                  loading={supplierAC.loading}
                  onInputChange={(val) => { update("supplier_name", val); supplierAC.handleInputChange(val); }}
                  onSelect={(item) => { update("supplier_name", item.name); supplierAC.handleSelectSuggestion(item); }}
                  onShowAll={supplierAC.handleShowAll}
                  placeholder="Search supplier..."
                  className="rounded-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Hazmat / Safety (oils, sprays, chemicals) */}
          {isHazmat && (
            <div>
              <SectionHeader num={3} title="Safety & Storage" badge="Hazmat" badgeColor="bg-rose-100 text-rose-700" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex gap-6">
                  {[
                    { key: "hazardous", label: "Hazardous" },
                    { key: "dangerous_goods", label: "Dangerous Goods" },
                    { key: "sds_required", label: "SDS Required" },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!form[f.key]} onChange={e => update(f.key, e.target.checked)}
                        className="w-4 h-4 rounded border-border accent-primary" />
                      <span className="text-xs font-heading uppercase tracking-wider">{f.label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <FieldLabel>Expiry Date (optional)</FieldLabel>
                  <Input type="date" value={form.expiry_date || ""} onChange={e => update("expiry_date", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel>Batch / Lot Number</FieldLabel>
                  <Input value={form.batch_lot_number || ""} onChange={e => update("batch_lot_number", e.target.value)} className="rounded-sm" />
                </div>
                <div className="col-span-2">
                  <FieldLabel>Storage Requirement Notes</FieldLabel>
                  <Textarea value={form.storage_notes || ""} onChange={e => update("storage_notes", e.target.value)} className="rounded-sm" rows={2} placeholder="e.g. Store in cool, dry, ventilated area away from heat sources" />
                </div>
              </div>
            </div>
          )}

          {/* Section 3/4: Compliance fields */}
          {isCompliance && (
            <div>
              <SectionHeader num={3} title="Compliance Details" badge="Compliance" badgeColor="bg-green-100 text-green-700" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form.regulated_item} onChange={e => update("regulated_item", e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-primary" />
                    <span className="text-xs font-heading uppercase tracking-wider">Regulated Item</span>
                  </label>
                </div>
                <div>
                  <FieldLabel>Compliance Type</FieldLabel>
                  <Input value={form.compliance_type || ""} onChange={e => update("compliance_type", e.target.value)} placeholder="e.g. Fire Safety, Electrical" className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel>Tag / Cert Reference</FieldLabel>
                  <Input value={form.compliance_reference || ""} onChange={e => update("compliance_reference", e.target.value)} placeholder="e.g. AS/NZS 1841" className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel>Expiry / Renewal Date</FieldLabel>
                  <Input type="date" value={form.expiry_date || ""} onChange={e => update("expiry_date", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel>Inspection Interval (days)</FieldLabel>
                  <Input type="number" value={form.inspection_interval_days || ""} onChange={e => update("inspection_interval_days", Number(e.target.value) || null)} className="rounded-sm" placeholder="e.g. 365" />
                </div>
              </div>
            </div>
          )}

          {/* Consumables extra */}
          {isConsumable && (
            <div>
              <SectionHeader num={3} title="Consumable Details" badge="Consumables" badgeColor="bg-teal-100 text-teal-700" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form.workshop_use} onChange={e => update("workshop_use", e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-primary" />
                    <span className="text-xs font-heading uppercase tracking-wider">Workshop Use Item</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
          <Button onClick={save} disabled={saving || !form.part_number || !form.name || !form.app_part_number}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            {saving ? "Saving..." : initial ? "Update Part" : "Add Part"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ num, title, badge, badgeColor }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-sm">
        <span className="font-heading font-bold text-black text-sm">{num}</span>
      </div>
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">{title}</h3>
      {badge && <span className={`text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold ${badgeColor}`}>{badge}</span>}
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">{children}</label>;
}