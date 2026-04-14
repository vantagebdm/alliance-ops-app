import { useState } from "react";
import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput, FSelect, FL } from "./SupplierField";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function S2Contacts({ form, update }) {
  const [showExtra, setShowExtra] = useState(false);

  const addContact = () => {
    update("additional_contacts", [...(form.additional_contacts || []), { name: "", position: "", phone: "", mobile: "", email: "" }]);
  };
  const removeContact = (i) => {
    const arr = [...(form.additional_contacts || [])];
    arr.splice(i, 1);
    update("additional_contacts", arr);
  };
  const updateContact = (i, k, v) => {
    const arr = [...(form.additional_contacts || [])];
    arr[i] = { ...arr[i], [k]: v };
    update("additional_contacts", arr);
  };

  return (
    <div className="space-y-5">
      <SupplierSectionHeader title="Primary Contact" subtitle="Main point of contact for orders, queries and general communication." />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Contact Name" required className="col-span-2" value={form.contact_person} onChange={e => update("contact_person", e.target.value)} />
        <FInput label="Position / Role" value={form.contact_position} onChange={e => update("contact_position", e.target.value)} />
        <FInput label="Phone" value={form.contact_phone} onChange={e => update("contact_phone", e.target.value)} />
        <FInput label="Mobile" value={form.contact_mobile} onChange={e => update("contact_mobile", e.target.value)} />
        <FInput label="Email" value={form.contact_email} onChange={e => update("contact_email", e.target.value)} />
        <FSelect label="Preferred Contact Method" value={form.contact_method} onChange={v => update("contact_method", v)}
          options={["Phone","Email","Mobile"]} className="col-span-2"
        />
      </div>

      {(form.additional_contacts || []).map((c, i) => (
        <div key={i} className="bg-muted/30 border border-border rounded-sm p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">Additional Contact {i + 1}</span>
            <button type="button" onClick={() => removeContact(i)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FInput label="Name" value={c.name} onChange={e => updateContact(i, "name", e.target.value)} />
            <FInput label="Position" value={c.position} onChange={e => updateContact(i, "position", e.target.value)} />
            <FInput label="Phone" value={c.phone} onChange={e => updateContact(i, "phone", e.target.value)} />
            <FInput label="Mobile" value={c.mobile} onChange={e => updateContact(i, "mobile", e.target.value)} />
            <FInput label="Email" className="col-span-2" value={c.email} onChange={e => updateContact(i, "email", e.target.value)} />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addContact}
        className="font-heading text-[10px] uppercase tracking-wider rounded-sm">
        <Plus className="w-3 h-3 mr-1" /> Add Another Contact
      </Button>
    </div>
  );
}