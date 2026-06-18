import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import POForm from "../components/purchasing/POForm";
import { generateAndUploadPurchaseOrderPDF } from "@/lib/documentPdf";
import moment from "moment";

export default function Purchasing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [generatingPdf, setGeneratingPdf] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PurchaseOrder.list("-created_date");
    setOrders(data);
    setLoading(false);
  };

  const handlePrintPO = async (po) => {
    setGeneratingPdf(po.id);
    try {
      const url = await generateAndUploadPurchaseOrderPDF(po, base44);
      window.open(url, "_blank");
    } catch (err) {
      alert("Error generating PDF: " + err.message);
    } finally {
      setGeneratingPdf(null);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const overdue = orders.filter(o =>
    o.expected_date && moment(o.expected_date).isBefore(moment()) && !["received", "cancelled"].includes(o.status)
  );

  const PO_STATUS_CYCLE = ["draft", "sent", "confirmed", "partial", "received", "cancelled"];
const PO_STATUS_COLORS = {
  draft: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  confirmed: "bg-primary/20 text-primary border-primary/40",
  partial: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  received: "bg-green-500/20 text-green-400 border-green-500/40",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/40",
};

function POStatusButton({ po, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const current = po.status || "draft";

  const setStatus = async (status) => {
    setOpen(false);
    setSaving(true);
    await base44.entities.PurchaseOrder.update(po.id, { status });
    setSaving(false);
    onUpdated();
  };

  const color = PO_STATUS_COLORS[current] || PO_STATUS_COLORS.draft;

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`px-2.5 py-1 text-[10px] font-heading font-bold uppercase tracking-wider rounded-sm border transition-colors ${color} hover:opacity-80`}
      >
        {saving ? "..." : current}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-[hsl(0,0%,15%)] border border-border rounded-sm shadow-xl overflow-hidden min-w-[110px]">
            {PO_STATUS_CYCLE.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`w-full text-left px-3 py-1.5 text-[11px] font-heading uppercase tracking-wider transition-colors hover:bg-primary/10 ${s === current ? "text-primary" : "text-white/60"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const columns = [
    { key: "po_number", label: "PO #", render: (v) => <span className="font-mono font-bold text-primary text-xs">{v || "—"}</span> },
    { key: "supplier_name", label: "Supplier", render: (v) => <span className="font-medium">{v}</span> },
    { key: "status", label: "Status", render: (v, row) => <POStatusButton po={row} onUpdated={load} /> },
    { key: "total", label: "Total", render: (v) => <span className="font-semibold">${(v || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span> },
    { key: "items", label: "Lines", render: (v) => <span className="text-white/40 text-xs">{(v || []).length} items</span> },
    { key: "expected_date", label: "Expected", render: (v) => {
      if (!v) return <span className="text-white/30">—</span>;
      const late = moment(v).isBefore(moment());
      return <span className={late ? "text-red-400 font-semibold" : "text-white/80"}>{moment(v).format("DD/MM/YY")}</span>;
    }},
    { key: "created_date", label: "Created", render: (v) => moment(v).format("DD/MM/YY") },
    { key: "id", label: "", render: (v, row) => (
      <button
        onClick={(e) => { e.stopPropagation(); handlePrintPO(row); }}
        disabled={generatingPdf === v}
        className="text-muted-foreground hover:text-primary transition-colors"
        title="Download PDF"
      >
        {generatingPdf === v ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
      </button>
    )},
  ];

  const FILTERS = [
    { value: "all", label: `All (${orders.length})` },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "confirmed", label: "Confirmed" },
    { value: "partial", label: "Partial" },
    { value: "received", label: "Received" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      <PageHeader
        title="Purchasing"
        subtitle="Purchase orders and supplier procurement"
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New PO
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        {overdue.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3 flex items-center gap-2">
            <span className="text-red-400 font-heading text-xs uppercase tracking-wider font-semibold">
              ⚠ {overdue.length} purchase order{overdue.length > 1 ? "s are" : " is"} overdue for delivery
            </span>
          </div>
        )}
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
          <DataTable columns={columns} data={filtered}
            onRowClick={(row) => setEditTarget(row)}
            emptyMessage="No purchase orders found." />
        )}
      </div>

      {(showForm || editTarget) && (
        <POForm
          initial={editTarget || undefined}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { setShowForm(false); setEditTarget(null); load(); }}
        />
      )}
    </div>
  );
}