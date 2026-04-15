import { useState } from "react";
import { X, Upload, File, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const DOC_TYPES = [
  "Credit Application",
  "Purchase Order",
  "Contract",
  "Identification",
  "Compliance Document",
  "Insurance Certificate",
  "Trade Reference",
  "Other"
];

export default function CustomerDocumentUpload({ customer, onClose, onUploaded }) {
  const customerId = customer.id;
  const customerName = customer.name;
  const [docType, setDocType] = useState("Credit Application");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f && ["application/pdf", "image/jpeg", "image/png", "application/msword"].includes(f.type)) {
      setFile(f);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Save document reference to customer
      const docs = customer?.attachments || [];
      docs.push({
        doc_type: docType,
        filename: file.name,
        url: file_url,
        uploaded_by: (await base44.auth.me())?.email,
        upload_date: new Date().toISOString(),
        description,
        expiry_date: expiryDate || null
      });

      await base44.entities.Customer.update(customerId, { attachments: docs });
      setSuccess(true);
      setTimeout(() => {
        onUploaded?.();
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="bg-white rounded-sm p-8 max-w-sm text-center shadow-2xl">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-foreground mb-1">Document Uploaded</h3>
          <p className="text-sm text-muted-foreground">{docType} saved to {customerName}'s profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-sm max-w-md w-full mx-4 shadow-2xl">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Upload Document</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-foreground/60 mb-2">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border border-input rounded-sm px-3 py-2 text-sm"
            >
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-foreground/60 mb-2">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Q1 Insurance Cert"
              className="w-full border border-input rounded-sm px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-foreground/60 mb-2">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full border border-input rounded-sm px-3 py-2 text-sm"
            />
          </div>

          <div className="border-2 border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => document.getElementById("file-input").click()}>
            <File className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-heading uppercase tracking-wider text-foreground/60 mb-1">
              {file ? file.name : "Click to select file"}
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOC, JPG, PNG</p>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-sm font-heading text-xs uppercase tracking-wider">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 bg-primary hover:bg-primary/90 text-black rounded-sm font-heading text-xs uppercase tracking-wider"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}