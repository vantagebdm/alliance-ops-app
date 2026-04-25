import { useState } from "react";
import { Save, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TEMPLATES = [
  { id: "quote", label: "Quote Email" },
  { id: "order_confirm", label: "Sales Order Confirmation" },
  { id: "invoice", label: "Invoice Email" },
  { id: "overdue", label: "Overdue Invoice Reminder" },
  { id: "statement", label: "Customer Statement Email" },
  { id: "po_email", label: "Purchase Order Email" },
  { id: "remittance", label: "Supplier Remittance Email" },
  { id: "new_user", label: "New User Invite" },
  { id: "password_reset", label: "Password Reset" },
  { id: "payslip", label: "Payroll Payslip Email" },
  { id: "bas_reminder", label: "BAS Reminder" },
  { id: "credit_approved", label: "Credit Application Approved" },
  { id: "credit_declined", label: "Credit Application Declined" },
  { id: "supplier_approved", label: "Supplier Application Approved" },
  { id: "supplier_rejected", label: "Supplier Application Rejected" },
];

const MERGE_FIELDS = [
  "{{customer_name}}", "{{supplier_name}}", "{{contact_name}}", "{{document_number}}",
  "{{due_date}}", "{{amount_due}}", "{{company_name}}", "{{user_name}}",
  "{{payment_link}}", "{{branch_phone}}", "{{branch_email}}",
];

const DEFAULT_TEMPLATES = {
  quote: { subject: "Your Quote from {{company_name}} - {{document_number}}", body: "Dear {{contact_name}},\n\nPlease find your quote {{document_number}} attached.\n\nThis quote is valid for 30 days.\n\nKind regards,\n{{user_name}}", signature: "Alliance Priority Parts\n{{branch_phone}} | {{branch_email}}" },
  invoice: { subject: "Invoice {{document_number}} from {{company_name}}", body: "Dear {{contact_name}},\n\nPlease find invoice {{document_number}} attached.\n\nAmount Due: ${{amount_due}}\nDue Date: {{due_date}}\n\nKind regards,\n{{user_name}}", signature: "Alliance Priority Parts\n{{branch_phone}} | {{branch_email}}" },
};

const getDefault = (id) => DEFAULT_TEMPLATES[id] || { subject: `[${id}] from {{company_name}}`, body: "Dear {{contact_name}},\n\nPlease find the attached document.\n\nKind regards,\n{{user_name}}", signature: "Alliance Priority Parts\n{{branch_phone}} | {{branch_email}}" };

export default function EmailTemplates() {
  const [activeTemplate, setActiveTemplate] = useState("quote");
  const [templates, setTemplates] = useState(Object.fromEntries(TEMPLATES.map(t => [t.id, getDefault(t.id)])));
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = templates[activeTemplate];
  const update = (k) => (e) => setTemplates(t => ({ ...t, [activeTemplate]: { ...t[activeTemplate], [k]: e.target.value } }));
  const reset = () => setTemplates(t => ({ ...t, [activeTemplate]: getDefault(activeTemplate) }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const insertMerge = (field) => {
    setTemplates(t => ({ ...t, [activeTemplate]: { ...t[activeTemplate], body: t[activeTemplate].body + field } }));
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Email & Communication Templates</h2>
        <div className="flex gap-2">
          <Button onClick={() => setPreview(p => !p)} variant="outline" className="h-8 rounded-sm text-[10px] border-[hsl(0,0%,25%)] text-white/50 font-heading uppercase">
            <Eye className="w-3.5 h-3.5 mr-1" />{preview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={reset} variant="outline" className="h-8 rounded-sm text-[10px] border-[hsl(0,0%,25%)] text-white/50 font-heading uppercase">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />Reset
          </Button>
          <Button onClick={handleSave} className="h-8 bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Template selector */}
        <div className="w-48 flex-shrink-0 bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden overflow-y-auto max-h-[600px]">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setActiveTemplate(t.id)}
              className={`w-full text-left px-3 py-2.5 text-[10px] font-heading uppercase tracking-wider border-b border-[hsl(0,0%,14%)] last:border-0 transition-all ${activeTemplate === t.id ? "bg-primary/10 text-primary border-r-2 border-r-primary" : "text-white/40 hover:text-white/70 hover:bg-[hsl(0,0%,13%)]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 space-y-4">
          {preview ? (
            <div className="bg-white rounded-sm p-6 text-gray-800 text-sm min-h-[400px]">
              <div className="font-bold text-base mb-4 border-b pb-3">Subject: {current.subject}</div>
              <pre className="whitespace-pre-wrap font-sans">{current.body}</pre>
              <div className="mt-6 pt-4 border-t text-xs text-gray-500 whitespace-pre-wrap">{current.signature}</div>
            </div>
          ) : (
            <>
              <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Subject</label>
                  <Input value={current.subject} onChange={update("subject")} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Body</label>
                  <textarea value={current.body} onChange={update("body")} rows={10}
                    className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-3 py-2 resize-y focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Signature</label>
                  <textarea value={current.signature} onChange={update("signature")} rows={3}
                    className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
                <p className="text-[10px] font-heading uppercase text-white/30 mb-3">Merge Fields — click to insert into body</p>
                <div className="flex flex-wrap gap-2">
                  {MERGE_FIELDS.map(f => (
                    <button key={f} onClick={() => insertMerge(f)}
                      className="px-2 py-1 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-primary text-[10px] font-mono rounded-sm hover:border-primary transition-all">
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}