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
    try {
      await syncLogosFromDB();
      const blob = await generateQuotePDF(quote);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quote-${quote.quote_number || "QUOTE"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (e, quote) => {
    e.stopPropagation();
    if (!quote.customer_email) {
      alert("No customer email on this quote. Please edit the quote to add one.");
      return;
    }
    setSendingId(quote.id);
    try {
      await generateAndUploadQuotePDF(quote, base44);
      await base44.functions.invoke("sendQuoteEmail", { quote_id: quote.id });
      await base44.entities.Quote.update(quote.id, { status: "sent" });
      load();
    } catch (error) {
      alert(error.response?.data?.error || error.message);
    } finally {
      setSendingId(null);
    }
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

  const newRequestCount = quotes.filter(q => q.status === "quote_request").length;

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
              {f.value === "quote_request" && newRequestCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {newRequestCount}
                </span>
              )}
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