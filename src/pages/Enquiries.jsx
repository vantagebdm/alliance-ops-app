import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import EnquiryForm from "../components/enquiries/EnquiryForm";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Enquiry.list("-created_date", 100);
    setEnquiries(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? enquiries : enquiries.filter(e => {
    if (filter === "urgent") return e.urgency === "urgent" || e.urgency === "breakdown";
    return e.status === filter;
  });

  const columns = [
    { key: "enquiry_number", label: "Ref #", render: (v) => <span className="font-mono font-semibold text-foreground">{v || "—"}</span> },
    { key: "customer_name", label: "Customer" },
    { key: "part_description", label: "Part Description" },
    { key: "vehicle_make", label: "Vehicle", render: (v, row) => `${v || ""} ${row.vehicle_model || ""}`.trim() || "—" },
    { key: "urgency", label: "Urgency", render: (v) => <StatusBadge status={v} /> },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "source", label: "Source", render: (v) => <span className="text-xs uppercase">{v || "—"}</span> },
    { key: "created_date", label: "Date", render: (v) => moment(v).format("DD/MM/YY HH:mm") },
  ];

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "in_progress", label: "In Progress" },
    { value: "urgent", label: "Urgent" },
    { value: "quoted", label: "Quoted" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div>
      <PageHeader
        title="Enquiries"
        subtitle="Source My Parts — Incoming Requests"
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New Enquiry
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                filter === f.value
                  ? "bg-primary text-black"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(row) => navigate(`/enquiries/${row.id}`)}
            emptyMessage="No enquiries found. Click 'New Enquiry' to create one."
          />
        )}
      </div>

      {showForm && (
        <EnquiryForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}