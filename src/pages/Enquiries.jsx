import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter, AlertTriangle, Zap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import EnquiryForm from "../components/enquiries/EnquiryForm";
import EnquiryDetail from "../components/enquiries/EnquiryDetail";
import moment from "moment";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Enquiry.list("-created_date", 200);
    setEnquiries(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.Enquiry.subscribe((event) => {
      if (event.type === 'create') {
        setEnquiries(prev => [event.data, ...prev]);
      } else if (event.type === 'update') {
        setEnquiries(prev => prev.map(e => e.id === event.id ? event.data : e));
      } else if (event.type === 'delete') {
        setEnquiries(prev => prev.filter(e => e.id !== event.id));
      }
    });
    return () => unsubscribe();
  }, []);

  const filtered = filter === "all" ? enquiries : enquiries.filter(e => {
    if (filter === "urgent") return e.urgency === "urgent" || e.urgency === "breakdown";
    if (filter === "breakdown") return e.urgency === "breakdown";
    if (filter === "unread") return e.is_unread;
    return e.status === filter;
  });

  const unreadCount = enquiries.filter(e => e.is_unread).length;

  const breakdownCount = enquiries.filter(e => e.urgency === "breakdown").length;

  const columns = [
    {
      key: "is_unread", label: "", width: "w-8", sortable: false,
      render: (v, row) => {
        if (row.email_body) return <Mail className="w-4 h-4 text-blue-500" />;
        if (v) return <div className="w-2 h-2 bg-primary rounded-full" />;
        return null;
      }
    },
    {
      key: "urgency", label: "", width: "w-8", sortable: false,
      render: (v) => v === "breakdown" ? <AlertTriangle className="w-4 h-4 text-red-500" /> :
        v === "urgent" ? <Zap className="w-4 h-4 text-amber-500" /> : null
    },
    { key: "enquiry_number", label: "Ref #", render: (v) => <span className="font-mono font-bold text-primary text-xs">{v || "—"}</span> },
    { key: "customer_name", label: "Customer", render: (v, row) => (
      <div>
        <div className="font-medium">{v}</div>
        {row.company && <div className="text-xs text-muted-foreground">{row.company}</div>}
      </div>
    )},
    { key: "part_description", label: "Part Required", render: (v) => (
      <div className="max-w-xs truncate text-sm">{v}</div>
    )},
    { key: "vehicle_make", label: "Vehicle", render: (v, row) => {
      const txt = [v, row.vehicle_model, row.vehicle_year].filter(Boolean).join(" ");
      return txt ? <span className="text-sm">{txt}</span> : <span className="text-muted-foreground">—</span>;
    }},
    { key: "urgency", label: "Urgency", render: (v) => <StatusBadge status={v} /> },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "source", label: "Source", render: (v) => <span className="text-xs text-muted-foreground uppercase">{(v || "").replace("_", " ")}</span> },
    { key: "created_date", label: "Received", render: (v) => (
      <div>
        <div className="text-xs">{moment(v).format("DD/MM/YY")}</div>
        <div className="text-[10px] text-muted-foreground">{moment(v).fromNow()}</div>
      </div>
    )},
  ];

  const FILTERS = [
    { value: "all", label: `All (${enquiries.length})` },
    { value: "unread", label: `📧 Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { value: "new", label: "New" },
    { value: "breakdown", label: `🔴 Breakdown${breakdownCount > 0 ? ` (${breakdownCount})` : ""}` },
    { value: "urgent", label: "Urgent" },
    { value: "under_review", label: "Under Review" },
    { value: "pricing_in_progress", label: "Pricing" },
    { value: "quoted", label: "Quoted" },
    { value: "converted", label: "Converted" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div>
      <PageHeader
        title="Enquiries"
        subtitle="Source My Parts — Incoming Requests Pipeline"
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New Enquiry
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                filter === f.value ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(row) => setSelected(row)}
            emptyMessage="No enquiries match this filter."
            rowClassName={(row) => row.is_unread ? "bg-blue-500/5" : ""}
          />
        )}
      </div>

      {showForm && (
        <EnquiryForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}

      {selected && (
        <EnquiryDetail
          enquiry={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}