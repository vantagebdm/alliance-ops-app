import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import CustomerOnboardingForm from "../components/customers/CustomerOnboardingForm";
import CustomerDetail from "../components/customers/CustomerDetail";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Customer.list("-created_date", 200);
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = search
    ? customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()))
    : customers;

  const columns = [
    { key: "name", label: "Contact Name", render: (v) => <span className="font-semibold">{v}</span> },
    { key: "company", label: "Company" },
    { key: "type", label: "Type", render: (v) => <span className="text-xs uppercase">{(v || "").replace("_", " ")}</span> },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "city", label: "City" },
    { key: "payment_terms", label: "Terms", render: (v) => <span className="text-xs">{(v || "").replace("_", " ")}</span> },
    { key: "total_orders", label: "Orders", render: (v) => v || 0 },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customers registered`}
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Customer
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="pl-9 rounded-sm" />
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No customers found." onRowClick={row => setSelected(row)} />
        )}
      </div>
      {showForm && (
        <CustomerOnboardingForm
          onClose={() => setShowForm(false)}
          onSaved={async (saved, opts) => {
            setShowForm(false);
            load();
            
            // Trigger external risk assessment if credit review task was requested
            if (opts?.createTask && saved?.id) {
              try {
                await base44.functions.invoke("assessExternalRisk", { customer_id: saved.id });
                toast.success("External risk assessment completed");
                // Reload customer data to show external findings
                const updated = await base44.entities.Customer.get(saved.id);
                setSelected(updated);
              } catch (err) {
                toast.error("External risk assessment failed: " + err.message);
              }
            }
            
            if (opts?.openAfter && saved) setSelected(saved);
          }}
        />
      )}
      {selected && (
        <CustomerDetail
          customer={selected}
          onClose={() => setSelected(null)}
          onUpdated={async () => {
            const data = await base44.entities.Customer.list("-created_date", 200);
            setCustomers(data);
            setLoading(false);
            const refreshed = data.find(c => c.id === selected.id);
            if (refreshed) setSelected(refreshed);
          }}
        />
      )}
    </div>
  );
}