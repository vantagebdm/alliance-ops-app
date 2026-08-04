import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Building2, Plus, Trash2 } from "lucide-react";

const SUPPLIER_TYPES = [
  { value: "sole_trader", label: "Sole Trader" },
  { value: "partnership", label: "Partnership" },
  { value: "company", label: "Company / Pty Ltd" },
  { value: "trust", label: "Trust" },
  { value: "other", label: "Other" },
];
const PAYMENT_TERMS = ["COD", "7 Days", "14 Days", "30 Days", "30 Days EOM", "60 Days", "Other"];
const ORDER_METHODS = ["Phone", "Email", "Online Portal / Web Order", "EDI", "Sales Rep Visit", "Other"];
const CATEGORIES = [
  "Engine", "Transmission", "Brakes", "Suspension", "Electrical", "Filters", "Hydraulic",
  "Cooling", "Fuel", "Driveline", "Tyres", "Oils & Fluids", "Chemicals", "Consumables",
  "Compliance", "Fasteners", "Other",
];
const OEM_OPTIONS = ["OEM", "Aftermarket", "Both"];
const FREIGHT_OPTIONS = ["APP Freight Account", "Supplier Freight Account", "Third Party", "Free Freight (above threshold)"];

const BLANK = {
  supplier_type: "company",
  name: "", trading_name: "", abn: "", acn: "", date_established: "", nature_of_business: "",
  address: "", city: "", state: "", postcode: "", country: "Australia",
  warehouse_address: "", warehouse_city: "", warehouse_state: "", warehouse_postcode: "",
  phone: "", email: "", website: "",
  contact_person: "", contact_position: "", contact_phone: "", contact_mobile: "", contact_email: "",
  accounts_contact_name: "", accounts_phone: "", accounts_email: "", statement_email: "",
  invoice_email: "", returns_email: "",
  additional_contacts: [],
  afterhours_contact: "", breakdown_contact: "", business_hours: "", sales_territory: "",
  payment_terms: "30 Days", credit_limit: "", currency: "AUD", gst_registered: true,
  account_number: "", pricing_basis: "", accepts_credit_card: false, card_surcharge: "",
  rebate_agreement: false, volume_agreement: false, discount_notes: "", special_contract_terms: "",
  bank_name: "", bank_account_name: "", bank_bsb: "", bank_account_number: "",
  purchase_method: "Email", orders_email: "", portal_url: "", portal_username: "", cutoff_time: "",
  lead_time_standard: "", lead_time_express: "", min_order_value: "",
  ships_karratha: false, ships_pilbara: false, emergency_supply: false, price_file_available: false,
  freight_account_option: "", freight_notes: "",
  returns_accepted: false, rma_required: false, core_exchange: false,
  return_window: "", restocking_fee: "", returns_contact: "", warranty_claim_notes: "", dangerous_goods_notes: "",
  categories_supplied: [], brands_supplied: "", oem_aftermarket: "Both", pricing_notes: "",
  declaration_name: "", declaration_position: "", declaration_date: "",
};

function Section({ n, title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 md:p-6">
      <h2 className="text-xs font-heading font-bold tracking-widest text-primary mb-5 uppercase border-b border-border pb-2">
        {n ? `Section ${n} — ${title}` : title}
      </h2>
      {children}
    </div>
  );
}
function Field({ label, required, children, error, colSpan = "" }) {
  return (
    <div className={colSpan}>
      <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
function CheckField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

export default function SupplierApplicationForm() {
  const [form, setForm] = useState({ ...BLANK });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (c) => setForm(f => {
    const arr = f.categories_supplied || [];
    return { ...f, categories_supplied: arr.includes(c) ? arr.filter(x => x !== c) : [...arr, c] };
  });

  const addContact = () => setForm(f => ({ ...f, additional_contacts: [...(f.additional_contacts || []), { name: "", role: "", phone: "", email: "" }] }));
  const updateContact = (i, k, v) => setForm(f => ({ ...f, additional_contacts: (f.additional_contacts || []).map((c, idx) => idx === i ? { ...c, [k]: v } : c) }));
  const removeContact = (i) => setForm(f => ({ ...f, additional_contacts: (f.additional_contacts || []).filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.declaration_name.trim()) e.declaration_name = "Authorised representative name required";
    if (!form.declaration_date) e.declaration_date = "Declaration date required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setErrors({});
    setSubmitting(true);
    const payload = { ...form, brands_supplied: (form.brands_supplied || "").split(",").map(s => s.trim()).filter(Boolean) };
    try {
      const result = await base44.functions.invoke("createSupplierApplication", payload);
      setSubmitted(result.data);
    } catch (err) {
      setErrors({ submit: err.message || "Submission failed" });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-1">APPLICATION SUBMITTED</h1>
          <p className="text-muted-foreground text-sm mb-5">Thank you — your supplier account application has been received.</p>
          <div className="bg-muted/40 rounded-lg p-4 text-left space-y-2 mb-5">
            <div className="flex justify-between"><span className="text-muted-foreground text-xs uppercase tracking-wider">Reference</span><span className="font-mono font-bold">{submitted.application_number}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-xs uppercase tracking-wider">Submitted</span><span className="text-xs">{new Date(submitted.submitted_at).toLocaleString("en-AU")}</span></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs uppercase tracking-wider">Match Status</span>
              {submitted.status === "matched"
                ? <span className="text-xs font-bold text-primary">Matched to On Hold account</span>
                : <span className="text-xs text-amber-400">Pending internal review</span>}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Our accounts team has been notified and will be in contact. Please retain your reference number.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">SUPPLIER ACCOUNT APPLICATION</h1>
          <p className="text-muted-foreground mt-1 text-sm">Alliance Priority Parts Pty. Ltd. · ABN 33 697 061 279</p>
          <p className="text-muted-foreground text-xs mt-1">Please complete all sections. Fields marked * are required.</p>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/40 text-destructive text-sm">{errors.submit}</div>
        )}

        <div className="space-y-5">
          {/* Supplier type */}
          <Section title="Supplier Type">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPLIER_TYPES.map(t => (
                <label key={t.value} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-sm transition-colors ${form.supplier_type === t.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"}`}>
                  <Checkbox checked={form.supplier_type === t.value} onCheckedChange={() => set("supplier_type", t.value)} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Section 1 — Company Details */}
          <Section n={1} title="Company / Business Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Legal / Company Name" required error={errors.name} colSpan="sm:col-span-2">
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Pentagon Freight Services Pty Ltd" />
              </Field>
              <Field label="Trading Name (if different)">
                <Input value={form.trading_name} onChange={e => set("trading_name", e.target.value)} />
              </Field>
              <Field label="Date Established">
                <Input value={form.date_established} onChange={e => set("date_established", e.target.value)} placeholder="e.g. 1998" />
              </Field>
              <Field label="ABN"><Input value={form.abn} onChange={e => set("abn", e.target.value)} placeholder="00 000 000 000" /></Field>
              <Field label="ACN"><Input value={form.acn} onChange={e => set("acn", e.target.value)} /></Field>
              <Field label="Nature / Type of Business" colSpan="sm:col-span-2"><Input value={form.nature_of_business} onChange={e => set("nature_of_business", e.target.value)} placeholder="e.g. Freight & logistics services" /></Field>
              <Field label="Head Office Address" colSpan="sm:col-span-2"><Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street address" /></Field>
              <Field label="City"><Input value={form.city} onChange={e => set("city", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="State"><Input value={form.state} onChange={e => set("state", e.target.value)} placeholder="WA" /></Field>
                <Field label="Postcode"><Input value={form.postcode} onChange={e => set("postcode", e.target.value)} /></Field>
              </div>
              <Field label="Warehouse / Dispatch Address (if different)" colSpan="sm:col-span-2"><Input value={form.warehouse_address} onChange={e => set("warehouse_address", e.target.value)} /></Field>
              <Field label="Warehouse City"><Input value={form.warehouse_city} onChange={e => set("warehouse_city", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Warehouse State"><Input value={form.warehouse_state} onChange={e => set("warehouse_state", e.target.value)} /></Field>
                <Field label="Warehouse Postcode"><Input value={form.warehouse_postcode} onChange={e => set("warehouse_postcode", e.target.value)} /></Field>
              </div>
              <Field label="General Phone" required error={errors.phone}><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></Field>
              <Field label="General Email" required error={errors.email}><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></Field>
              <Field label="Website" colSpan="sm:col-span-2"><Input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." /></Field>
            </div>
          </Section>

          {/* Section 2 — Primary Contact */}
          <Section n={2} title="Primary Contact / Sales Representative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Name"><Input value={form.contact_person} onChange={e => set("contact_person", e.target.value)} /></Field>
              <Field label="Position / Title"><Input value={form.contact_position} onChange={e => set("contact_position", e.target.value)} /></Field>
              <Field label="Direct Phone"><Input value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} /></Field>
              <Field label="Mobile"><Input value={form.contact_mobile} onChange={e => set("contact_mobile", e.target.value)} /></Field>
              <Field label="Email" colSpan="sm:col-span-2"><Input type="email" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} /></Field>
            </div>
          </Section>

          {/* Section 3 — Accounts Contact */}
          <Section n={3} title="Accounts / Finance Contact">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Accounts Contact Name"><Input value={form.accounts_contact_name} onChange={e => set("accounts_contact_name", e.target.value)} /></Field>
              <Field label="Accounts Phone"><Input value={form.accounts_phone} onChange={e => set("accounts_phone", e.target.value)} /></Field>
              <Field label="Accounts Email"><Input type="email" value={form.accounts_email} onChange={e => set("accounts_email", e.target.value)} /></Field>
              <Field label="Statements Email"><Input type="email" value={form.statement_email} onChange={e => set("statement_email", e.target.value)} /></Field>
              <Field label="Invoices Email"><Input type="email" value={form.invoice_email} onChange={e => set("invoice_email", e.target.value)} /></Field>
              <Field label="Returns / Credits Email"><Input type="email" value={form.returns_email} onChange={e => set("returns_email", e.target.value)} /></Field>
            </div>
          </Section>

          {/* Section 4 — Additional Contacts */}
          <Section n={4} title="Additional Contacts & Operations">
            <div className="space-y-3">
              {(form.additional_contacts || []).map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4"><Input value={c.name} onChange={e => updateContact(i, "name", e.target.value)} placeholder="Name / Role" /></div>
                  <div className="col-span-3"><Input value={c.phone} onChange={e => updateContact(i, "phone", e.target.value)} placeholder="Phone" /></div>
                  <div className="col-span-4"><Input value={c.email} onChange={e => updateContact(i, "email", e.target.value)} placeholder="Email" /></div>
                  <div className="col-span-1"><button type="button" onClick={() => removeContact(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button></div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addContact} className="rounded-sm"><Plus className="w-4 h-4 mr-1" /> Add Contact</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Field label="After Hours / Breakdown Emergency Contact"><Input value={form.afterhours_contact} onChange={e => set("afterhours_contact", e.target.value)} /></Field>
              <Field label="Breakdown Phone"><Input value={form.breakdown_contact} onChange={e => set("breakdown_contact", e.target.value)} /></Field>
              <Field label="Business Hours"><Input value={form.business_hours} onChange={e => set("business_hours", e.target.value)} placeholder="Mon–Fri 8am–5pm" /></Field>
              <Field label="Sales Territory / Coverage Area"><Input value={form.sales_territory} onChange={e => set("sales_territory", e.target.value)} /></Field>
            </div>
          </Section>

          {/* Section 5 — Payment Terms */}
          <Section n={5} title="Payment Terms & Financial Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Payment Terms Offered">
                <Select value={form.payment_terms} onValueChange={v => set("payment_terms", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Credit Limit Offered to APP ($)"><Input value={form.credit_limit} onChange={e => set("credit_limit", e.target.value)} /></Field>
              <Field label="Currency"><Input value={form.currency} onChange={e => set("currency", e.target.value)} /></Field>
              <Field label="GST Registered?">
                <Select value={form.gst_registered ? "yes" : "no"} onValueChange={v => set("gst_registered", v === "yes")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Account / Customer Number Assigned to APP"><Input value={form.account_number} onChange={e => set("account_number", e.target.value)} /></Field>
              <Field label="Pricing Basis"><Input value={form.pricing_basis} onChange={e => set("pricing_basis", e.target.value)} placeholder="Trade / Wholesale / List" /></Field>
              <div className="sm:col-span-2 flex flex-wrap gap-6">
                <CheckField label="Accepts Credit Card" checked={form.accepts_credit_card} onChange={v => set("accepts_credit_card", v)} />
                <label className="flex items-center gap-2 text-sm"><span className="text-muted-foreground text-xs uppercase tracking-wider">Card Surcharge %</span><Input value={form.card_surcharge} onChange={e => set("card_surcharge", e.target.value)} className="w-20 h-8" /></label>
                <CheckField label="Rebate / Volume Agreement" checked={form.rebate_agreement} onChange={v => set("rebate_agreement", v)} />
                <CheckField label="Volume Agreement" checked={form.volume_agreement} onChange={v => set("volume_agreement", v)} />
              </div>
              <Field label="Discount / Rebate Notes" colSpan="sm:col-span-2"><Textarea value={form.discount_notes} onChange={e => set("discount_notes", e.target.value)} className="min-h-[60px]" /></Field>
              <Field label="Special Contract Terms / Notes" colSpan="sm:col-span-2"><Textarea value={form.special_contract_terms} onChange={e => set("special_contract_terms", e.target.value)} className="min-h-[60px]" /></Field>
            </div>
          </Section>

          {/* Section 6 — Banking */}
          <Section n={6} title="Banking / Remittance Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Bank Name"><Input value={form.bank_name} onChange={e => set("bank_name", e.target.value)} /></Field>
              <Field label="BSB"><Input value={form.bank_bsb} onChange={e => set("bank_bsb", e.target.value)} /></Field>
              <Field label="Account Name"><Input value={form.bank_account_name} onChange={e => set("bank_account_name", e.target.value)} /></Field>
              <Field label="Account Number"><Input value={form.bank_account_number} onChange={e => set("bank_account_number", e.target.value)} /></Field>
            </div>
          </Section>

          {/* Section 7 — Ordering & Procurement */}
          <Section n={7} title="Ordering & Procurement Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Preferred Order Method" colSpan="sm:col-span-2">
                <Select value={form.purchase_method} onValueChange={v => set("purchase_method", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Orders / Purchase Orders Email"><Input type="email" value={form.orders_email} onChange={e => set("orders_email", e.target.value)} /></Field>
              <Field label="Online Portal URL"><Input value={form.portal_url} onChange={e => set("portal_url", e.target.value)} /></Field>
              <Field label="Portal Login / Username"><Input value={form.portal_username} onChange={e => set("portal_username", e.target.value)} /></Field>
              <Field label="Cut-off Time for Same Day"><Input value={form.cutoff_time} onChange={e => set("cutoff_time", e.target.value)} placeholder="e.g. 2pm" /></Field>
              <Field label="Standard Lead Time (days)"><Input type="number" value={form.lead_time_standard} onChange={e => set("lead_time_standard", e.target.value)} /></Field>
              <Field label="Express Lead Time (days)"><Input type="number" value={form.lead_time_express} onChange={e => set("lead_time_express", e.target.value)} /></Field>
              <Field label="Minimum Order Value ($)"><Input value={form.min_order_value} onChange={e => set("min_order_value", e.target.value)} /></Field>
              <div className="sm:col-span-2 flex flex-wrap gap-6 pt-1">
                <CheckField label="Ships to Karratha / Pilbara" checked={form.ships_karratha} onChange={v => set("ships_karratha", v)} />
                <CheckField label="Ships Pilbara Region" checked={form.ships_pilbara} onChange={v => set("ships_pilbara", v)} />
                <CheckField label="Emergency / After Hours Supply" checked={form.emergency_supply} onChange={v => set("emergency_supply", v)} />
                <CheckField label="Price File Available" checked={form.price_file_available} onChange={v => set("price_file_available", v)} />
              </div>
              <Field label="Freight Account Option" colSpan="sm:col-span-2">
                <Select value={form.freight_account_option} onValueChange={v => set("freight_account_option", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{FREIGHT_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Freight / Dispatch Notes" colSpan="sm:col-span-2"><Textarea value={form.freight_notes} onChange={e => set("freight_notes", e.target.value)} className="min-h-[60px]" /></Field>
            </div>
          </Section>

          {/* Section 8 — Returns */}
          <Section n={8} title="Returns, Warranty & Claims">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-wrap gap-6">
                <CheckField label="Returns Accepted" checked={form.returns_accepted} onChange={v => set("returns_accepted", v)} />
                <CheckField label="RMA Required" checked={form.rma_required} onChange={v => set("rma_required", v)} />
                <CheckField label="Core / Exchange Program" checked={form.core_exchange} onChange={v => set("core_exchange", v)} />
              </div>
              <Field label="Return Window"><Input value={form.return_window} onChange={e => set("return_window", e.target.value)} placeholder="e.g. 30 days" /></Field>
              <Field label="Restocking Fee %"><Input value={form.restocking_fee} onChange={e => set("restocking_fee", e.target.value)} /></Field>
              <Field label="Returns / Credits Contact" colSpan="sm:col-span-2"><Input value={form.returns_contact} onChange={e => set("returns_contact", e.target.value)} /></Field>
              <Field label="Warranty Claim Notes / Procedure" colSpan="sm:col-span-2"><Textarea value={form.warranty_claim_notes} onChange={e => set("warranty_claim_notes", e.target.value)} className="min-h-[60px]" /></Field>
              <Field label="Dangerous Goods / Hazmat Notes" colSpan="sm:col-span-2"><Textarea value={form.dangerous_goods_notes} onChange={e => set("dangerous_goods_notes", e.target.value)} className="min-h-[60px]" /></Field>
            </div>
          </Section>

          {/* Section 9 — Products */}
          <Section n={9} title="Products & Categories Supplied">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Categories Supplied</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <label key={c} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border cursor-pointer text-xs transition-colors ${(form.categories_supplied || []).includes(c) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}>
                      <Checkbox checked={(form.categories_supplied || []).includes(c)} onCheckedChange={() => toggleCategory(c)} />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Field label="Brands / Manufacturers Supplied (comma separated)" colSpan="sm:col-span-2"><Input value={form.brands_supplied} onChange={e => set("brands_supplied", e.target.value)} placeholder="Caterpillar, Komatsu, Bosch" /></Field>
              <Field label="OEM / Aftermarket / Both">
                <Select value={form.oem_aftermarket} onValueChange={v => set("oem_aftermarket", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{OEM_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Additional Product Notes" colSpan="sm:col-span-2"><Textarea value={form.pricing_notes} onChange={e => set("pricing_notes", e.target.value)} className="min-h-[60px]" /></Field>
            </div>
          </Section>

          {/* Declaration */}
          <Section title="Declaration & Authorisation">
            <p className="text-xs text-muted-foreground mb-4">The undersigned confirms that all information provided is true and correct and authorises Alliance Priority Parts Pty. Ltd. to use this information for the purpose of establishing a supplier account.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Authorised Representative Name" required error={errors.declaration_name}><Input value={form.declaration_name} onChange={e => set("declaration_name", e.target.value)} /></Field>
              <Field label="Position"><Input value={form.declaration_position} onChange={e => set("declaration_position", e.target.value)} /></Field>
              <Field label="Date" required error={errors.declaration_date}><Input type="date" value={form.declaration_date} onChange={e => set("declaration_date", e.target.value)} /></Field>
            </div>
          </Section>

          <div className="flex justify-center pb-8">
            <Button onClick={handleSubmit} disabled={submitting} className="bg-primary text-black font-heading font-bold uppercase text-sm tracking-wider hover:bg-primary/90 rounded-sm h-12 px-10">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Application"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}