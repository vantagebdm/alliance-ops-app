import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import PartForm from "../components/parts/PartForm";
import { useNavigate } from "react-router-dom";

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Part.list("-created_date", 200);
    setParts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = parts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.part_number?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const columns = [
    { key: "part_number", label: "Part #", render: (v) => <span className="font-mono font-semibold text-primary">{v}</span> },
    { key: "name", label: "Name" },
    { key: "category", label: "Category", render: (v) => <span className="text-xs uppercase">{v || "—"}</span> },
    { key: "brand", label: "Brand" },
    { key: "stock_quantity", label: "Stock", render: (v, row) => {
      const low = row.min_stock_level > 0 && v <= row.min_stock_level;
      return <span className={low ? "text-red-500 font-bold" : ""}>{v ?? 0}</span>;
    }},
    { key: "sell_price", label: "Sell Price", render: (v) => `$${(v || 0).toFixed(2)}` },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  const CATEGORIES = ["all", "engine", "transmission", "brakes", "suspension", "electrical", "body", "filters", "hydraulic", "other"];

  return (
    <div>
      <PageHeader
        title="Parts Master"
        subtitle={`${parts.length} parts in catalogue`}
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Part
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..." className="pl-9 rounded-sm" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${catFilter === c ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/parts/${row.id}`)} emptyMessage="No parts found." />
        )}
      </div>
      {showForm && <PartForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}