import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter, Zap, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import SalesOrderForm from "../components/orders/SalesOrderForm";
import SalesOrderDetail from "../components/orders/SalesOrderDetail";
import InvoiceFromOrderModal from "../components/orders/InvoiceFromOrderModal";
import moment from "moment";

const INVOICE_STATUS_STYLES = {
  fully_invoiced: "bg-green-500/10 text-green-400 border-green-500/30",
  partially_invoiced: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  not_invoiced: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};
const INVOICE_STATUS_LABELS = {
  fully_invoiced: "Fully Invoiced",
  partially_invoiced: "Partial",
  not_invoiced: "Not Invoiced",
};
const INVOICEABLE = ["confirmed","processing","ready","dispatched","delivered"];

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [invoiceTarget, setInvoiceTarget] = useState(null);

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
        <div className="font-medium text-white">{v}</div>
        {row.company && <div className="text-xs text-white/40">{row.company}</div>}
      </div>
    )},
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "priority", label: "Priority", render: (v) => v && v !== "normal" ? <StatusBadge status={v} /> : <span className="text-white/40 text-xs">Normal</span> },
    { key: "total", label: "Total", render: (v) => <span className="font-semibold">${(v || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span> },
    { key: "delivery_method", label: "Delivery", render: (v) => <span className="text-xs capitalize">{(v || "").replace(/_/g, " ")}</span> },
    { key: "created_date", label: "Created", render: (v) => moment(v).format("DD/MM/YY") },
    {
      key: "invoice_status", label: "Invoice", sortable: false,
      render: (v, row) => {
        const status = v || "not_invoiced";
        return (
          <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-heading font-semibold uppercase tracking-wider ${INVOICE_STATUS_STYLES[status] || INVOICE_STATUS_STYLES.not_invoiced}`}>
            {INVOICE_STATUS_LABELS[status] || "Not Invoiced"}
          </span>
        );
      }
    },
    {
      key: "id", label: "", sortable: false, width: "w-10",
      render: (v, row) => INVOICEABLE.includes(row.status) && row.invoice_status !== "fully_invoiced" ? (
        <button
          onClick={(e) => { e.stopPropagation(); setInvoiceTarget(row); }}
          title="Create Invoice"
          className="p-1.5 rounded-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors"
        >
          <Receipt className="w-3.5 h-3.5" />
        </button>
      ) : null
    },
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
              className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${filter === f.value ? "bg-primary text-black" : "bg-[hsl(0,0%,14%)] text-white/50 hover:text-white hover:bg-[hsl(0,0%,18%)]"}`}>
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

      {selected && !editTarget && !invoiceTarget && (
        <SalesOrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { setSelected(null); load(); }}
          onEdit={() => { setEditTarget(selected); setSelected(null); }}
          onCreateInvoice={(order) => { setSelected(null); setInvoiceTarget(order); }}
        />
      )}

      {invoiceTarget && (
        <InvoiceFromOrderModal
          order={invoiceTarget}
          onClose={() => setInvoiceTarget(null)}
          onSaved={() => { setInvoiceTarget(null); load(); }}
        />
      )}
    </div>
  );
}