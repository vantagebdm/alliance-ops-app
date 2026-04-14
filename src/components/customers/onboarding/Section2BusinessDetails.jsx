import { Input } from "@/components/ui/input";
import SectionHeader from "./SectionHeader";
import FieldLabel from "./FieldLabel";

const PREMISES_TYPES = ["owned", "rented", "mortgaged", "other"];

export default function Section2BusinessDetails({ form, update, extracted = {} }) {
  const F = (key) => extracted[key];
  const isBusiness = form.customer_type !== "individual";

  return (
    <div>
      <SectionHeader number="2" title="Business Details" />
      {!isBusiness && (
        <p className="text-xs text-muted-foreground italic mb-3">Optional for individuals — complete if applicable.</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required={isBusiness} extracted={F("abn")}>ABN</FieldLabel>
          <Input value={form.abn || ""} onChange={e => update("abn", e.target.value)} className={`rounded-sm font-mono ${F("abn") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel extracted={F("acn")}>ACN</FieldLabel>
          <Input value={form.acn || ""} onChange={e => update("acn", e.target.value)} className={`rounded-sm font-mono ${F("acn") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel extracted={F("date_established")}>Date Established (Current Owners)</FieldLabel>
          <Input type="date" value={form.date_established || ""} onChange={e => update("date_established", e.target.value)} className={`rounded-sm ${F("date_established") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div className="col-span-2">
          <FieldLabel extracted={F("nature_of_business")}>Nature of Business</FieldLabel>
          <Input value={form.nature_of_business || ""} onChange={e => update("nature_of_business", e.target.value)} className={`rounded-sm ${F("nature_of_business") ? "ring-1 ring-primary/40" : ""}`} placeholder="e.g. Mining contractor, transport fleet..." />
        </div>
        <div>
          <FieldLabel extracted={F("paid_up_capital")}>Paid Up Capital ($)</FieldLabel>
          <Input value={form.paid_up_capital || ""} onChange={e => update("paid_up_capital", e.target.value)} className={`rounded-sm ${F("paid_up_capital") ? "ring-1 ring-primary/40" : ""}`} placeholder="$" />
        </div>
        <div>
          <FieldLabel extracted={F("estimated_monthly_purchases")}>Est. Monthly Purchases ($)</FieldLabel>
          <Input value={form.estimated_monthly_purchases || ""} onChange={e => update("estimated_monthly_purchases", e.target.value)} className={`rounded-sm ${F("estimated_monthly_purchases") ? "ring-1 ring-primary/40" : ""}`} placeholder="$" />
        </div>
        <div>
          <FieldLabel extracted={F("credit_limit_required")}>Credit Limit Required ($)</FieldLabel>
          <Input value={form.credit_limit_required || ""} onChange={e => update("credit_limit_required", e.target.value)} className={`rounded-sm ${F("credit_limit_required") ? "ring-1 ring-primary/40" : ""}`} placeholder="$" />
        </div>

        <div className="col-span-2 mt-1">
          <FieldLabel extracted={F("premises_type")}>Principal Place of Business — Premises Type</FieldLabel>
          <div className="flex gap-2 flex-wrap">
            {PREMISES_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => update("premises_type", t)}
                className={`px-3 py-1.5 rounded-sm border text-xs font-heading uppercase tracking-wider transition-colors ${
                  form.premises_type === t
                    ? "bg-primary text-black border-primary"
                    : "border-border text-foreground/60 hover:border-primary/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {form.premises_type === "other" && (
            <div className="mt-2">
              <FieldLabel>Other Premises Description</FieldLabel>
              <Input value={form.premises_type_other || ""} onChange={e => update("premises_type_other", e.target.value)} className="rounded-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}