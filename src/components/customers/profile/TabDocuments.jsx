import { FileText, Download, Eye } from "lucide-react";
import { SectionTitle } from "./ProfileField";
import moment from "moment";

export default function TabDocuments({ customer }) {
  const docs = [];

  if (customer.pdf_attachment_url) {
    docs.push({
      name: "Credit Application PDF",
      type: "Credit Application",
      url: customer.pdf_attachment_url,
      date: customer.created_date,
      source: customer.created_by_method === "pdf_extraction" ? "PDF Extraction" : "Manual Upload",
    });
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Documents & Attachments</SectionTitle>
      {docs.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm p-8 text-center text-muted-foreground/50 text-xs font-heading uppercase tracking-wider">
          No documents uploaded
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
          {docs.map((doc, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/10 rounded-sm flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground">{doc.type}</span>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span className="text-[10px] text-muted-foreground">{moment(doc.date).format("DD/MM/YYYY")}</span>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span className="text-[10px] text-primary">{doc.source}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-heading uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border px-2 py-1 rounded-sm hover:bg-muted/50 transition-colors">
                  <Eye className="w-3 h-3" /> View
                </a>
                <a href={doc.url} download
                  className="flex items-center gap-1 text-xs font-heading uppercase tracking-wider text-primary hover:text-primary/80 border border-primary/30 px-2 py-1 rounded-sm hover:bg-primary/10 transition-colors">
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}