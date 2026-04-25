import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import POForm from "../components/purchasing/POForm";
import moment from "moment";

export default function Purchasing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PurchaseOrder.list("-created_date", 100);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const overdue = orders.filter(o =>
    o.expected_date && moment(o.expected_date).isBefore(moment()) && !["received", "cancelled"].includes(o.status)
  );

  const columns = [
    { key: "po_number", label: "PO #", render: (v) => <span className="font-mono font-bold text-primary text-xs">{v || "—"}</span> },
    { key: "supplier_name", label: "Supplier", render: (v) => <span className="font-medium">{v}</span> },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "total", label: "Total", render: (v) => <span className="font-semibold">${(v || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span> },
    { key: "items", label: "Lines", render: (v) => <span className="text-white/40 text-xs">{(v || []).length} items</span> },
    { key: "expected_date", label: "Expected", render: (v) => {
      if (!v) return <span className="text-white/30">—</span>;
      const late = moment(v).isBefore(moment());
      return <span className={late ? "text-red-400 font-semibold" : "text-white/80"}>{moment(v).format("DD/MM/YY")}</span>;
    }},
    { key: "created_date", label: "Created", render: (v) => moment(v).format("DD/MM/YY") },
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