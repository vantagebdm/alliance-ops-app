import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput, FToggle, FTextarea } from "./SupplierField";

export default function S10Returns({ form, update }) {
  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Returns, Warranty & Claims" subtitle="Return policies, RMA process and warranty handling." />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Returns Contact" value={form.returns_contact} onChange={e => update("returns_contact", e.target.value)} />
        <FInput label="Warranty Contact" value={form.warranty_contact} onChange={e => update("warranty_contact", e.target.value)} />
        <FInput label="Return Window" value={form.return_window} onChange={e => update("return_window", e.target.value)} placeholder="e.g. 30 days" />
        <FInput label="Restocking Fee %" value={form.restocking_fee} onChange={e => update("restocking_fee", e.target.value)} />
      </div>
      <FToggle label="RMA Required" checked={!!form.rma_required} onChange={v => update("rma_required", v)} />
      <FTextarea label="Warranty Claim Process Notes" value={form.warranty_claim_notes} onChange={e => update("warranty_claim_notes", e.target.value)} />
      <FTextarea label="Core Return Process Notes" value={form.core_return_notes} onChange={e => update("core_return_notes", e.target.value)} />
      <FTextarea label="Faulty Goods Escalation Notes" value={form.faulty_goods_notes} onChange={e => update("faulty_goods_notes", e.target.value)} />
    </div>
  );
}