import { useState, useEffect } from "react";
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
  const supplierAC = useAutocomplete("Supplier", "name");
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!initial && !form.app_part_number && form.category) {
      generateNextPartNumber(form.category).then(nextNum => {
        setForm(f => ({ ...f, app_part_number: nextNum }));
      });
    }
  }, []);

  const getCategoryPrefix = (category) => {
    const prefixMap = {
      engine: "APP-ENG", transmission: "APP-TRM", brakes: "APP-BRK", suspension: "APP-SUS",
      electrical: "APP-ELE", body: "APP-BOD", filters: "APP-FLT", hydraulic: "APP-HYD",
      driveline: "APP-DRV", cooling: "APP-COL", fuel: "APP-FUL", tyres: "APP-TYR",
      oils: "APP-OIL", sprays: "APP-SPR", consumables: "APP-CON", compliance: "APP-COM",
      chemicals: "APP-CHM", other: "APP-OTH"
    };
    return prefixMap[category] || "";
  };

  const generateNextPartNumber = async (category) => {
    try {
      const prefix = getCategoryPrefix(category);
      const allParts = await base44.entities.Part.list();
      const matchingParts = allParts.filter(p => p.app_part_number?.startsWith(prefix));
      let nextNum = 1;
      if (matchingParts.length > 0) {
        const numbers = matchingParts
          .map(p => {
            const num = p.app_part_number?.replace(prefix, "").trim();
            return parseInt(num) || 0;
          })
          .filter(n => n > 0);
        nextNum = Math.max(...numbers) + 1;
      }
      const paddedNum = String(nextNum).padStart(4, "0");
      return `${prefix}${paddedNum}`;
    } catch (err) {
      console.error("Error generating part number:", err);
      return getCategoryPrefix(category);
    }
  };

  const handleCategoryChange = async (newCategory) => {
    update("category", newCategory);
    update("subcategory", "");
    const nextPartNumber = await generateNextPartNumber(newCategory);
    update("app_part_number", nextPartNumber);
  };

  const save = async () => {
    if (!form.part_number) {
      alert("Part Number is required");
      return;
    }
    if (!form.name) {
      alert("Part Name is required");
      return;
    }
    if (!form.app_part_number || form.app_part_number.length < 7) {
      alert("APP Internal Part Number is required");
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
      alert(err.message || "Error saving part");
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
                 <Input value={form.part_number} onChange={e => update("part_number", e.target.value.toUpperCase())} className="rounded-sm" />
               </div>
               <div>
                 <FieldLabel>Name *</FieldLabel>
                 <Input value={form.name} onChange={e => update("name", e.target.value.toUpperCase())} className="rounded-sm" />
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
                  onChange={e => update("app_part_number", e.target.value.toUpperCase())}
                  className="rounded-sm font-mono font-semibold text-primary bg-primary/5 border-primary/30"
                  placeholder="Auto-generated based on category"
                  readOnly={form.app_part_number && form.app_part_number.match(/^APP-[A-Z]{3}\d{4}$/)}
                />
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
                <Input value={form.brand} onChange={e => update("brand", e.target.value.toUpperCase())} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>OEM Number</FieldLabel>
                <Input value={form.oem_number} onChange={e => update("oem_number", e.target.value.toUpperCase())} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>Supplier Part Number</FieldLabel>
                <Input value={form.supplier_sku} onChange={e => update("supplier_sku", e.target.value.toUpperCase())} className="rounded-sm" />
              </div>
              <div>
                <FieldLabel>Aftermarket Number</FieldLabel>
                <Input value={form.aftermarket_number} onChange={e => update("aftermarket_number", e.target.value.toUpperCase())} className="rounded-sm" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Description</FieldLabel>
                <Textarea value={form.description} onChange={e => update("description", e.target.value.toUpperCase())} className="rounded-sm" rows={2} />
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
                <div className="flex items-center justify-between mb-1">
                  <FieldLabel>Sell Price</FieldLabel>
                  <div className="flex gap-1">
                    {[30, 45, 65].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => update("sell_price", parseFloat((form.unit_cost * (1 + pct / 100)).toFixed(2)))}
                        className="px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider rounded-sm bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-colors"
                      >
                        +{pct}%
                      </button>
                    ))}
                  </div>
                </div>
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