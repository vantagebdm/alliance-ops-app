import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import QuoteForm from "../components/quotes/QuoteForm";
import QuoteDetail from "../components/quotes/QuoteDetail";
import moment from "moment";

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

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
  ];

  const FILTERS = [
    { value: "all", label: `All (${quotes.length})` },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
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