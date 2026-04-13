import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Autocomplete from "@/components/ui/Autocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";

export default function QuickPOForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    supplier_name: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);
  const supplierAC = useAutocomplete("Supplier", "name");

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        po_number: `PO-${Date.now().toString(36).toUpperCase()}`,
        items: [],
        subtotal: 0,
        gst: 0,
        total: 0,
      };
      await base44.entities.PurchaseOrder.create(data);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-3 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">New Purchase Order</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Supplier *</label>
            <Autocomplete
              value={form.supplier_name}
              suggestions={supplierAC.suggestions}
              open={supplierAC.open}
              loading={supplierAC.loading}
              onInputChange={(val) => {
                u("supplier_name", val);
                supplierAC.handleInputChange(val);
              }}
              onSelect={(item) => {
                u("supplier_name", item.name);
                supplierAC.handleSelectSuggestion(item);
              }}
              placeholder="Search supplier..."
              className="rounded-sm"
            />
          </div>

          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Status</label>
            <select
              value={form.status}
              onChange={(e) => u("status", e.target.value)}
              className="w-full h-8 px-2 text-sm border border-input rounded-sm"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} size="sm" className="rounded-sm text-xs">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving || !form.supplier_name}
            className="bg-primary text-black hover:bg-primary/90 text-xs rounded-sm"
            size="sm"
          >
            {saving ? "Creating..." : "Create PO"}
          </Button>
        </div>
      </div>
    </div>
  );
}