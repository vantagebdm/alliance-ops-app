import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Mail, MessageSquare, Clock, ChevronRight, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import CustomerForm from "./CustomerForm";
import CustomerCommunication from "./CustomerCommunication";
import moment from "moment";

const TABS = ["Details", "Communication"];

export default function CustomerDetail({ customer, onClose, onUpdated }) {
  const [tab, setTab] = useState("Details");
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <CustomerForm
        initial={customer}
        onClose={() => setEditing(false)}
        onSaved={() => { setEditing(false); onUpdated(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-6 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-sm shadow-2xl mb-10">
        {/* Header */}
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <div>
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">{customer.name}</h2>
            {customer.company && <p className="text-white/50 text-xs mt-0.5">{customer.company}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}
              className="border-white/20 text-white hover:bg-white/10 rounded-sm font-heading text-xs uppercase tracking-wider">
              <Edit className="w-3 h-3 mr-1" /> Edit
            </Button>
            <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/20">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 font-heading text-xs uppercase tracking-wider font-semibold transition-colors ${
                tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === "Details" && <CustomerDetailsTab customer={customer} />}
          {tab === "Communication" && <CustomerCommunication customer={customer} />}
        </div>
      </div>
    </div>
  );
}

function CustomerDetailsTab({ customer }) {
  const fields = [
    { label: "Email", value: customer.email },
    { label: "Phone", value: customer.phone },
    { label: "Type", value: customer.type?.replace(/_/g, " ") },
    { label: "Status", value: <StatusBadge status={customer.status} /> },
    { label: "Payment Terms", value: customer.payment_terms?.replace(/_/g, " ") },
    { label: "Address", value: [customer.address, customer.city, customer.state, customer.postcode].filter(Boolean).join(", ") },
    { label: "Total Orders", value: customer.total_orders || 0 },
    { label: "Total Revenue", value: customer.total_revenue ? `$${customer.total_revenue.toLocaleString()}` : "$0" },
    { label: "Customer Since", value: moment(customer.created_date).format("DD/MM/YYYY") },
  ];

  return (
    <div className="space-y-1">
      {fields.map(f => f.value ? (
        <div key={f.label} className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0">
          <span className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground w-36 shrink-0">{f.label}</span>
          <span className="text-sm">{f.value}</span>
        </div>
      ) : null)}
      {customer.notes && (
        <div className="mt-4 p-3 bg-muted/30 rounded-sm">
          <p className="font-heading text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
          <p className="text-sm">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}