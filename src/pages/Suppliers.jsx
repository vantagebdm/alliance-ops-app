import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Star, Filter, X, FileText, Link2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import SupplierOnboardingForm from "../components/suppliers/SupplierOnboardingForm";
import SupplierDetail from "../components/suppliers/SupplierDetail";
import POForm from "../components/purchasing/POForm";
import SupplierAppPreview from "../components/supplierapp/SupplierAppPreview";
import SupplierApplicationReview from "../components/suppliers/SupplierApplicationReview";

function StarRating({ value }) {
  if (!value) return <span className="text-white/30 text-xs">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < value ? "text-amber-400 fill-amber-400" : "text-white/15"}`} />
      ))}
    </div>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showPOForm, setShowPOForm] = useState(false);
  const [poInitial, setPoInitial] = useState(null);
  const [showSupplierApp, setShowSupplierApp] = useState(false);
  const [applications, setApplications] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [appliedAppId, setAppliedAppId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const [data, apps] = await Promise.all([
      base44.entities.Supplier.list("-created_date", 200),
      base44.entities.SupplierApplication.filter({ status: { $in: ["submitted", "matched"] } }, "-submitted_at", 100),
    ]);
    setSuppliers(data);
    setApplications(apps || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const allCategories = [...new Set(suppliers.flatMap(s => s.categories_supplied || []))].sort();

  const filtered = suppliers.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.trading_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.supplier_code?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchCat = filterCategory === "all" || (s.categories_supplied || []).includes(filterCategory);
    return matchSearch && matchStatus && matchCat;
  });

  const handleSaved = (saved) => {
    setShowForm(false);
    setEditTarget(null);
    if (appliedAppId) {
      base44.entities.SupplierApplication.update(appliedAppId, { status: "applied" }).catch(() => {});
      setAppliedAppId(null);
    }
    load().then(() => {
      if (saved?.id) {
        setSelected(saved);
      }
    });
  };

  const handleConfirmApplication = (app, prefill) => {
    setShowReview(false);
    setAppliedAppId(app.id);
    setEditTarget(prefill);
    setShowForm(true);
  };

  const copyFormLink = () => {
    const url = `${window.location.origin}/alliance-supplier-details`;
    navigator.clipboard?.writeText(url);
    toast({ title: "Link copied", description: "Supplier application form link copied to clipboard." });
  };

  const handleEdit = () => {
    setEditTarget(selected);
    setSelected(null);
    setShowForm(true);
  };

  const handleNewPO = () => {
    setPoInitial({ supplier_name: selected?.name || "", supplier_id: selected?.id || "" });
    setShowPOForm(true);
  };

  const handleViewOpenPOs = () => {
    // Navigate to purchasing page filtered by this supplier
    window.location.href = `/purchasing?supplier=${encodeURIComponent(selected?.name || "")}`;
  };

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers registered`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyFormLink}
              className="font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
              <Link2 className="w-4 h-4 mr-1" /> Online Form Link
            </Button>
            <Button variant="outline" onClick={() => setShowSupplierApp(true)}
              className="font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
              <FileText className="w-4 h-4 mr-1" /> Application PDF
            </Button>
            <Button onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Supplier
            </Button>
          </div>
        }
      />

      {applications.length > 0 && (
        <div className="px-6">
          <button onClick={() => setShowReview(true)}
            className="w-full flex items-center justify-between gap-3 p-3 rounded-sm border border-primary/40 bg-primary/10 hover:bg-primary/15 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-primary" />
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-heading">{applications.length}</span>
            </div>
            <div>
              <div className="font-heading text-xs uppercase tracking-wider text-primary font-bold">
                {applications.length} Supplier Application{applications.length !== 1 ? "s" : ""} Pending
              </div>
              <div className="text-[11px] text-white/50">
                {applications.filter(a => a.status === "matched").length} matched to On Hold accounts · {applications.filter(a => a.status !== "matched").length} awaiting setup
              </div>
            </div>
          </div>
          <span className="font-heading text-[10px] uppercase tracking-wider text-primary">Review →</span>
          </button>
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="pl-9 rounded-sm" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 rounded-sm text-xs font-heading uppercase tracking-wider">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="preferred">Preferred</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
            </SelectContent>
          </Select>
          {allCategories.length > 0 && (
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-44 rounded-sm text-xs font-heading uppercase tracking-wider">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {(filterStatus !== "all" || filterCategory !== "all" || search) && (
            <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterCategory("all"); }}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white font-heading uppercase tracking-wider">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/20 font-heading uppercase tracking-wider text-xs">
            No suppliers found
          </div>
        ) : (
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(0,0%,9%)] border-b border-[hsl(0,0%,18%)]">
                  {["Supplier Name","Code","Categories","City","Terms","Lead Time","Preferred","Rating","Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(0,0%,16%)]">
                {filtered.map(s => (
                  <tr key={s.id}
                    onClick={() => setSelected(s)}
                    className="hover:bg-[hsl(0,0%,14%)] cursor-pointer transition-colors">
                    <td className="px-4 py-2.5">
                     <div className="font-semibold text-white">{s.trading_name || s.name}</div>
                     {s.trading_name && s.trading_name !== s.name && <div className="text-[10px] text-white/30">{s.name}</div>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-white/40 font-mono">{s.supplier_code || "—"}</td>
                    <td className="px-4 py-2.5">
                      {(s.categories_supplied || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(s.categories_supplied || []).slice(0, 2).map(c => (
                            <span key={c} className="px-1.5 py-0.5 text-[9px] font-heading uppercase tracking-wider bg-[hsl(0,0%,18%)] border border-[hsl(0,0%,24%)] rounded-sm text-white/60">{c}</span>
                          ))}
                          {(s.categories_supplied || []).length > 2 && (
                            <span className="text-[9px] text-white/30">+{(s.categories_supplied || []).length - 2}</span>
                          )}
                        </div>
                      ) : <span className="text-white/30 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-white/40">{[s.city, s.state].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-white/70">{(s.payment_terms || "").replace(/_/g, " ") || "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-white/70">{s.lead_time_standard ? `${s.lead_time_standard}d` : "—"}</td>
                    <td className="px-4 py-2.5 text-center">
                      {s.preferred_supplier
                        ? <span className="text-primary text-sm font-bold">★</span>
                        : <span className="text-white/20 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-2.5"><StarRating value={s.rating} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <SupplierOnboardingForm
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}

      {selected && !showForm && (
        <SupplierDetail
          supplier={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
          onNewPO={handleNewPO}
          onViewOpenPOs={handleViewOpenPOs}
          onStatusChanged={async () => {
            await load();
            setSelected(prev => {
              if (!prev) return prev;
              const updated = suppliers.find(s => s.id === prev.id);
              return updated || prev;
            });
          }}
        />
      )}

      {showSupplierApp && (
        <SupplierAppPreview onClose={() => setShowSupplierApp(false)} />
      )}

      {showReview && (
        <SupplierApplicationReview
          applications={applications}
          onClose={() => setShowReview(false)}
          onConfirm={handleConfirmApplication}
        />
      )}

      {showPOForm && (
        <POForm
          initial={poInitial}
          onClose={() => { setShowPOForm(false); setPoInitial(null); }}
          onSaved={() => { setShowPOForm(false); setPoInitial(null); }}
        />
      )}
    </div>
  );
}