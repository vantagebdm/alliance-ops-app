import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_ROLES } from "@/lib/permissions";

const DEPARTMENTS = ["Operations", "Sales", "Purchasing", "Inventory", "Accounting", "Payroll", "Dispatch", "Warehouse", "Management", "IT", "HR", "Other"];

export default function UserForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", mobile: "", job_title: "",
    department: "", employment_type: "full_time", role_name: "Sales Representative",
    default_warehouse: "", start_date: "", expiry_date: "", notes: "",
    account_status: "invited", profile_image_url: "",
    ...initial
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("profile_image_url", file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) return;
    setSaving(true);
    if (initial?.id) {
      await base44.entities.UserProfile.update(initial.id, form);
    } else {
      await base44.entities.UserProfile.create(form);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-end">
      <div className="h-full w-[520px] bg-[hsl(0,0%,9%)] border-l border-[hsl(0,0%,18%)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,7%)]">
          <h2 className="font-heading text-base font-bold uppercase tracking-widest text-white">
            {initial ? "Edit User" : "Add User"}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Profile image */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[hsl(0,0%,18%)] border border-[hsl(0,0%,25%)] overflow-hidden flex items-center justify-center">
              {form.profile_image_url
                ? <img src={form.profile_image_url} className="w-full h-full object-cover" />
                : <span className="text-white/30 text-lg font-heading">{(form.first_name?.[0]||"")+(form.last_name?.[0]||"")}</span>}
            </div>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <span className="flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider text-primary border border-primary/30 px-3 py-1.5 rounded-sm hover:bg-primary/10">
                <Upload className="w-3 h-3" /> {uploading ? "Uploading..." : "Upload Photo"}
              </span>
            </label>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="First Name *">
              <Input value={form.first_name} onChange={e => set("first_name", e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            </FieldGroup>
            <FieldGroup label="Last Name *">
              <Input value={form.last_name} onChange={e => set("last_name", e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            </FieldGroup>
          </div>

          <FieldGroup label="Email Address *">
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </FieldGroup>

          <FieldGroup label="Mobile Number">
            <Input value={form.mobile} onChange={e => set("mobile", e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Job Title">
              <Input value={form.job_title} onChange={e => set("job_title", e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            </FieldGroup>
            <FieldGroup label="Department">
              <Select value={form.department} onValueChange={v => set("department", v)}>
                <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/70 rounded-sm text-xs">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Employment Type">
              <Select value={form.employment_type} onValueChange={v => set("employment_type", v)}>
                <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/70 rounded-sm text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                  {["full_time","part_time","casual","contractor"].map(e => <SelectItem key={e} value={e}>{e.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Role Assignment">
              <Select value={form.role_name} onValueChange={v => set("role_name", v)}>
                <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/70 rounded-sm text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                  {DEFAULT_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup label="Default Warehouse / Location">
            <Input value={form.default_warehouse} onChange={e => set("default_warehouse", e.target.value)} placeholder="e.g. Karratha Main Store" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Start Date">
              <Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            </FieldGroup>
            <FieldGroup label="Account Expiry (optional)">
              <Input type="date" value={form.expiry_date} onChange={e => set("expiry_date", e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            </FieldGroup>
          </div>

          <FieldGroup label="Account Status">
            <Select value={form.account_status} onValueChange={v => set("account_status", v)}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/70 rounded-sm text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                {["invited","active","suspended","disabled","archived"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Notes">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
              className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
          </FieldGroup>
        </div>

        <div className="px-6 py-4 border-t border-[hsl(0,0%,18%)] bg-[hsl(0,0%,7%)] flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60 hover:text-white">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.first_name || !form.last_name || !form.email}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            {saving ? "Saving..." : initial ? "Save Changes" : "Create User"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="font-heading text-[10px] uppercase tracking-wider text-white/40">{label}</label>
      {children}
    </div>
  );
}