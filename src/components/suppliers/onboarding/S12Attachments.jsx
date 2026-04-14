import { useState } from "react";
import SupplierSectionHeader from "./SuplierSectionHeader";
import { FSelect } from "./SupplierField";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, FileText, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DOC_TYPES } from "./SupplierFormShared";

export default function S12Attachments({ form, update }) {
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("Supplier Price List");
  const attachments = form.attachments || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newAtt = {
      doc_type: docType,
      filename: file.name,
      url: file_url,
      upload_date: new Date().toLocaleDateString("en-AU"),
      uploaded_by: "Current User"
    };
    update("attachments", [...attachments, newAtt]);
    setUploading(false);
    e.target.value = "";
  };

  const remove = (i) => {
    const arr = [...attachments];
    arr.splice(i, 1);
    update("attachments", arr);
  };

  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Attachments & Files" subtitle="Upload price lists, trading terms, catalogues and other supplier documents." />

      <div className="flex items-end gap-3">
        <FSelect label="Document Type" className="flex-1" value={docType} onChange={setDocType} options={DOC_TYPES} />
        <label className="cursor-pointer">
          <Button type="button" variant="outline" size="sm" disabled={uploading} className="rounded-sm font-heading text-[10px] uppercase tracking-wider" asChild>
            <span><Upload className="w-3 h-3 mr-1" />{uploading ? "Uploading..." : "Upload File"}</span>
          </Button>
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.xlsx,.xls,.csv,.doc,.docx" />
        </label>
      </div>

      {attachments.length > 0 ? (
        <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-card hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{att.filename}</p>
                  <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">{att.doc_type} · {att.upload_date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={att.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-sm p-6 text-center text-muted-foreground/50 text-xs font-heading uppercase tracking-wider">
          No documents uploaded yet
        </div>
      )}
    </div>
  );
}