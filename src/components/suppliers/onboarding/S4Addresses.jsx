import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput, FToggle } from "./SupplierField";

function AddressBlock({ prefix, form, update, labels }) {
  const f = (k) => form[`${prefix}_${k}`] || "";
  const u = (k) => (e) => update(`${prefix}_${k}`, e.target.value);
  return (
    <div className="grid grid-cols-2 gap-3">
      <FInput label={labels?.line1 || "Address Line 1"} className="col-span-2" value={f("address")} onChange={u("address")} />
      <FInput label="Address Line 2" className="col-span-2" value={f("address2")} onChange={u("address2")} />
      <FInput label="Suburb / City" value={f("city")} onChange={u("city")} />
      <FInput label="State" value={f("state")} onChange={u("state")} />
      <FInput label="Postcode" value={f("postcode")} onChange={u("postcode")} />
      <FInput label="Country" value={f("country")} onChange={u("country")} />
    </div>
  );
}

export default function S4Addresses({ form, update }) {
  return (
    <div className="space-y-6">
      <div>
        <SupplierSectionHeader title="Head Office / Main Address" />
        <div className="grid grid-cols-2 gap-3">
          <FInput label="Address Line 1" required className="col-span-2" value={form.address} onChange={e => update("address", e.target.value)} />
          <FInput label="Address Line 2" className="col-span-2" value={form.address2} onChange={e => update("address2", e.target.value)} />
          <FInput label="Suburb / City" value={form.city} onChange={e => update("city", e.target.value)} />
          <FInput label="State" value={form.state} onChange={e => update("state", e.target.value)} />
          <FInput label="Postcode" value={form.postcode} onChange={e => update("postcode", e.target.value)} />
          <FInput label="Country" value={form.country} onChange={e => update("country", e.target.value)} />
        </div>
      </div>

      <div>
        <SupplierSectionHeader title="Warehouse / Dispatch Address" />
        <FToggle label="Same as Head Office" checked={form.warehouse_same_as_head !== false} onChange={v => update("warehouse_same_as_head", v)} className="mb-3" />
        {form.warehouse_same_as_head === false && (
          <AddressBlock prefix="warehouse" form={form} update={update} />
        )}
      </div>

      <div>
        <SupplierSectionHeader title="Return Address" />
        <FToggle label="Same as Warehouse" checked={form.returns_same_as_warehouse !== false} onChange={v => update("returns_same_as_warehouse", v)} className="mb-3" />
        {form.returns_same_as_warehouse === false && (
          <AddressBlock prefix="returns" form={form} update={update} />
        )}
      </div>
    </div>
  );
}