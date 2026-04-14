import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput, FSelect, FTextarea, FL } from "./SupplierField";
import { Star } from "lucide-react";

export default function S11Performance({ form, update }) {
  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Internal Notes & Performance" subtitle="Procurement notes, risk assessment and supplier evaluation." />

      <FL label="Supplier Rating">
        <div className="flex items-center gap-1 mt-1">
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button" onClick={() => update("rating", n)}>
              <Star className={`w-6 h-6 transition-colors ${n <= (form.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2">{form.rating ? `${form.rating}/5` : "Not rated"}</span>
        </div>
      </FL>

      <div className="grid grid-cols-2 gap-3">
        <FInput label="Preferred Ranking" type="number" value={form.preferred_ranking} onChange={e => update("preferred_ranking", e.target.value)} />
        <FInput label="Last Review Date" type="date" value={form.last_review_date} onChange={e => update("last_review_date", e.target.value)} />
        <FSelect label="Review Frequency" value={form.review_frequency} onChange={v => update("review_frequency", v)}
          options={["Monthly","Quarterly","Bi-Annually","Annually","Ad Hoc"]}
        />
        <FInput label="Approved By" value={form.approved_by} onChange={e => update("approved_by", e.target.value)} />
        <FInput label="Managed By / Buyer" value={form.managed_by} onChange={e => update("managed_by", e.target.value)} />
      </div>

      <FTextarea label="Internal Procurement Notes" value={form.internal_notes} onChange={e => update("internal_notes", e.target.value)} rows={3} />
      <FTextarea label="Pricing Notes" value={form.pricing_notes} onChange={e => update("pricing_notes", e.target.value)} />
      <FTextarea label="Freight Notes" value={form.freight_notes} onChange={e => update("freight_notes", e.target.value)} />
      <FTextarea label="Service Reliability Notes" value={form.reliability_notes} onChange={e => update("reliability_notes", e.target.value)} />
      <FTextarea label="Account Risk Notes" value={form.risk_notes} onChange={e => update("risk_notes", e.target.value)} />
    </div>
  );
}