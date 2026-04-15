import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import QuickInvoiceForm from "@/components/QuickAdd/forms/QuickInvoiceForm";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
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
              className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${filter === f.value ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
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

      {showForm && (
        <QuickInvoiceForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}