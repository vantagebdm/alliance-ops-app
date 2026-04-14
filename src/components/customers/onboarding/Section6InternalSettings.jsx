import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionHeader from "./SectionHeader";
import FieldLabel from "./FieldLabel";

const ACCOUNT_STATUSES = [
  { value: "cash_sale", label: "Cash Sale" },
  { value: "credit_pending", label: "Credit Application Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "active_credit", label: "Active Credit Account" },
  { value: "on_hold", label: "On Hold" },
  { value: "declined", label: "Declined" },
];

const PRICING_TIERS = [
  { value: "retail", label: "Retail" },
  { value: "trade", label: "Trade" },
  { value: "fleet", label: "Fleet" },
  { value: "workshop", label: "Workshop" },
  { value: "contract", label: "Contract" },
  { value: "custom", label: "Custom" },
];

const SERVICE_REGIONS = [
  { value: "karratha", label: "Karratha" },
  { value: "pilbara", label: "Pilbara" },
  { value: "regional_wa", label: "Regional WA" },
  { value: "statewide", label: "Statewide" },
  { value: "other", label: "Other" },
];

export default function Section6InternalSettings({ form, update }) {
  return (
    <div>
      <SectionHeader number="6" title="Internal Customer Account Settings" />
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-sm px-3 py-2 mb-4">
        <p className="text-xs text-amber-600 font-heading uppercase tracking-wider">Internal Use Only — Not shown to customer</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <FieldLabel>Account Status</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_STATUSES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => update("account_status", s.value)}
                className={`px-3 py-1.5 rounded-sm border text-xs font-heading uppercase tracking-wider transition-colors ${
                  form.account_status === s.value
                    ? "bg-primary text-black border-primary"
                    : "border-border text-foreground/60 hover:border-primary/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Payment Terms Applied</FieldLabel>
          <Select value={form.payment_terms || "Net_30"} onValueChange={v => update("payment_terms", v)}>
            <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="COD">COD</SelectItem>
              <SelectItem value="Net_7">Net 7</SelectItem>
              <SelectItem value="Net_14">Net 14</SelectItem>
              <SelectItem value="Net_30">Net 30</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>Pricing Tier</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {PRICING_TIERS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => update("pricing_tier", t.value)}
                className={`px-2.5 py-1 rounded-sm border text-xs font-heading uppercase tracking-wider transition-colors ${
                  form.pricing_tier === t.value
                    ? "bg-primary text-black border-primary"
                    : "border-border text-foreground/60 hover:border-primary/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Assigned Account Manager</FieldLabel>
          <Input value={form.account_manager || ""} onChange={e => update("account_manager", e.target.value)} className="rounded-sm" />
        </div>

        <div>
          <FieldLabel>Service Region</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {SERVICE_REGIONS.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => update("service_region", r.value)}
                className={`px-2.5 py-1 rounded-sm border text-xs font-heading uppercase tracking-wider transition-colors ${
                  form.service_region === r.value
                    ? "bg-primary text-black border-primary"
                    : "border-border text-foreground/60 hover:border-primary/50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Customer Tags</FieldLabel>
          <Input value={form.customer_tags || ""} onChange={e => update("customer_tags", e.target.value)} className="rounded-sm" placeholder="e.g. VIP, Breakdown, Mining..." />
        </div>

        <div className="col-span-2">
          <FieldLabel>Internal Notes</FieldLabel>
          <Textarea value={form.internal_notes || ""} onChange={e => update("internal_notes", e.target.value)} className="rounded-sm" rows={2} />
        </div>
        <div>
          <FieldLabel>Credit Risk Notes</FieldLabel>
          <Textarea value={form.credit_risk_notes || ""} onChange={e => update("credit_risk_notes", e.target.value)} className="rounded-sm" rows={2} />
        </div>
        <div>
          <FieldLabel>Special Pricing Notes</FieldLabel>
          <Textarea value={form.special_pricing_notes || ""} onChange={e => update("special_pricing_notes", e.target.value)} className="rounded-sm" rows={2} />
        </div>
        <div className="col-span-2">
          <FieldLabel>Delivery Notes</FieldLabel>
          <Textarea value={form.delivery_notes || ""} onChange={e => update("delivery_notes", e.target.value)} className="rounded-sm" rows={2} />
        </div>
      </div>
    </div>
  );
}