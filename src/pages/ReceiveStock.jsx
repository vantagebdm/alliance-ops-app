import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Eye, Package, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ReceiveStockForm from "@/components/receivestock/ReceiveStockForm";
import moment from "moment";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-white/10 text-white/50" },
  in_progress: { label: "In Progress", color: "bg-blue-500/15 text-blue-400" },
  posted: { label: "Posted", color: "bg-green-500/15 text-green-400" },
  partially_received: { label: "Partial", color: "bg-amber-500/15 text-amber-400" },
  fully_received: { label: "Fully Received", color: "bg-green-500/15 text-green-400" },
  variance_review: { label: "Variance Review", color: "bg-orange-500/15 text-orange-400" },
  quarantined: { label: "Quarantined", color: "bg-red-500/15 text-red-400" },
  cancelled: { label: "Cancelled", color: "bg-white/5 text-white/30 line-through" },
};

const RECEIPT_TYPE_LABELS = {
  po_receipt: "PO Receipt",
  manual: "Manual",
  supplier_return_replacement: "Supplier Return",
  transfer_in: "Transfer In",
  warranty_replacement: "Warranty Repl.",
};

export default function ReceiveStock() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.GoodsReceipt.list("-created_date", 100);
    setReceipts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = receipts.filter(r => {
    const q = search.toLowerCase();
    return !q || r.gr_number?.toLowerCase().includes(q) || r.supplier_name?.toLowerCase().includes(q) || r.po_number?.toLowerCase().includes(q);
  });

  const stats = {
    total: receipts.length,
    draft: receipts.filter(r => r.status === "draft").length,
    posted: receipts.filter(r => ["posted", "fully_received"].includes(r.status)).length,
    variance: receipts.filter(r => r.status === "variance_review").length,
  };

  if (selected) {
    return (
      <div className="p-6">
        <button
          onClick={() => setSelected(null)}
          className="text-xs text-white/40 hover:text-white mb-4 flex items-center gap-1 font-heading uppercase tracking-wider"
        >
          ← Back to Goods Receipts
        </button>
        <div className="space-y-6">
          {/* Receipt detail header */}
          <div className="bg-[hsl(0,0%,8%)] rounded-sm px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold uppercase tracking-wider">{selected.gr_number}</h1>
                <p className="text-white/50 text-sm mt-1">{selected.supplier_name} · {selected.receipt_date}</p>
              </div>
              <span className={`px-3 py-1 rounded-sm text-[10px] font-heading font-bold uppercase tracking-wider ${STATUS_CONFIG[selected.status]?.color || "bg-muted"}`}>
                {STATUS_CONFIG[selected.status]?.label || selected.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              {[
                { label: "PO Number", value: selected.po_number || "—" },
                { label: "Invoice #", value: selected.supplier_invoice_number || "—" },
                { label: "Receipt Type", value: RECEIPT_TYPE_LABELS[selected.receipt_type] || selected.receipt_type },
                { label: "Received By", value: selected.received_by || "—" },
                { label: "Warehouse", value: selected.warehouse || "—" },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-white/30 text-[9px] font-heading uppercase tracking-wider">{f.label}</div>
                  <div className="text-white text-sm font-semibold mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lines table */}
          {selected.lines?.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider mb-3">Receipt Lines</h2>
              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[hsl(0,0%,8%)] text-white">
                    <tr>
                      {["Part #", "Description", "Ordered", "Received", "Unit Cost", "Landed Cost", "Location", "Condition", "Status"].map(h => (
                        <th key={h} className="font-heading text-[10px] uppercase tracking-wider px-3 py-2 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines.map((l, i) => (
                      <tr key={i} className={`border-b border-[hsl(0,0%,16%)] ${i % 2 === 0 ? "bg-[hsl(0,0%,10%)]" : "bg-[hsl(0,0%,12%)]"}`}>
                        <td className="px-3 py-2 font-heading font-bold text-white">{l.part_number}</td>
                        <td className="px-3 py-2 text-white/40">{l.description}</td>
                        <td className="px-3 py-2 text-center">{l.ordered_qty || "—"}</td>
                        <td className="px-3 py-2 text-center font-bold text-primary">{l.qty_received_now || 0}</td>
                        <td className="px-3 py-2 text-white/80">${(l.unit_cost || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 font-bold text-white">${(l.landed_cost || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-white/40">{[l.warehouse, l.bin].filter(Boolean).join(" / ") || "—"}</td>
                        <td className="px-3 py-2 capitalize text-white/70">{l.condition?.replace("_", " ") || "Good"}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded-sm text-[10px] font-heading font-bold uppercase bg-white/10 text-white/50 capitalize">
                            {l.line_status || "open"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Variances */}
          {selected.variances?.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider mb-3">Variances & Exceptions</h2>
              <div className="border border-amber-500/30 rounded-sm overflow-hidden">
                {selected.variances.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 last:border-0">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-white/80">
                      <span className="font-bold text-white">{v.part_number}</span> — {v.variance_type?.replace("_", " ")} · {v.variance_note}
                      <span className="ml-2 text-xs text-white/40 capitalize">[{v.action_taken?.replace("_", " ")}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {selected.attachments?.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider mb-3">Attachments</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selected.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[hsl(0,0%,20%)] bg-[hsl(0,0%,11%)] rounded-sm p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <div className="text-xs font-heading font-bold uppercase tracking-wider text-white/30">{att.doc_type?.replace("_", " ")}</div>
                    <div className="text-sm mt-1 truncate text-white">{att.filename}</div>
                    <div className="text-xs text-white/30 mt-1">{att.upload_date}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Activity log */}
          {selected.activity_log?.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider mb-3">Activity Log</h2>
              <div className="space-y-2">
                {selected.activity_log.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-white/30 text-xs">{moment(entry.timestamp).format("DD MMM YYYY HH:mm")}</span>
                      <span className="ml-2 font-semibold text-white">{entry.action}</span>
                      {entry.detail && <span className="ml-2 text-white/40">{entry.detail}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Goods Receipts"
        subtitle={`${stats.total} receipts · ${stats.draft} drafts · ${stats.variance} variance review`}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 h-9 px-4 bg-primary text-black font-heading font-bold uppercase text-xs tracking-wider rounded-sm hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> Receive Stock
          </button>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Receipts", value: stats.total, icon: Package, color: "text-white" },
            { label: "Drafts", value: stats.draft, icon: Clock, color: "text-white/50" },
            { label: "Posted", value: stats.posted, icon: CheckCircle2, color: "text-green-400" },
            { label: "Variance Review", value: stats.variance, icon: AlertTriangle, color: "text-amber-400" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <div>
                  <div className={`font-heading text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] font-heading uppercase tracking-wider text-white/30">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by GR number, supplier, PO..."
            className="w-full h-9 pl-9 pr-3 border border-[hsl(0,0%,20%)] rounded-sm text-sm bg-transparent text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-white/30">Loading goods receipts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[hsl(0,0%,22%)] rounded-sm">
            <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="font-heading text-sm font-bold uppercase tracking-wider text-white/30">No goods receipts found</p>
            <p className="text-xs text-white/20 mt-1">Create your first receipt using the "Receive Stock" button above.</p>
          </div>
        ) : (
          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(0,0%,8%)] text-white">
                <tr>
                  {["GR Number", "Date", "Supplier", "Type", "PO #", "Lines", "Total", "Status", ""].map(h => (
                    <th key={h} className="font-heading text-[10px] uppercase tracking-wider px-3 py-2.5 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={r.id} className={`border-b border-[hsl(0,0%,16%)] hover:bg-[hsl(0,0%,14%)] transition-colors ${i % 2 === 0 ? "bg-[hsl(0,0%,10%)]" : "bg-[hsl(0,0%,12%)]"}`}>
                      <td className="px-3 py-2.5 font-heading font-bold text-primary">{r.gr_number || "DRAFT"}</td>
                      <td className="px-3 py-2.5 text-white/40">{r.receipt_date || "—"}</td>
                      <td className="px-3 py-2.5 font-semibold text-white">{r.supplier_name}</td>
                      <td className="px-3 py-2.5 text-xs text-white/60">{RECEIPT_TYPE_LABELS[r.receipt_type] || r.receipt_type}</td>
                      <td className="px-3 py-2.5 text-white/40">{r.po_number || "—"}</td>
                      <td className="px-3 py-2.5 text-center">{(r.lines || []).filter(l => l.qty_received_now > 0).length}</td>
                      <td className="px-3 py-2.5 font-bold text-white">${(r.receipt_total || 0).toFixed(2)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading font-bold uppercase ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setSelected(r)}
                          className="text-white/30 hover:text-primary transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ReceiveStockForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}