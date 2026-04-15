import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_SUPPLIER } from "./onboarding/SupplierFormShared";
import S1Identity from "./onboarding/S1Identity";
import S2Contacts from "./onboarding/S2Contacts";
import S3AccountsContact from "./onboarding/S3AccountsContact";
import S4Addresses from "./onboarding/S4Addresses";
import S5PaymentTerms from "./onboarding/S5PaymentTerms";
import S6Procurement from "./onboarding/S6Procurement";
import S7Freight from "./onboarding/S7Freight";
import S8Operations from "./onboarding/S8Operations";
import S9Pricing from "./onboarding/S9Pricing";
import S10Returns from "./onboarding/S10Returns";
import S11Performance from "./onboarding/S11Performance";
import S12Attachments from "./onboarding/S12Attachments";

const SECTIONS = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Contacts" },
  { id: 3, label: "Accounts" },
  { id: 4, label: "Addresses" },
  { id: 5, label: "Payment" },
  { id: 6, label: "Procurement" },
  { id: 7, label: "Freight" },
  { id: 8, label: "Operations" },
  { id: 9, label: "Pricing" },
  { id: 10, label: "Returns" },
  { id: 11, label: "Performance" },
  { id: 12, label: "Documents" },
];

export default function SupplierOnboardingForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState(initial || { ...DEFAULT_SUPPLIER });
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    let saved;
    if (initial?.id) {
      saved = await base44.entities.Supplier.update(initial.id, form);
    } else {
      saved = await base44.entities.Supplier.create(form);
    }
    setSaving(false);
    onSaved(saved || { ...form });
  };

  const isValid = !!(form.name && (form.phone || form.email) && form.status);

  const renderSection = () => {
    switch (step) {
      case 1: return <S1Identity form={form} update={update} />;
      case 2: return <S2Contacts form={form} update={update} />;
      case 3: return <S3AccountsContact form={form} update={update} />;
      case 4: return <S4Addresses form={form} update={update} />;
      case 5: return <S5PaymentTerms form={form} update={update} />;
      case 6: return <S6Procurement form={form} update={update} />;
      case 7: return <S7Freight form={form} update={update} />;
      case 8: return <S8Operations form={form} update={update} />;
      case 9: return <S9Pricing form={form} update={update} />;
      case 10: return <S10Returns form={form} update={update} />;
      case 11: return <S11Performance form={form} update={update} />;
      case 12: return <S12Attachments form={form} update={update} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl flex flex-col mx-4" style={{ minHeight: "min(92vh, 900px)" }}>
        {/* Header */}
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm flex-shrink-0">
          <div>
            <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">
              {initial ? "Edit Supplier" : "New Supplier"}
            </h2>
            <p className="text-white/40 text-[10px] font-heading uppercase tracking-wider mt-0.5">
              {initial?.name || "Supplier Onboarding"} · Section {step} of {SECTIONS.length}
            </p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Section nav */}
        <div className="bg-[hsl(0,0%,12%)] px-4 py-2 flex gap-1 overflow-x-auto flex-shrink-0">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 text-[9px] font-heading uppercase tracking-wider rounded-sm transition-colors ${
                step === s.id
                  ? "bg-primary text-black font-bold"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {s.id}. {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between flex-shrink-0">
          <Button
            type="button" variant="outline" size="sm"
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="rounded-sm font-heading text-[10px] uppercase tracking-wider"
          >
            <ChevronLeft className="w-3 h-3 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button" variant="outline" size="sm"
              onClick={save} disabled={saving || !isValid}
              className="rounded-sm font-heading text-[10px] uppercase tracking-wider"
            >
              {saving ? "Saving..." : "Save Draft"}
            </Button>

            {step < SECTIONS.length ? (
              <Button
                type="button" size="sm"
                onClick={() => setStep(s => s + 1)}
                className="bg-primary text-black font-heading font-bold uppercase text-[10px] tracking-wider hover:bg-primary/90 rounded-sm"
              >
                Next <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button
                type="button" size="sm"
                onClick={save} disabled={saving || !isValid}
                className="bg-primary text-black font-heading font-bold uppercase text-[10px] tracking-wider hover:bg-primary/90 rounded-sm"
              >
                <Check className="w-3 h-3 mr-1" /> {saving ? "Saving..." : initial ? "Update Supplier" : "Create Supplier"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}