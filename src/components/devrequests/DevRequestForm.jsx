import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload, Loader2, FileText, ImageIcon, Clipboard } from "lucide-react";
import moment from "moment";

const REQUEST_TYPES = [
  { value: "bug_site_issue", label: "Bug / Site Issue" },
  { value: "new_idea", label: "New Idea" },
  { value: "function_addition", label: "Function Addition" },
  { value: "documentation", label: "Documentation" },
  { value: "process_modification", label: "Process Modification" },
  { value: "process_addition", label: "Process Addition" },
];

const AREAS = [
  { value: "general", label: "General" },
  { value: "purchasing", label: "Purchasing" },
  { value: "invoicing", label: "Invoicing" },
  { value: "searching", label: "Searching" },
  { value: "viewing", label: "Viewing" },
  { value: "saving", label: "Saving" },
];

export default function DevRequestForm({ initial, user, onClose, onSaved }) {
  const [form, setForm] = useState({
    requested_by: initial?.requested_by || user?.full_name || user?.email || "",
    request_type: initial?.request_type || "bug_site_issue",
    summary: initial?.summary || "",
    description: initial?.description || "",
    area: initial?.area || "general",
    is_issue: initial?.is_issue ?? false,
    priority: initial?.priority || "normal",
  });
  const [attachments, setAttachments] = useState(initial?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);
  const imgRef = useRef();
  const docRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Paste image handler — listens on the modal container so right-click paste works
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length) {
      e.preventDefault();
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      const isImage = file.type.startsWith("image/");
      uploaded.push({
        url: result.file_url,
        name: file.name || (isImage ? "pasted-image.png" : "document"),
        file_type: isImage ? "image" : "document",
      });
    }
    setAttachments(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    uploadFiles(files);
    if (imgRef.current) imgRef.current.value = "";
  };

  const handleDocSelect = (e) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
    if (docRef.current) docRef.current.value = "";
  };

  const removeAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.summary.trim() || !form.requested_by.trim()) return;
    setSaving(true);
    try {
      if (initial?.id) {
        await base44.entities.DevRequest.update(initial.id, {
          ...form,
          attachments,
        });
      } else {
        const count = await base44.entities.DevRequest.list(null, 1);
        const seq = (count?.length || 0) + 1;
        const request_number = `DEV-${String(seq).padStart(4, "0")}`;
        await base44.entities.DevRequest.create({
          ...form,
          request_number,
          request_date: new Date().toISOString(),
          requested_by_id: user?.id,
          attachments,
          status: "open",
          comments: [],
        });
      }
      onSaved();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto" onPaste={handlePaste}>
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-card rounded-t-xl z-10">
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground uppercase tracking-wider">
              {initial?.id ? "Edit Request" : "New Development Request"}
            </h2>
            {!initial?.id && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Date & time stamped automatically on submission
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Requested By + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Requested By <span className="text-red-400">*</span>
              </Label>
              <Input value={form.requested_by} onChange={e => set("requested_by", e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Date & Time Stamp
              </Label>
              <Input
                value={initial?.id && initial.request_date ? moment(initial.request_date).format("DD/MM/YYYY HH:mm") : moment().format("DD/MM/YYYY HH:mm")}
                disabled
                className="opacity-60"
              />
            </div>
          </div>

          {/* Request Type + Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Request Type</Label>
              <Select value={form.request_type} onValueChange={v => set("request_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Area / Module</Label>
              <Select value={form.area} onValueChange={v => set("area", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AREAS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Summary <span className="text-red-400">*</span>
            </Label>
            <Input value={form.summary} onChange={e => set("summary", e.target.value)} placeholder="Short title for this request" />
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</Label>
            <Textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Provide full details of the request, issue, or idea..."
              rows={5}
            />
          </div>

          {/* Priority + Is Issue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Priority</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-3">
                <Checkbox id="is_issue" checked={form.is_issue} onCheckedChange={v => set("is_issue", v)} />
                <label htmlFor="is_issue" className="text-sm text-foreground cursor-pointer">This is an issue / bug</label>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Attachments</Label>
            <div
              tabIndex={0}
              className={`border border-dashed border-border rounded-lg p-4 transition-colors cursor-pointer focus:outline-none focus:border-primary focus:bg-primary/5 ${pasteHint ? "border-primary bg-primary/5" : ""}`}
              onPaste={handlePaste}
              onClick={() => imgRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setPasteHint(true); }}
              onDragLeave={() => setPasteHint(false)}
              onDrop={e => { e.preventDefault(); setPasteHint(false); uploadFiles(Array.from(e.dataTransfer.files)); }}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <Button type="button" variant="outline" size="sm" onClick={() => imgRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 mr-1" />}
                  Upload Images
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => docRef.current?.click()} disabled={uploading}>
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Upload Documents
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Click, paste (Ctrl+V), or drag images here</span>
                </div>
              </div>
              <input ref={imgRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
              <input ref={docRef} type="file" multiple className="hidden" onChange={handleDocSelect} />

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group">
                      {att.file_type === "image" ? (
                        <a href={att.url} target="_blank" rel="noopener noreferrer">
                          <img src={att.url} alt={att.name} className="w-20 h-20 object-cover rounded-lg border border-border" />
                        </a>
                      ) : (
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="w-20 h-20 flex flex-col items-center justify-center bg-secondary rounded-lg border border-border p-1">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground mt-1 truncate w-full text-center">{att.name}</span>
                        </a>
                      )}
                      <button
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-card rounded-b-xl">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.summary.trim() || !form.requested_by.trim()} className="flex-1 bg-primary text-black font-heading">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {initial?.id ? "Save Changes" : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}