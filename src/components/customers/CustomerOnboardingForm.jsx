import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, FileText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import PDFUploadExtract from "./onboarding/PDFUploadExtract";
import Section1CustomerDetails from "./onboarding/Section1CustomerDetails";
import Section2BusinessDetails from "./onboarding/Section2BusinessDetails";
import Section3Directors from "./onboarding/Section3Directors";
import Section4AccountTerms from "./onboarding/Section4AccountTerms";
import Section5TradeReferences from "./onboarding/Section5TradeReferences";
import Section6InternalSettings from "./onboarding/Section6InternalSettings";

const defaultForm = () => ({
  customer_type: "company",
  name: "", trading_name: "",
  physical_address_1: "", physical_address_2: "", physical_state: "WA", physical_postcode: "",
  billing_address_1: "", billing_address_2: "", billing_state: "WA", billing_postcode: "",
  email: "", phone: "", fax: "", mobile: "",
  abn: "", acn: "", date_established: "", nature_of_business: "",
  paid_up_capital: "", estimated_monthly_purchases: "", credit_limit_required: "",
  premises_type: "",
  directors: [
    { full_name: "", dob: "", address_1: "", address_2: "", state: "", postcode: "", licence_number: "", phone: "", mobile: "" },
    { full_name: "", dob: "", address_1: "", address_2: "", state: "", postcode: "", licence_number: "", phone: "", mobile: "" },
  ],
  account_terms: "30_days", po_required: false, accounts_emailed: false,
  accounts_email: "", accounts_contact_name: "", accounts_contact_phone: "",
  bank_branch: "", bank_account_number: "",
  trade_references: [
    { business_name: "", address: "", contact: "" },
    { business_name: "", address: "", contact: "" },
    { business_name: "", address: "", contact: "" },
  ],
  account_status: "cash_sale", payment_terms: "Net_30", pricing_tier: "trade",
  account_manager: "", service_region: "",
  internal_notes: "", credit_risk_notes: "", special_pricing_notes: "", delivery_notes: "",
  customer_tags: "",
});

const CREDIT_STATUSES = ["credit_pending", "under_review", "active_credit"];

export default function CustomerOnboardingForm({ onClose, onSaved, initial }) {
  const [method, setMethod] = useState("manual"); // manual | pdf
  const [form, setForm] = useState(initial || defaultForm());
  const [extractedFields, setExtractedFields] = useState({}); // tracks which fields came from PDF
  const [pdfUrl, setPdfUrl] = useState(initial?.pdf_attachment_url || "");
  const [showForm, setShowForm] = useState(!!initial); // show form after extraction or immediately for manual
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleExtracted = (data, fileUrl) => {
    const merged = { ...defaultForm(), ...form };
    const extracted = {};

    // Map extracted data onto form fields and track which came from PDF
    const map = (key, val) => {
      if (val !== undefined && val !== null && val !== "") {
        merged[key] = val;
        extracted[key] = true;
      }
    };

    map("name", data.name);
    map("trading_name", data.trading_name);
    map("customer_type", data.customer_type);
    map("physical_address_1", data.physical_address_1);
    map("physical_address_2", data.physical_address_2);
    map("physical_state", data.physical_state);
    map("physical_postcode", data.physical_postcode);
    map("billing_address_1", data.billing_address_1);
    map("billing_address_2", data.billing_address_2);
    map("billing_state", data.billing_state);
    map("billing_postcode", data.billing_postcode);
    map("email", data.email);
    map("phone", data.phone);
    map("fax", data.fax);
    map("mobile", data.mobile);
    map("abn", data.abn);
    map("acn", data.acn);
    map("date_established", data.date_established);
    map("nature_of_business", data.nature_of_business);
    map("paid_up_capital", data.paid_up_capital);
    map("estimated_monthly_purchases", data.estimated_monthly_purchases);
    map("credit_limit_required", data.credit_limit_required);
    map("premises_type", data.premises_type);
    map("account_terms", data.account_terms);
    map("po_required", data.po_required);
    map("accounts_emailed", data.accounts_emailed);
    map("accounts_email", data.accounts_email);
    map("accounts_contact_name", data.accounts_contact_name);
    map("accounts_contact_phone", data.accounts_contact_phone);
    map("bank_branch", data.bank_branch);
    map("bank_account_number", data.bank_account_number);

    if (data.directors?.length) {
      merged.directors = data.directors;
      data.directors.forEach((d, i) => {
        Object.keys(d).forEach(k => {
          if (d[k]) extracted[`director_${i}_${k}`] = true;
        });
      });
    }

    if (data.trade_references?.length) {
      merged.trade_references = data.trade_references;
      data.trade_references.forEach((r, i) => {
        Object.keys(r).forEach(k => {
          if (r[k]) extracted[`ref_${i}_${k}`] = true;
        });
      });
    }

    setForm(merged);
    setExtractedFields(extracted);
    setPdfUrl(fileUrl);
    setShowForm(true);
  };

  const validate = () => {
    if (!form.name) return "Full / Legal Name is required.";
    if (!form.email && !form.phone && !form.mobile) return "At least one contact method is required.";
    if (!form.physical_address_1 || !form.physical_state || !form.physical_postcode) return "Physical address is required.";
    if (!form.billing_address_1 || !form.billing_state || !form.billing_postcode) return "Billing address is required.";
    if (CREDIT_STATUSES.includes(form.account_status)) {
      if (form.customer_type !== "individual" && !form.abn) return "ABN is required for credit accounts.";
      if (!form.credit_limit_required) return "Credit Limit Required is needed for credit accounts.";
      if (!form.accounts_email && !form.accounts_contact_name) return "Accounts contact is required for credit accounts.";
    }
    return null;
  };

  const save = async (openAfter = false, createTask = false) => {
    const err = validate();
    if (err) { alert(err); return; }
    setSaving(true);

    const payload = {
      ...form,
      created_by_method: method === "pdf" ? "pdf_extraction" : "manual_entry",
      pdf_attachment_url: pdfUrl || "",
      // Keep legacy fields in sync for backward compat
      address: form.physical_address_1,
      state: form.physical_state,
      postcode: form.physical_postcode,
      company: form.trading_name || form.name,
      status: "active",
    };

    let saved;
    if (initial?.id) {
      saved = await base44.entities.Customer.update(initial.id, payload);
    } else {
      saved = await base44.entities.Customer.create(payload);
    }

    setSaving(false);
    onSaved(saved, { openAfter, createTask });
  };

  const isCreditStatus = CREDIT_STATUSES.includes(form.account_status);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-[hsl(0,0%,10%)] w-full max-w-5xl rounded-sm shadow-2xl mx-4">

        {/* Header */}
        <div className="bg-[hsl(0,0%,5%)] px-6 py-5 flex items-center justify-between rounded-t-sm sticky top-0 z-10">
          <div>
            <h2 className="font-heading text-xl font-bold text-white uppercase tracking-widest">
              {initial ? "Edit Customer" : "New Customer — Credit Account Onboarding"}
            </h2>
            <p className="text-white/40 text-xs font-heading uppercase tracking-wider mt-0.5">Alliance Priority Parts — Commercial Trade Account</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white ml-4"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-8">

          {/* Entry Method */}
          {!initial && (
            <div className="bg-[hsl(0,0%,13%)] border border-border rounded-sm p-4">
              <p className="font-heading text-[11px] uppercase tracking-widest text-foreground/50 mb-3">Create Customer Method</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setMethod("manual"); setShowForm(true); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-sm border text-sm font-heading uppercase tracking-wider transition-colors ${
                    method === "manual" ? "bg-primary text-black border-primary" : "border-border text-foreground/60 hover:border-primary/50"
                  }`}
                >
                  <PenLine className="w-4 h-4" /> Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod("pdf"); setShowForm(false); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-sm border text-sm font-heading uppercase tracking-wider transition-colors ${
                    method === "pdf" ? "bg-primary text-black border-primary" : "border-border text-foreground/60 hover:border-primary/50"
                  }`}
                >
                  <FileText className="w-4 h-4" /> Upload Credit Application PDF
                </button>
              </div>
            </div>
          )}

          {/* PDF Upload */}
          {method === "pdf" && !showForm && (
            <PDFUploadExtract onExtracted={handleExtracted} />
          )}

          {/* Extraction banner */}
          {showForm && Object.keys(extractedFields).length > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-sm px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <p className="text-xs text-foreground/80">
                <span className="font-heading uppercase tracking-wider text-primary">PDF Extraction Complete</span>
                {" — "}Fields highlighted in green were extracted from the uploaded PDF. Review all values before saving.
              </p>
            </div>
          )}

          {/* Form Sections */}
          {showForm && (
            <>
              <div className="border-t border-border pt-6">
                <Section1CustomerDetails form={form} update={update} extracted={extractedFields} />
              </div>
              <div className="border-t border-border pt-6">
                <Section2BusinessDetails form={form} update={update} extracted={extractedFields} />
              </div>
              <div className="border-t border-border pt-6">
                <Section3Directors form={form} update={update} extracted={extractedFields} />
              </div>
              <div className="border-t border-border pt-6">
                <Section4AccountTerms form={form} update={update} extracted={extractedFields} />
              </div>
              <div className="border-t border-border pt-6">
                <Section5TradeReferences form={form} update={update} extracted={extractedFields} />
              </div>
              <div className="border-t border-border pt-6">
                <Section6InternalSettings form={form} update={update} />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {showForm && (
          <div className="px-6 py-4 bg-[hsl(0,0%,8%)] border-t border-border flex flex-wrap justify-between items-center gap-3 rounded-b-sm">
            <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">
              Cancel
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => save(false, false)}
                disabled={saving}
                className="rounded-sm font-heading text-xs uppercase tracking-wider"
              >
                {saving ? "Saving..." : "Save Customer"}
              </Button>
              <Button
                onClick={() => save(true, false)}
                disabled={saving}
                className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
              >
                {saving ? "Saving..." : "Save & Open Customer"}
              </Button>
              {(pdfUrl || isCreditStatus) && (
                <Button
                  onClick={() => save(false, true)}
                  disabled={saving}
                  className="bg-amber-500 text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-amber-400 rounded-sm"
                >
                  Save & Create Credit Review Task
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}