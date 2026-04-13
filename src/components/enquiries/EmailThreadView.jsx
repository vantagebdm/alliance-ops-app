import { Download, Mail } from "lucide-react";

export default function EmailThreadView({ enquiry }) {
  if (!enquiry.email_body) return null;

  return (
    <div className="space-y-4">
      {/* Email Header */}
      <div className="bg-[hsl(0,0%,96%)] p-4 rounded-sm border border-border">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">
              {enquiry.email_sender_name}
            </h3>
            <p className="text-xs text-muted-foreground">{enquiry.email_sender_address}</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(enquiry.created_date).toLocaleDateString()}
          </span>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold text-foreground/60 mb-2">SUBJECT</p>
          <h4 className="font-heading text-base font-bold text-foreground">{enquiry.email_subject}</h4>
        </div>
      </div>

      {/* Email Body */}
      <div className="bg-white border border-border p-4 rounded-sm">
        <div className="prose prose-sm max-w-none text-sm text-foreground whitespace-pre-wrap">
          {enquiry.email_body}
        </div>
      </div>

      {/* Attachments */}
      {enquiry.attachments && enquiry.attachments.length > 0 && (
        <div className="bg-white border border-border p-4 rounded-sm">
          <h4 className="font-heading text-xs uppercase tracking-wider text-foreground/60 mb-3">
            Attachments ({enquiry.attachments.length})
          </h4>
          <div className="space-y-2">
            {enquiry.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/20 rounded-sm">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{att.filename}</p>
                  <p className="text-[10px] text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</p>
                </div>
                <button className="text-primary hover:text-primary/80 flex-shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}