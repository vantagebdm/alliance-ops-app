import { useState, useRef } from "react";
import { Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-[10px] font-heading uppercase tracking-wider text-white/40 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="border-b border-[hsl(0,0%,16%)] pb-2 mb-4">
    <h3 className="font-heading text-xs uppercase tracking-widest text-white/30">{children}</h3>
  </div>
);

export default function CompanyProfile() {
  const [form, setForm] = useState({
    legal_name: "Alliance Priority Parts Pty Ltd",
    trading_name: "Alliance Priority Parts",
    abn: "12 345 678 901",
    acn: "345 678 901",
    reg_address: "14 Industrial Drive, Karratha WA 6714",
    postal_address: "PO Box 123, Karratha WA 6714",
    phone: "(08) 9144 1234",
    email: "info@allianceparts.com.au",
    website: "www.allianceparts.com.au",
    footer_text: "Alliance Priority Parts Pty Ltd | ABN 12 345 678 901 | All prices are in AUD and include GST where applicable.",
    bank_name: "ANZ Bank",
    bank_bsb: "016-123",
    bank_account: "1234 5678",
    bank_account_name: "Alliance Priority Parts Pty Ltd",
    remittance_email: "accounts@allianceparts.com.au",
    business_hours: "Mon–Fri 7:00am–5:00pm AWST",
    afterhours_contact: "0400 000 000",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [logos, setLogos] = useState({ company_logo: null, invoice_logo: null });
  const [uploading, setUploading] = useState({ company_logo: false, invoice_logo: false });
  const companyLogoRef = useRef();
  const invoiceLogoRef = useRef();

  const handleLogoUpload = async (key, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [key]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setLogos(l => ({ ...l, [key]: file_url }));
    setUploading(u => ({ ...u, [key]: false }));
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validateABN = (abn) => /^\d{2}\s?\d{3}\s?\d{3}\s?\d{3}$/.test(abn.replace(/\s/g, "").padEnd(11));
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = () => {
    const errs = {};
    if (!form.legal_name) errs.legal_name = "Company name is required.";
    if (!form.abn) errs.abn = "ABN is required.";
    else if (!validateABN(form.abn)) errs.abn = "Invalid ABN format. Expected: XX XXX XXX XXX";
    if (!form.reg_address) errs.reg_address = "Registered address is required.";
    if (form.email && !validateEmail(form.email)) errs.email = "Invalid email format.";
    if (form.remittance_email && !validateEmail(form.remittance_email)) errs.remittance_email = "Invalid email format.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Company Profile</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Identity */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <SectionTitle>Legal Identity</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Legal Entity Name" required error={errors.legal_name}>
            <Input value={form.legal_name} onChange={set("legal_name")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="Trading Name">
            <Input value={form.trading_name} onChange={set("trading_name")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="ABN" required error={errors.abn}>
            <Input value={form.abn} onChange={set("abn")} placeholder="XX XXX XXX XXX" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="ACN">
            <Input value={form.acn} onChange={set("acn")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
        </div>
      </div>

      {/* Address */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <SectionTitle>Address</SectionTitle>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Registered Address" required error={errors.reg_address}>
            <Input value={form.reg_address} onChange={set("reg_address")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="Postal Address">
            <Input value={form.postal_address} onChange={set("postal_address")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <SectionTitle>Contact Details</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Main Phone">
            <Input value={form.phone} onChange={set("phone")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="Main Email" error={errors.email}>
            <Input value={form.email} onChange={set("email")} type="email" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="Website">
            <Input value={form.website} onChange={set("website")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="Business Hours">
            <Input value={form.business_hours} onChange={set("business_hours")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="Emergency After-Hours Contact">
            <Input value={form.afterhours_contact} onChange={set("afterhours_contact")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
          <Field label="Default Remittance Email" error={errors.remittance_email}>
            <Input value={form.remittance_email} onChange={set("remittance_email")} type="email" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </Field>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <SectionTitle>Branding & Logos</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Company Logo", key: "company_logo", ref: companyLogoRef },
            { label: "Invoice Logo", key: "invoice_logo", ref: invoiceLogoRef },
          ].map(({ label, key, ref }) => (
            <div key={key}>
              <label className="block text-[10px] font-heading uppercase tracking-wider text-white/40 mb-1.5">{label}</label>
              <input
                type="file"
                accept="image/png,image/svg+xml,image/jpeg"
                ref={ref}
                className="hidden"
                onChange={e => handleLogoUpload(key, e.target.files[0])}
              />
              {logos[key] ? (
                <div className="relative border border-[hsl(0,0%,22%)] rounded-sm p-3 flex flex-col items-center gap-2 bg-[hsl(0,0%,13%)]">
                  <img src={logos[key]} alt={label} className="max-h-20 max-w-full object-contain" />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => ref.current.click()} className="text-[10px] text-white/40 hover:text-white/70 font-heading uppercase tracking-wider">Change</button>
                    <button onClick={() => setLogos(l => ({ ...l, [key]: null }))} className="text-[10px] text-red-400/60 hover:text-red-400 font-heading uppercase tracking-wider">Remove</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => ref.current.click()}
                  className="border-2 border-dashed border-[hsl(0,0%,22%)] rounded-sm p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/40 transition-all"
                >
                  {uploading[key] ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-white/20" />
                  )}
                  <span className="text-[10px] text-white/30 font-heading uppercase">
                    {uploading[key] ? "Uploading..." : "PNG/SVG · max 2MB"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bank & Invoice */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <SectionTitle>Bank Details (Displayed on Invoices)</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bank Name"><Input value={form.bank_name} onChange={set("bank_name")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" /></Field>
          <Field label="Account Name"><Input value={form.bank_account_name} onChange={set("bank_account_name")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" /></Field>
          <Field label="BSB"><Input value={form.bank_bsb} onChange={set("bank_bsb")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" /></Field>
          <Field label="Account Number"><Input value={form.bank_account} onChange={set("bank_account")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" /></Field>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <SectionTitle>Document Footer</SectionTitle>
        <Field label="Default Footer Text">
          <textarea value={form.footer_text} onChange={set("footer_text")} rows={3}
            className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
        </Field>
      </div>
    </div>
  );
}