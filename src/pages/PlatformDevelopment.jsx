import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter, Eye, Loader2, Code2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import DevRequestForm from "@/components/devrequests/DevRequestForm";
import DevRequestDetail from "@/components/devrequests/DevRequestDetail";
import moment from "moment";

const REQUEST_TYPE_LABELS = {
  bug_site_issue: "Bug / Site Issue",
  new_idea: "New Idea",
  function_addition: "Function Addition",
  documentation: "Documentation",
  process_modification: "Process Modification",
  process_addition: "Process Addition",
};

export default function PlatformDevelopment() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [user, setUser] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.DevRequest.list("-created_date", 200);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    load();
  }, []);

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const columns = [
    {
      key: "request_number", label: "Request #",
      render: (v) => <span className="font-mono font-bold text-primary text-xs">{v || "—"}</span>
    },
    {
      key: "summary", label: "Summary",
      render: (v, row) => (
        <div>
          <div className="font-medium text-white">{v}</div>
          <div className="text-xs text-white/40">{REQUEST_TYPE_LABELS[row.request_type]}</div>
        </div>
      )
    },
    {
      key: "requested_by", label: "Requested By",
      render: (v) => <span className="text-white/80 text-sm">{v}</span>
    },
    {
      key: "area", label: "Area",
      render: (v) => <span className="text-white/60 text-sm capitalize">{v}</span>
    },
    {
      key: "status", label: "Status",
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: "request_date", label: "Submitted",
      render: (v) => <span className="text-white/60 text-sm">{v ? moment(v).format("DD/MM/YY HH:mm") : "—"}</span>
    },
    {
      key: "comments", label: "Discussion",
      render: (v, row) => (
        <div className="flex items-center gap-1.5">
          {row.has_unread_comments && row.status !== "resolved" && row.status !== "closed" && (
            <span className="inline-flex items-center justify-center" title="New comment">
              <Bell className="w-3.5 h-3.5 text-red-500 animate-bounce" fill="currentColor" />
            </span>
          )}
          <span className="text-white/40 text-xs">{(v || []).length} comments</span>
        </div>
      )
    },
    {
      key: "id", label: "",
      render: (v, row) => (
        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setSelected(row); }}
            title="View"
            className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ];

  const FILTERS = [
    { value: "all", label: `All (${requests.length})` },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "awaiting_response", label: "Awaiting Response" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const openCount = requests.filter(r => r.status === "open" || r.status === "in_progress" || r.status === "awaiting_response").length;

  return (
    <div>
      <PageHeader
        title="Platform Development"
        subtitle="Submit, track and manage development requests, ideas and issues"
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New Request
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-heading font-bold text-foreground mt-1">{requests.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
            <p className="text-2xl font-heading font-bold text-primary mt-1">{openCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-heading font-bold text-green-400 mt-1">{requests.filter(r => r.status === "resolved").length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Issues / Bugs</p>
            <p className="text-2xl font-heading font-bold text-red-400 mt-1">{requests.filter(r => r.is_issue).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                filter === f.value ? "bg-primary text-black" : "bg-[hsl(0,0%,14%)] text-white/50 hover:text-white hover:bg-[hsl(0,0%,18%)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No development requests yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Click "New Request" to submit your first request.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={setSelected}
            emptyMessage="No requests found."
            rowClassName={(row) => {
              const colors = {
                open: "border-red-500 bg-red-500/5",
                resolved: "border-green-500 bg-green-500/5",
                closed: "border-gray-500 bg-gray-500/5",
              };
              const c = colors[row.status] || "border-orange-500 bg-orange-500/5";
              return `${c} border-y-2 [&:first-child]:border-l-2 [&:last-child]:border-r-2`;
            }}
          />
        )}
      </div>

      {showForm && (
        <DevRequestForm
          user={user}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}

      {editTarget && (
        <DevRequestForm
          initial={editTarget}
          user={user}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
        />
      )}

      {selected && !editTarget && (
        <DevRequestDetail
          request={selected}
          user={user}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setSelected(updated);
            setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
          }}
          onEdit={() => { setEditTarget(selected); }}
        />
      )}
    </div>
  );
}