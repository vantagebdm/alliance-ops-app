import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Filter, AlertTriangle, Tag, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import PartForm from "../components/parts/PartForm";
import PartDetail from "../components/parts/PartDetail";

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Part.list("-created_date", 500);
    setParts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = parts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.part_number?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.oem_number?.toLowerCase().includes(q) ||
      p.aftermarket_number?.toLowerCase().includes(q) ||
      p.cross_references?.toLowerCase().includes(q) ||
      p.compatible_vehicles?.toLowerCase().includes(q);
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStockCount = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level).length;

  const columns = [
    { key: "part_number", label: "Part #", render: (v) => <span className="font-mono font-bold text-primary text-xs">{v}</span> },
    { key: "name", label: "Description", render: (v, row) => (
      <div>
        <div className="font-medium text-sm">{v}</div>
        {row.brand && <div className="text-xs text-muted-foreground">{row.brand}{row.oem_number ? ` · OEM: ${row.oem_number}` : ""}</div>}
      </div>
    )},
    { key: "category", label: "Category", render: (v) => <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">{v || "—"}</span> },
    { key: "stock_quantity", label: "In Stock", render: (v, row) => {
      const low = row.min_stock_level > 0 && v <= row.min_stock_level;
      const out = v === 0;
      return (
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-sm ${out ? "text-red-500" : low ? "text-amber-500" : "text-foreground"}`}>{v ?? 0}</span>
          {(low || out) && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
        </div>
      );
    }},
    { key: "min_stock_level", label: "Min", render: (v) => <span className="text-muted-foreground text-xs">{v ?? 0}</span> },
    { key: "sell_price", label: "Sell", render: (v) => <span className="font-semibold">${(v || 0).toFixed(2)}</span> },
    { key: "unit_cost", label: "Cost", render: (v) => <span className="text-muted-foreground">${(v || 0).toFixed(2)}</span> },
    { key: "location", label: "Location", render: (v) => <span className="font-mono text-xs">{v || "—"}</span> },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  const CATEGORIES = ["all","engine","transmission","brakes","suspension","electrical","body","filters","hydraulic","driveline","cooling","fuel","tyres","other"];

  return (
    <div>
      <PageHeader
        title="Parts Master"
        subtitle={`${parts.length} parts in catalogue${lowStockCount > 0 ? ` · ${lowStockCount} low stock` : ""}`}
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Part
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        {/* Search + Categories */}
        <div className="flex flex-col gap-3">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search part #, name, brand, OEM number, cross-ref..."
              className="pl-9 rounded-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-2.5 py-1 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${catFilter === c ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} onRowClick={setSelected} emptyMessage="No parts found." />
        )}
      </div>

      {showForm && (
        <PartForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}

      {editTarget && (
        <PartForm initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}

      {selected && !editTarget && (
        <PartDetail
          part={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditTarget(selected); setSelected(null); }}
          onUpdated={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}