import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickSupplierForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Supplier.create(form);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-3 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">New Supplier</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => u("name", e.target.value)}
              placeholder="Supplier name"
              className="w-full h-8 px-2 text-sm border border-input rounded-sm"
            />
          </div>

          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Contact Person</label>
            <input
              type="text"
              value={form.contact_person}
              onChange={(e) => u("contact_person", e.target.value)}
              placeholder="Name"
              className="w-full h-8 px-2 text-sm border border-input rounded-sm"
            />
          </div>

          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => u("email", e.target.value)}
              placeholder="email@example.com"
              className="w-full h-8 px-2 text-sm border border-input rounded-sm"
            />
          </div>

          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => u("phone", e.target.value)}
              placeholder="+61 8 9000 0000"
              className="w-full h-8 px-2 text-sm border border-input rounded-sm"
            />
          </div>
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} size="sm" className="rounded-sm text-xs">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving || !form.name}
            className="bg-primary text-black hover:bg-primary/90 text-xs rounded-sm"
            size="sm"
          >
            {saving ? "Creating..." : "Add Supplier"}
          </Button>
        </div>
      </div>
    </div>
  );
}