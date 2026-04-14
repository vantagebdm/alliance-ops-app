import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import DispatchForm from "@/components/dispatch/DispatchForm";
import moment from "moment";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "ready_to_pick", label: "Ready to Pick" },
  { value: "picked", label: "Picked" },
  { value: "packed", label: "Packed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "collected", label: "Collected" },
  { value: "partial", label: "Partial" },
  { value: "urgent", label: "🔴 Urgent" },
];

const METHOD_LABELS = {
  pickup: "Pickup",
  local_delivery: "Local Delivery",
  freight: "Freight",
  remote_site: "Remote Site",
  internal_transfer: "Internal Transfer",
};

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    base44.entities.Dispatch.list("-created_date", 200).then(d => {
      setDispatches(d);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all"
    ? dispatches
    : filter === "urgent"
    ? dispatches.filter(d => d.priority === "urgent" || d.priority === "breakdown_critical")
    : dispatches.filter(d => d.status === filter);

  const columns = [
    { key: "dispatch_number", label: "Dispatch #", render: (v) => <span className="font-mono font-semibold text-primary">{v || "—"}</span> },
    { key: "order_number", label: "Order #", render: v => <span className="font-mono">{v || "—"}</span> },
    { key: "customer_name", label: "Customer" },
    { key: "method", label: "Method", render: (v) => <span className="text-xs uppercase text-muted-foreground">{METHOD_LABELS[v] || v || "—"}</span> },
    { key: "priority", label: "Priority", render: (v) => {
      const styles = { breakdown_critical: "text-red-400 font-bold animate-pulse", urgent: "text-amber-400 font-bold", same_day: "text-yellow-400", standard: "text-muted-foreground" };
      return <span className={`text-xs font-heading uppercase tracking-wider ${styles[v] || ""}`}>{(v || "").replace("_", " ")}</span>;
    }},
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "dispatch_date", label: "Date", render: (v) => v ? moment(v).format("DD/MM/YY") : "—" },
    { key: "items", label: "Lines", render: (v) => <span className="text-xs text-muted-foreground">{(v || []).length}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Dispatch"
        subtitle="Manage outgoing shipments"
        actions={
          <Button onClick={() => setShowForm(true)}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New Dispatch
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors whitespace-nowrap
                ${filter === f.value ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No dispatches found." />
        )}
      </div>

      {showForm && (
        <DispatchForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}