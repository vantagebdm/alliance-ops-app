import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import SalesOrderForm from "../components/orders/SalesOrderForm";
import SalesOrderDetail from "../components/orders/SalesOrderDetail";
import moment from "moment";

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SalesOrder.list("-created_date", 100);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const columns = [
    {
      key: "priority", label: "", width: "w-8", sortable: false,
      render: (v) => v === "breakdown" ? <Zap className="w-4 h-4 text-red-500" /> :
        v === "urgent" ? <Zap className="w-4 h-4 text-amber-500" /> : null
    },
    { key: "order_number", label: "Order #", render: (v) => <span className="font-mono font-bold text-primary text-xs">{v || "—"}</span> },
    { key: "customer_name", label: "Customer", render: (v, row) => (
      <div>
        <div className="font-medium">{v}</div>
        {row.company && <div className="text-xs text-muted-foreground">{row.company}</div>}
      </div>
    )},
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "priority", label: "Priority", render: (v) => v && v !== "normal" ? <StatusBadge status={v} /> : <span className="text-muted-foreground text-xs">Normal</span> },
    { key: "total", label: "Total", render: (v) => <span className="font-semibold">${(v || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span> },
    { key: "delivery_method", label: "Delivery", render: (v) => <span className="text-xs capitalize">{(v || "").replace(/_/g, " ")}</span> },
    { key: "created_date", label: "Created", render: (v) => moment(v).format("DD/MM/YY") },
  ];

  const FILTERS = [
    { value: "all", label: `All (${orders.length})` },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "ready", label: "Ready" },
    { value: "dispatched", label: "Dispatched" },
    { value: "delivered", label: "Delivered" },
  ];

  return (
    <div>
      <PageHeader
        title="Sales Orders"
        subtitle="Customer orders, fulfilment and dispatch tracking"
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New Order
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${filter === f.value ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} onRowClick={setSelected} emptyMessage="No orders found." />
        )}
      </div>

      {showForm && (
        <SalesOrderForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}

      {editTarget && (
        <SalesOrderForm initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}

      {selected && !editTarget && (
        <SalesOrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { setSelected(null); load(); }}
          onEdit={() => { setEditTarget(selected); setSelected(null); }}
        />
      )}
    </div>
  );
}