import { Input } from "@/components/ui/input";
import SectionHeader from "./SectionHeader";
import FieldLabel from "./FieldLabel";

const ACCOUNT_TERMS = [
  { value: "30_days", label: "30 Days" },
  { value: "cod", label: "COD" },
  { value: "other", label: "Other" },
];

export default function Section4AccountTerms({ form, update, extracted = {} }) {
  const F = (key) => extracted[key];

  return (
    <div>
      <SectionHeader number="4" title="Account Terms & Accounts Contacts" />
      <div className="grid grid-cols-2 gap-3">
        {/* Account Terms */}
        <div className="col-span-2">
          <FieldLabel extracted={F("account_terms")}>Account Terms</FieldLabel>
          <div className="flex gap-2">
            {ACCOUNT_TERMS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => update("account_terms", t.value)}
                className={`px-4 py-1.5 rounded-sm border text-xs font-heading uppercase tracking-wider transition-colors ${
                  form.account_terms === t.value
                    ? "bg-primary text-black border-primary"
                    : "border-border text-foreground/60 hover:border-primary/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {form.account_terms === "other" && (
            <div className="mt-2">
              <FieldLabel>Other Account Terms</FieldLabel>
              <Input value={form.account_terms_other || ""} onChange={e => update("account_terms_other", e.target.value)} className="rounded-sm" />
            </div>
          )}
        </div>

        {/* Commercial Settings */}
        <div className="col-span-2 mt-1">
          <p className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-3">Commercial Account Settings</p>
        </div>

        <div>
          <FieldLabel extracted={F("po_required")}>Purchase Order Required?</FieldLabel>
          <div className="flex gap-2">
            {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => update("po_required", opt.value)}
                className={`px-4 py-1.5 rounded-sm border text-xs font-heading uppercase tracking-wider transition-colors ${
                  form.po_required === opt.value
                    ? "bg-primary text-black border-primary"
                    : "border-border text-foreground/60 hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel extracted={F("accounts_emailed")}>Accounts to be Emailed?</FieldLabel>
          <div className="flex gap-2">
            {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => update("accounts_emailed", opt.value)}
                className={`px-4 py-1.5 rounded-sm border text-xs font-heading uppercase tracking-wider transition-colors ${
                  form.accounts_emailed === opt.value
                    ? "bg-primary text-black border-primary"
                    : "border-border text-foreground/60 hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <FieldLabel extracted={F("accounts_email")}>Accounts Email Address</FieldLabel>
          <Input type="email" value={form.accounts_email || ""} onChange={e => update("accounts_email", e.target.value)} className={`rounded-sm ${F("accounts_email") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel extracted={F("accounts_contact_name")}>Accounts Contact Name</FieldLabel>
          <Input value={form.accounts_contact_name || ""} onChange={e => update("accounts_contact_name", e.target.value)} className={`rounded-sm ${F("accounts_contact_name") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel extracted={F("accounts_contact_phone")}>Accounts Contact Phone</FieldLabel>
          <Input value={form.accounts_contact_phone || ""} onChange={e => update("accounts_contact_phone", e.target.value)} className={`rounded-sm ${F("accounts_contact_phone") ? "ring-1 ring-primary/40" : ""}`} />
        </div>

        {/* Banking */}
        <div className="col-span-2 mt-1">
          <p className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-3">Banking Details</p>
        </div>
        <div>
          <FieldLabel extracted={F("bank_branch")}>Bank and Branch</FieldLabel>
          <Input value={form.bank_branch || ""} onChange={e => update("bank_branch", e.target.value)} className={`rounded-sm ${F("bank_branch") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
        <div>
          <FieldLabel extracted={F("bank_account_number")}>Account Number</FieldLabel>
          <Input value={form.bank_account_number || ""} onChange={e => update("bank_account_number", e.target.value)} className={`rounded-sm font-mono ${F("bank_account_number") ? "ring-1 ring-primary/40" : ""}`} />
        </div>
      </div>
    </div>
  );
}