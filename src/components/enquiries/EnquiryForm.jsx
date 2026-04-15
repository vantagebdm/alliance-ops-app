import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/ui/Autocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";

export default function EnquiryForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState(initial || {
    customer_name: "", customer_email: "", customer_phone: "", company: "",
    part_description: "", part_number: "", vehicle_make: "", vehicle_model: "",
    vehicle_year: "", quantity: 1, urgency: "standard", source: "phone", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const customerAC = useAutocomplete("Customer", "name");
  const companyAC = useAutocomplete("Customer", "company");
  const partAC = useAutocomplete("Part", "part_number");

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const fillCustomer = (item) => {
    setForm(f => ({
      ...f,
      customer_name: item.name || f.customer_name,
      company: item.company || f.company,
      customer_email: item.email || f.customer_email,
      customer_phone: item.phone || f.customer_phone,
    }));
  };

  const save = async () => {
    setSaving(true);
    const data = { ...form };
    if (!data.enquiry_number) {
      data.enquiry_number = `ENQ-${Date.now().toString(36).toUpperCase()}`;
    }
    if (initial?.id) {
      await base44.entities.Enquiry.update(initial.id, data);
    } else {
      await base44.entities.Enquiry.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl mx-4">
        {/* Header */}
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
            {initial ? "Edit Enquiry" : "New Enquiry"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1: Customer */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-sm">1</span>
              </div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Customer Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Name *</label>
                <Autocomplete
                  value={form.customer_name}
                  suggestions={customerAC.suggestions}
                  open={customerAC.open}
                  loading={customerAC.loading}
                  onInputChange={(val) => {
                    update("customer_name", val);
                    customerAC.handleInputChange(val);
                  }}
                  onSelect={(item) => {
                    fillCustomer(item);
                    customerAC.handleSelectSuggestion(item);
                  }}
                  onShowAll={customerAC.handleShowAll}
                  placeholder="Search customer..."
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Company</label>
                <Autocomplete
                  value={form.company}
                  suggestions={companyAC.suggestions}
                  open={companyAC.open}
                  loading={companyAC.loading}
                  onInputChange={(val) => {
                    update("company", val);
                    companyAC.handleInputChange(val);
                  }}
                  onSelect={(item) => {
                    fillCustomer(item);
                    companyAC.handleSelectSuggestion(item);
                  }}
                  onShowAll={companyAC.handleShowAll}
                  placeholder="Search company..."
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Email</label>
                <Input value={form.customer_email} onChange={e => update("customer_email", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Phone</label>
                <Input value={form.customer_phone} onChange={e => update("customer_phone", e.target.value)} className="rounded-sm" />
              </div>
            </div>
          </div>

          {/* Section 2: Part Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-sm">2</span>
              </div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Part Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Part Description *</label>
                <Textarea value={form.part_description} onChange={e => update("part_description", e.target.value)} className="rounded-sm" rows={2} />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Part Number</label>
                <Autocomplete
                  value={form.part_number}
                  suggestions={partAC.suggestions}
                  open={partAC.open}
                  loading={partAC.loading}
                  onInputChange={(val) => {
                    update("part_number", val);
                    partAC.handleInputChange(val);
                  }}
                  onSelect={(item) => {
                    update("part_number", item.part_number);
                    partAC.handleSelectSuggestion(item);
                  }}
                  placeholder="Search part number..."
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Quantity</label>
                <Input type="number" value={form.quantity} onChange={e => update("quantity", Number(e.target.value))} className="rounded-sm" />
              </div>
            </div>
          </div>

          {/* Section 3: Vehicle */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-sm">3</span>
              </div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Vehicle Information</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Make</label>
                <Input value={form.vehicle_make} onChange={e => update("vehicle_make", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Model</label>
                <Input value={form.vehicle_model} onChange={e => update("vehicle_model", e.target.value)} className="rounded-sm" />
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Year</label>
                <Input value={form.vehicle_year} onChange={e => update("vehicle_year", e.target.value)} className="rounded-sm" />
              </div>
            </div>
          </div>

          {/* Section 4: Urgency & Source */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-sm">
                <span className="font-heading font-bold text-black text-sm">4</span>
              </div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">Priority & Source</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Urgency</label>
                <Select value={form.urgency} onValueChange={v => update("urgency", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Source</label>
                <Select value={form.source} onValueChange={v => update("source", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Notes</label>
                <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} className="rounded-sm" rows={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving || !form.customer_name || !form.part_description}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
          >
            {saving ? "Saving..." : initial ? "Update Enquiry" : "Submit Enquiry"}
          </Button>
        </div>
      </div>
    </div>
  );
}