import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput, FSelect, FToggle } from "./SupplierField";

export default function S5PaymentTerms({ form, update }) {
  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Account & Payment Terms" subtitle="Supplier account number, credit terms and banking details." />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Supplier Account Number" value={form.account_number} onChange={e => update("account_number", e.target.value)} />
        <FSelect label="Payment Terms" required value={form.payment_terms} onChange={v => update("payment_terms", v)}
          options={[
            { value: "COD", label: "COD" },
            { value: "Net_7", label: "7 Days" },
            { value: "Net_14", label: "14 Days" },
            { value: "Net_30", label: "Net 30" },
            { value: "Net_30_EOM", label: "30 Days EOM" },
            { value: "Net_60", label: "60 Days" },
            { value: "Custom", label: "Custom" },
          ]}
        />
        {form.payment_terms === "Custom" && (
          <FInput label="Custom Terms Detail" className="col-span-2" value={form.payment_terms_custom} onChange={e => update("payment_terms_custom", e.target.value)} />
        )}
        <FInput label="Credit Limit (if applicable)" value={form.credit_limit} onChange={e => update("credit_limit", e.target.value)} />
        <FSelect label="Currency" value={form.currency} onChange={v => update("currency", v)}
          options={["AUD","USD","EUR","GBP","NZD"]}
        />
        <div className="col-span-2 flex gap-6 pt-1">
          <FToggle label="GST Registered" checked={form.gst_registered !== false} onChange={v => update("gst_registered", v)} />
          <FToggle label="Accepts Credit Card" checked={!!form.accepts_credit_card} onChange={v => update("accepts_credit_card", v)} />
        </div>
        {form.accepts_credit_card && (
          <FInput label="Card Surcharge %" value={form.card_surcharge} onChange={e => update("card_surcharge", e.target.value)} />
        )}
        <FSelect label="Purchase Method Preference" className="col-span-2" value={form.purchase_method} onChange={v => update("purchase_method", v)}
          options={["Email PO","Portal","Phone Order","EDI / API","Other"]}
        />
      </div>

      <div className="border-t border-border pt-4">
        <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Bank Details</p>
        <div className="grid grid-cols-2 gap-3">
          <FInput label="Bank Name" value={form.bank_name} onChange={e => update("bank_name", e.target.value)} />
          <FInput label="Account Name" value={form.bank_account_name} onChange={e => update("bank_account_name", e.target.value)} />
          <FInput label="BSB" value={form.bank_bsb} onChange={e => update("bank_bsb", e.target.value)} />
          <FInput label="Account Number" value={form.bank_account_number} onChange={e => update("bank_account_number", e.target.value)} />
        </div>
      </div>
    </div>
  );
}