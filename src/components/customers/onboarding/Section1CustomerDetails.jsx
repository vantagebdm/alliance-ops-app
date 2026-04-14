import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionHeader from "./SectionHeader";
import FieldLabel from "./FieldLabel";

const CUSTOMER_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "sole_trader", label: "Sole Trader" },
  { value: "trust", label: "Trust" },
  { value: "partnership", label: "Partnership" },
  { value: "company", label: "Company" },
  { value: "other", label: "Other" },
];

export default function Section1CustomerDetails({ form, update, extracted = {} }) {
  const F = (key) => extracted[key];

  return (
    <div>
      <SectionHeader number="1" title="Customer's Details" />
      <div className="grid grid-cols-2 gap-3">
        {/* Customer Type */}
        <div className="col-span-2">
          <FieldLabel required extracted={F("customer_type")}>Customer Type</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CUSTOMER_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => update("customer_type", t.value)}
                className={`px-3 py-1.5 rounded-sm border text-xs font-heading uppercase tracking-wider transition-colors ${
                  form.customer_type === t.value
                    ? "bg-primary text-black border-primary"
                    : "border-border text-foreground/60 hover:border-primary/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {form.customer_type === "other" && (
            <div className="mt-2">
              <FieldLabel>Other Customer Type Description</FieldLabel>
              <Input value={form.customer_type_other || ""} onChange={e => update("customer_type_other", e.target.value)} className="rounded-sm" placeholder="Describe customer type..." />
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="col-span-2">
          <FieldLabel required extracted={F("name")}>Full / Legal Name</FieldLabel>
          <Input value={form.name || ""} onChange={e => update("name", e.target.value)} className={`rounded-sm ${F("name") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div className="col-span-2">
          <FieldLabel extracted={F("trading_name")}>Trading Name (if different)</FieldLabel>
          <Input value={form.trading_name || ""} onChange={e => update("trading_name", e.target.value)} className={`rounded-sm ${F("trading_name") ? "ring-1 ring-primary/40" : ""}`} />
        </div>

        {/* Physical Address */}
        <div className="col-span-2 mt-1">
          <p className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Physical Address</p>
        </div>
        <div className="col-span-2">
          <FieldLabel required extracted={F("physical_address_1")}>Address Line 1</FieldLabel>
          <Input value={form.physical_address_1 || ""} onChange={e => update("physical_address_1", e.target.value)} className={`rounded-sm ${F("physical_address_1") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div className="col-span-2">
          <FieldLabel extracted={F("physical_address_2")}>Address Line 2</FieldLabel>
          <Input value={form.physical_address_2 || ""} onChange={e => update("physical_address_2", e.target.value)} className={`rounded-sm ${F("physical_address_2") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel required extracted={F("physical_state")}>State</FieldLabel>
          <Input value={form.physical_state || ""} onChange={e => update("physical_state", e.target.value)} className={`rounded-sm ${F("physical_state") ? "ring-1 ring-primary/40" : ""}`} placeholder="e.g. WA" />
        </div>
        <div>
          <FieldLabel required extracted={F("physical_postcode")}>Postcode</FieldLabel>
          <Input value={form.physical_postcode || ""} onChange={e => update("physical_postcode", e.target.value)} className={`rounded-sm ${F("physical_postcode") ? "ring-1 ring-primary/40" : ""}`} />
        </div>

        {/* Billing Address */}
        <div className="col-span-2 mt-1">
          <p className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Billing Address</p>
        </div>
        <div className="col-span-2">
          <FieldLabel required extracted={F("billing_address_1")}>Address Line 1</FieldLabel>
          <Input value={form.billing_address_1 || ""} onChange={e => update("billing_address_1", e.target.value)} className={`rounded-sm ${F("billing_address_1") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div className="col-span-2">
          <FieldLabel extracted={F("billing_address_2")}>Address Line 2</FieldLabel>
          <Input value={form.billing_address_2 || ""} onChange={e => update("billing_address_2", e.target.value)} className={`rounded-sm ${F("billing_address_2") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel required extracted={F("billing_state")}>State</FieldLabel>
          <Input value={form.billing_state || ""} onChange={e => update("billing_state", e.target.value)} className={`rounded-sm ${F("billing_state") ? "ring-1 ring-primary/40" : ""}`} placeholder="e.g. WA" />
        </div>
        <div>
          <FieldLabel required extracted={F("billing_postcode")}>Postcode</FieldLabel>
          <Input value={form.billing_postcode || ""} onChange={e => update("billing_postcode", e.target.value)} className={`rounded-sm ${F("billing_postcode") ? "ring-1 ring-primary/40" : ""}`} />
        </div>

        {/* Contact Details */}
        <div className="col-span-2 mt-1">
          <p className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Contact Details</p>
        </div>
        <div className="col-span-2">
          <FieldLabel extracted={F("email")}>Email Address</FieldLabel>
          <Input type="email" value={form.email || ""} onChange={e => update("email", e.target.value)} className={`rounded-sm ${F("email") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel extracted={F("phone")}>Phone Number</FieldLabel>
          <Input value={form.phone || ""} onChange={e => update("phone", e.target.value)} className={`rounded-sm ${F("phone") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel extracted={F("fax")}>Fax Number</FieldLabel>
          <Input value={form.fax || ""} onChange={e => update("fax", e.target.value)} className={`rounded-sm ${F("fax") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel extracted={F("mobile")}>Mobile Number</FieldLabel>
          <Input value={form.mobile || ""} onChange={e => update("mobile", e.target.value)} className={`rounded-sm ${F("mobile") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
      </div>
    </div>
  );
}