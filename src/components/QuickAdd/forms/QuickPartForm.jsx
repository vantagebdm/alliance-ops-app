import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickPartForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    part_number: "",
    name: "",
    category: "other",
  });
  const [saving, setSaving] = useState(false);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Part.create(form);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-3 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">New Part</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Part Number *</label>
            <input
              type="text"
              value={form.part_number}
              onChange={(e) => u("part_number", e.target.value)}
              placeholder="SKU or part number"
              className="w-full h-8 px-2 text-sm border border-input rounded-sm"
            />
          </div>

          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => u("name", e.target.value)}
              placeholder="Part name"
              className="w-full h-8 px-2 text-sm border border-input rounded-sm"
            />
          </div>

          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Category</label>
            <select
              value={form.category}
              onChange={(e) => u("category", e.target.value)}
              className="w-full h-8 px-2 text-sm border border-input rounded-sm"
            >
              <option value="engine">Engine</option>
              <option value="transmission">Transmission</option>
              <option value="brakes">Brakes</option>
              <option value="suspension">Suspension</option>
              <option value="electrical">Electrical</option>
              <option value="body">Body</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} size="sm" className="rounded-sm text-xs">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving || !form.part_number || !form.name}
            className="bg-primary text-black hover:bg-primary/90 text-xs rounded-sm"
            size="sm"
          >
            {saving ? "Creating..." : "Add Part"}
          </Button>
        </div>
      </div>
    </div>
  );
}