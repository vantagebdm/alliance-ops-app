import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter, Eye, Edit3, Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import QuoteForm from "../components/quotes/QuoteForm";
import QuoteDetail from "../components/quotes/QuoteDetail";
import moment from "moment";
import { generateQuotePDF, generateAndUploadQuotePDF } from "@/lib/documentPdf";
import { syncLogosFromDB } from "@/lib/companyLogos";
import { getCompanyProfile } from "@/lib/companyDetails";

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPDF = async (e, quote) => {
    e.stopPropagation();
    setDownloadingId(quote.id);
    await syncLogosFromDB();
    // Enrich items with app_part_number for legacy quotes
    let enrichedQuote = quote;
    const needsLookup = (quote.items || []).some(i => !i.app_part_number && i.part_number);
    if (needsLookup) {
      const parts = await base44.entities.Part.list(null, 1000);
      const enrichedItems = (quote.items || []).map(item => {
        if (item.app_part_number) return item;
        const match = parts.find(p => p.part_number === item.part_number || p.supplier_sku === item.part_number);
        return match ? { ...item, app_part_number: match.app_part_number || item.part_number } : item;
      });
      enrichedQuote = { ...quote, items: enrichedItems };
    }
    const blob = generateQuotePDF(enrichedQuote);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quote-${quote.quote_number || "QUOTE"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadingId(null);
  };

  const handleSendEmail = async (e, quote) => {
    e.stopPropagation();
    if (!quote.customer_email) {
      alert("No customer email on this quote. Please edit the quote to add one.");
      return;
    }
    setSendingId(quote.id);
    const pdfUrl = await generateAndUploadQuotePDF(quote, base44);
    const company = getCompanyProfile();
    const body = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#111;padding:0;border-radius:6px;border:1px solid #e0e0e0;">
  <div style="background:#000;padding:24px 28px;border-radius:6px 6px 0 0;">
    <h2 style="color:#fff;font-size:22px;margin:0 0 4px 0;">QUOTATION</h2>
    <p style="color:#ccc;margin:0;">Quote #${quote.quote_number || ""}</p>
  </div>
  <div style="padding:24px 28px;">
    <p>Dear ${quote.customer_name || "Customer"},</p>
    <p>Please find your quotation attached. This quote is valid until <strong>${quote.valid_until ? moment(quote.valid_until).format("DD MMM YYYY") : "—"}</strong>.</p>
    <table style="width:100%;font-size:14px;margin:16px 0;border-collapse:collapse;">
      <tr><td style="color:#666;padding:5px 0;width:140px;">Quote #:</td><td style="color:#111;font-weight:bold;">${quote.quote_number || ""}</td></tr>
      <tr><td style="color:#666;padding:5px 0;">Total:</td><td style="color:#111;font-weight:bold;font-size:18px;">$${Number(quote.total || 0).toFixed(2)}</td></tr>
    </table>
    <p style="font-size:11px;color:#aaa;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
      ${company.trading_name || company.legal_name} | ABN: ${company.abn}<br/>
      ${company.phone} | ${company.email}
    </p>
  </div>
</div>`;
    await base44.integrations.Core.SendEmail({
      to: quote.customer_email,
      subject: `Quotation ${quote.quote_number || ""} from ${company.trading_name || company.legal_name}`,
      body,
    });
    await base44.entities.Quote.update(quote.id, { status: "sent" });
    setSendingId(null);
    load();
  };

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Quote.list("-created_date", 100);
    setQuotes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? quotes : quotes.filter(q => q.status === filter);

  const columns = [
    { key: "quote_number", label: "Quote #", render: (v) => <span className="font-mono font-bold text-primary text-xs">{v || "—"}</span> },
    { key: "customer_name", label: "Customer", render: (v, row) => (
      <div>
        <div className="font-medium text-white">{v}</div>
        {row.company && <div className="text-xs text-white/40">{row.company}</div>}
      </div>
    )},
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "total", label: "Total", render: (v) => <span className="font-semibold text-white">${(v || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span> },
    { key: "valid_until", label: "Expires", render: (v) => {
      if (!v) return <span className="text-white/30">—</span>;
      const expired = moment(v).isBefore(moment());
      return <span className={expired ? "text-red-400 font-semibold" : "text-white/80"}>{moment(v).format("DD/MM/YY")}</span>;
    }},
    { key: "created_date", label: "Created", render: (v) => <span className="text-white/80">{moment(v).format("DD/MM/YY")}</span> },
    { key: "items", label: "Lines", render: (v) => <span className="text-white/40 text-xs">{(v || []).length} items</span> },
    { key: "id", label: "", render: (v, row) => (
      <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); setSelected(row); }}
          title="View"
          className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setEditTarget(row); }}
          title="Edit"
          className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => handleSendEmail(e, row)}
          title="Send Email"
          disabled={sendingId === row.id}
          className="p-1.5 rounded-sm text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-40"
        >
          <Mail className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => handleDownloadPDF(e, row)}
          title="Download PDF"
          disabled={downloadingId === row.id}
          className="p-1.5 rounded-sm text-white/40 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    )},
  ];

  const FILTERS = [
    { value: "all", label: `All (${quotes.length})` },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
    { value: "quote_request", label: `New Quote Requests` },
  ];

  return (
    <div>
      <PageHeader
        title="Quotes"
        subtitle="Customer quotations and quote management"
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New Quote
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
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} onRowClick={setSelected} emptyMessage="No quotes found." />
        )}
      </div>

      {showForm && (
        <QuoteForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}

      {editTarget && (
        <QuoteForm initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}

      {selected && !editTarget && (
        <QuoteDetail
          quote={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { setSelected(null); load(); }}
          onEdit={() => { setEditTarget(selected); setSelected(null); }}
        />
      )}
    </div>
  );
}