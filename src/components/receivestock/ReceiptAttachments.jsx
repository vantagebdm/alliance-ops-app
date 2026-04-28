import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, FileText, Trash2, Download } from "lucide-react";

const DOC_TYPES = [
  { value: "supplier_invoice", label: "Supplier Invoice" },
  { value: "packing_slip", label: "Packing Slip" },
  { value: "freight_docket", label: "Freight Docket" },
  { value: "delivery_photo", label: "Delivery Photo" },
  { value: "damage_photo", label: "Damage Photo" },
  { value: "other", label: "Other" },
];

export default function ReceiptAttachments({ attachments, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("packing_slip");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange([
      ...attachments,
      {
        _id: Math.random().toString(36).slice(2),
        doc_type: docType,
        filename: file.name,
        url: file_url,
        upload_date: new Date().toISOString().slice(0, 10),
        uploaded_by: "Current User",
      },
    ]);
    setUploading(false);
    e.target.value = "";
  };

  const remove = (idx) => onChange(attachments.filter((_, i) => i !== idx));

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="font-heading text-base font-bold uppercase tracking-wider mb-1">Attachments & Documents</h2>
        <p className="text-xs text-muted-foreground">Attach supplier invoices, packing slips, photos and supporting documents. <span className="text-primary font-semibold">Attachments are optional</span> — you can post the receipt without uploading any documents.</p>
      </div>

      {/* Upload */}
      <div className="flex items-center gap-3">
        <select
          value={docType}
          onChange={e => setDocType(e.target.value)}
          className="flex h-8 rounded-sm border border-input bg-transparent px-3 py-1 text-sm"
        >
          {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <label className={`flex items-center gap-2 h-8 px-4 rounded-sm text-xs font-heading font-bold uppercase tracking-wider cursor-pointer transition-colors ${
          uploading ? "bg-muted text-muted-foreground" : "bg-primary text-black hover:bg-primary/90"
        }`}>
          <Upload className="w-3.5 h-3.5" />
          {uploading ? "Uploading..." : "Upload File"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {attachments.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm p-8 text-center text-muted-foreground text-sm">
          No attachments yet. Upload documents above.
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(0,0%,8%)] text-white">
              <tr>
                {["Type", "Filename", "Upload Date", ""].map(h => (
                  <th key={h} className="font-heading text-[10px] uppercase tracking-wider px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attachments.map((att, idx) => (
                <tr key={att._id} className={`border-b border-border ${idx % 2 === 0 ? "bg-[hsl(0,0%,11%)]" : "bg-muted/10"}`}>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 bg-muted rounded-sm text-[10px] font-heading uppercase tracking-wider">
                      {DOC_TYPES.find(d => d.value === att.doc_type)?.label || att.doc_type}
                    </span>
                  </td>
                  <td className="px-3 py-2 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {att.filename}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{att.upload_date}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button type="button" onClick={() => remove(idx)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}