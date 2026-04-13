import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/ui/Autocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";

export default function QuickEnquiryForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    customer_name: "",
    part_description: "",
    quantity: 1,
    urgency: "standard",
  });
  const [saving, setSaving] = useState(false);
  const customerAC = useAutocomplete("Customer", "name");

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        enquiry_number: `ENQ-${Date.now().toString(36).toUpperCase()}`,
      };
      await base44.entities.Enquiry.create(data);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-3 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">New Enquiry</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Customer *</label>
            <Autocomplete
              value={form.customer_name}
              suggestions={customerAC.suggestions}
              open={customerAC.open}
              loading={customerAC.loading}
              onInputChange={(val) => {
                u("customer_name", val);
                customerAC.handleInputChange(val);
              }}
              onSelect={(item) => {
                u("customer_name", item.name);
                customerAC.handleSelectSuggestion(item);
              }}
              placeholder="Search customer..."
              className="rounded-sm"
            />
          </div>

          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Part Description *</label>
            <Textarea
              value={form.part_description}
              onChange={(e) => u("part_description", e.target.value)}
              placeholder="What part do they need?"
              className="rounded-sm text-sm"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Quantity</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => u("quantity", Number(e.target.value))}
                className="w-full h-8 px-2 text-sm border border-input rounded-sm"
              />
            </div>
            <div>
              <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e) => u("urgency", e.target.value)}
                className="w-full h-8 px-2 text-sm border border-input rounded-sm"
              >
                <option value="standard">Standard</option>
                <option value="urgent">Urgent</option>
                <option value="breakdown">Breakdown</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} size="sm" className="rounded-sm text-xs">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving || !form.customer_name || !form.part_description}
            className="bg-primary text-black hover:bg-primary/90 text-xs rounded-sm"
            size="sm"
          >
            {saving ? "Creating..." : "Submit Enquiry"}
          </Button>
        </div>
      </div>
    </div>
  );
}