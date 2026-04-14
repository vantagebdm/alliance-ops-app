import SupplierSectionHeader from "./SuplierSectionHeader";
import { FSelect, FToggle, FMultiCheck, FTagInput } from "./SupplierField";
import { CATEGORIES, EQUIPMENT_TYPES } from "./SupplierFormShared";

export default function S6Procurement({ form, update }) {
  return (
    <div className="space-y-5">
      <SupplierSectionHeader title="Procurement Settings" subtitle="Categories, equipment types, brands and supply capabilities." />
      
      <div className="flex flex-wrap gap-6">
        <FToggle label="Preferred Supplier" checked={!!form.preferred_supplier} onChange={v => update("preferred_supplier", v)} />
        <FToggle label="Warranty Support" checked={!!form.warranty_support} onChange={v => update("warranty_support", v)} />
        <FToggle label="Returns Accepted" checked={!!form.returns_accepted} onChange={v => update("returns_accepted", v)} />
        <FToggle label="Core Exchange Supplier" checked={!!form.core_exchange} onChange={v => update("core_exchange", v)} />
      </div>

      <FMultiCheck label="Categories Supplied" options={CATEGORIES}
        selected={form.categories_supplied || []} onChange={v => update("categories_supplied", v)} />

      <FMultiCheck label="Equipment Types Supported" options={EQUIPMENT_TYPES}
        selected={form.equipment_types || []} onChange={v => update("equipment_types", v)} />

      <FTagInput label="Brands Supplied (press Enter to add)"
        tags={form.brands_supplied || []} onChange={v => update("brands_supplied", v)} />

      <FSelect label="OEM / Aftermarket / Both" value={form.oem_aftermarket} onChange={v => update("oem_aftermarket", v)}
        options={["OEM","Aftermarket","Both"]}
      />
    </div>
  );
}