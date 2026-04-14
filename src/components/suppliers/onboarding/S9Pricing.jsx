import SupplierSectionHeader from "./SuplierSectionHeader";
import { FSelect, FToggle, FTextarea } from "./SupplierField";

export default function S9Pricing({ form, update }) {
  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Pricing & Commercial Controls" subtitle="Pricing basis, discounts, agreements and market position." />
      <div className="grid grid-cols-2 gap-3">
        <FSelect label="Pricing Basis" value={form.pricing_basis} onChange={v => update("pricing_basis", v)}
          options={["Fixed Price","Discount off List","Nett Cost","Contract Pricing","Dynamic / Varies"]}
        />
        <FSelect label="Competitive Position" value={form.competitive_position} onChange={v => update("competitive_position", v)}
          options={["Premium","Standard","Budget","Strategic"]}
        />
      </div>
      <div className="flex flex-wrap gap-6 py-1">
        <FToggle label="Rebate Agreement" checked={!!form.rebate_agreement} onChange={v => update("rebate_agreement", v)} />
        <FToggle label="Annual Volume Agreement" checked={!!form.volume_agreement} onChange={v => update("volume_agreement", v)} />
        <FToggle label="Preferred for Breakdown Jobs" checked={!!form.preferred_breakdown} onChange={v => update("preferred_breakdown", v)} />
      </div>
      <FTextarea label="Discount Structure Notes" value={form.discount_notes} onChange={e => update("discount_notes", e.target.value)} />
      <FTextarea label="Special Contract Terms" value={form.special_contract_terms} onChange={e => update("special_contract_terms", e.target.value)} />
      <FTextarea label="Margin Opportunity Notes" value={form.margin_notes} onChange={e => update("margin_notes", e.target.value)} />
    </div>
  );
}