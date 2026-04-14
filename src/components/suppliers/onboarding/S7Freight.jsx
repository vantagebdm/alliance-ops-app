import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput, FSelect, FToggle, FMultiCheck, FTextarea } from "./SupplierField";
import { FREIGHT_METHODS } from "./SupplierFormShared";

export default function S7Freight({ form, update }) {
  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Lead Times & Freight" subtitle="Delivery capabilities, regional coverage and freight settings." />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Standard Lead Time (days)" type="number" value={form.lead_time_standard} onChange={e => update("lead_time_standard", e.target.value)} />
        <FInput label="Express Lead Time (days)" type="number" value={form.lead_time_express} onChange={e => update("lead_time_express", e.target.value)} />
        <FInput label="Cut-off Time for Same Day Dispatch" value={form.cutoff_time} onChange={e => update("cutoff_time", e.target.value)} />
        <FInput label="Dispatch Origin Location" value={form.dispatch_origin} onChange={e => update("dispatch_origin", e.target.value)} />
        <FInput label="Free Freight Threshold ($)" value={form.free_freight_threshold} onChange={e => update("free_freight_threshold", e.target.value)} />
        <FSelect label="Freight Account Option" value={form.freight_account_option} onChange={v => update("freight_account_option", v)}
          options={["Supplier Freight","Customer Freight","Third Party Freight","Case by Case"]}
        />
      </div>

      <div className="flex flex-wrap gap-6 py-1">
        <FToggle label="Emergency / Breakdown Supply" checked={!!form.emergency_supply} onChange={v => update("emergency_supply", v)} />
        <FToggle label="Ships to Karratha" checked={!!form.ships_karratha} onChange={v => update("ships_karratha", v)} />
        <FToggle label="Ships to Pilbara / Regional WA" checked={!!form.ships_pilbara} onChange={v => update("ships_pilbara", v)} />
      </div>

      <FMultiCheck label="Freight Methods Available" options={FREIGHT_METHODS}
        selected={form.freight_methods || []} onChange={v => update("freight_methods", v)} />

      <FTextarea label="Dangerous Goods / Oversize Handling Notes" value={form.dangerous_goods_notes}
        onChange={e => update("dangerous_goods_notes", e.target.value)} />
    </div>
  );
}