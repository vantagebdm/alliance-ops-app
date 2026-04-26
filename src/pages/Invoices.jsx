import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter, Send, X } from "lucide-react";
import { generateAndUploadInvoicePDF, buildInvoiceEmailBody } from "@/lib/invoicePdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import QuickInvoiceForm from "@/components/QuickAdd/forms/QuickInvoiceForm";

function ResendModal({ invoice, onClose }) {
  const [email, setEmail] = useState(invoice.billing_email || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!email) return alert("Please enter an email address.");
    setSending(true);
    const pdfUrl = await generateAndUploadInvoicePDF(invoice, base44);
    const emailBody = buildInvoiceEmailBody(invoice, pdfUrl);
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Invoice ${invoice.invoice_number} — ${invoice.customer_name}`,
      body: emailBody,
    });
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[hsl(0,0%,10%)] w-full max-w-md rounded-sm shadow-2xl border border-border">
        <div className="bg-[hsl(0,0%,6%)] px-5 py-4 flex items-center justify-between rounded-t-sm border-b border-border">
          <div>
            <h2 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Resend Invoice</h2>
            <p className="text-white/40 text-xs mt-0.5 font-mono">{invoice.invoice_number} — {invoice.customer_name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {sent ? (
            <div className="text-center py-4 text-primary font-heading font-semibold uppercase tracking-wider text-sm">✓ Invoice Sent!</div>
          ) : (
            <>
              <div>
                <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1 block">Send To Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="rounded-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
                <Button size="sm" onClick={send} disabled={sending} className="rounded-sm font-heading text-xs uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700">
                  <Send className="w-3 h-3 mr-1.5" />
                  {sending ? "Sending..." : "Send Invoice"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [resendInvoice, setResendInvoice] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    return base44.entities.Invoice.list("-created_date", 100).then(d => {
      setInvoices(d);
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? invoices : invoices.filter(inv => inv.status === filter);

  const columns = [
    { key: "invoice_number", label: "Invoice #", render: (v) => <span className="font-mono font-semibold">{v || "—"}</span> },
    { key: "customer_name", label: "Customer" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "total", label: "Total", render: (v) => `$${(v || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}` },
    { key: "due_date", label: "Due Date", render: (v) => v ? moment(v).format("DD/MM/YY") : "—" },
    { key: "payment_method", label: "Payment", render: (v) => <span className="text-xs uppercase">{(v || "").replace("_", " ")}</span> },
    { key: "created_date", label: "Created", render: (v) => moment(v).format("DD/MM/YY") },
    {
      key: "_resend", label: "", render: (_, row) => (
        <button
          onClick={e => { e.stopPropagation(); setResendInvoice(row); }}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-heading font-semibold uppercase tracking-wider rounded-sm border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors"
        >
          <Send className="w-3 h-3" /> Resend
        </button>
      )
    },
  ];

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Manage billing and invoices"
        actions={
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New Invoice
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${filter === f.value ? "bg-primary text-black" : "bg-[hsl(0,0%,14%)] text-white/50 hover:text-white hover:bg-[hsl(0,0%,18%)]"}`}>
              {f.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/invoices/${row.id}`)} emptyMessage="No invoices found." />
        )}
      </div>

      {resendInvoice && (
        <ResendModal invoice={resendInvoice} onClose={() => setResendInvoice(null)} />
      )}

      {showForm && (
        <QuickInvoiceForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}