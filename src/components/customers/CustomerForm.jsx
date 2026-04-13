import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CustomerForm({ onClose, onSaved, initial }) {
  const [form, setForm] = useState(initial || {
    name: "", company: "", email: "", phone: "",
    address: "", city: "", state: "WA", postcode: "",
    payment_terms: "Net_30", status: "active", type: "other", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    if (initial?.id) await base44.entities.Customer.update(initial.id, form);
    else await base44.entities.Customer.create(form);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-10 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl mb-10">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
            {initial ? "Edit Customer" : "New Customer"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-3">
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Contact Name *</label>
            <Input value={form.name} onChange={e => update("name", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Company</label>
            <Input value={form.company} onChange={e => update("company", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Email</label>
            <Input value={form.email} onChange={e => update("email", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Phone</label>
            <Input value={form.phone} onChange={e => update("phone", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Type</label>
            <Select value={form.type} onValueChange={v => update("type", v)}>
              <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mine_site">Mine Site</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="fleet">Fleet</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Payment Terms</label>
            <Select value={form.payment_terms} onValueChange={v => update("payment_terms", v)}>
              <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="COD">COD</SelectItem>
                <SelectItem value="Net_7">Net 7</SelectItem>
                <SelectItem value="Net_14">Net 14</SelectItem>
                <SelectItem value="Net_30">Net 30</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Address</label>
            <Input value={form.address} onChange={e => update("address", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">City</label>
            <Input value={form.city} onChange={e => update("city", e.target.value)} className="rounded-sm" />
          </div>
          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Postcode</label>
            <Input value={form.postcode} onChange={e => update("postcode", e.target.value)} className="rounded-sm" />
          </div>
          <div className="col-span-2">
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 mb-1 block">Notes</label>
            <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} className="rounded-sm" rows={2} />
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
          <Button onClick={save} disabled={saving || !form.name}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            {saving ? "Saving..." : initial ? "Update" : "Add Customer"}
          </Button>
        </div>
      </div>
    </div>
  );
}