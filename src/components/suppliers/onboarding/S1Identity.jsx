import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput, FSelect } from "./SupplierField";

export default function S1Identity({ form, update }) {
  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Supplier Identity" subtitle="Legal entity name, trading details and contact methods." />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Legal Entity Name" required className="col-span-2" value={form.name} onChange={e => update("name", e.target.value)} />
        <FInput label="Trading Name" value={form.trading_name} onChange={e => update("trading_name", e.target.value)} />
        <FInput label="Supplier Code / Internal ID" value={form.supplier_code} onChange={e => update("supplier_code", e.target.value)} />
        <FInput label="ABN" value={form.abn} onChange={e => update("abn", e.target.value)} />
        <FInput label="ACN" value={form.acn} onChange={e => update("acn", e.target.value)} />
        <FInput label="Website" value={form.website} onChange={e => update("website", e.target.value)} className="col-span-2" />
        <FInput label="Main Phone" required value={form.phone} onChange={e => update("phone", e.target.value)} />
        <FInput label="Main Email" required value={form.email} onChange={e => update("email", e.target.value)} />
        <FSelect label="Status" required className="col-span-2" value={form.status} onChange={v => update("status", v)}
          options={[
            { value: "active", label: "Active" },
            { value: "preferred", label: "Preferred" },
            { value: "inactive", label: "Inactive" },
            { value: "on_hold", label: "On Hold" },
            { value: "under_review", label: "Under Review" },
          ]}
        />
      </div>
    </div>
  );
}