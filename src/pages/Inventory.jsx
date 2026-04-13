import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Inventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");

  useEffect(() => {
    base44.entities.Part.list("-created_date", 500).then(d => {
      setParts(d);
      setLoading(false);
    });
  }, []);

  const lowStock = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level);
  const outOfStock = parts.filter(p => p.stock_quantity === 0);

  const displayParts = (() => {
    let list = parts;
    if (view === "low") list = lowStock;
    if (view === "out") list = outOfStock;
    const q = search.toLowerCase();
    if (q) list = list.filter(p => p.part_number?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q));
    return list;
  })();

  const columns = [
    { key: "part_number", label: "Part #", render: (v) => <span className="font-mono font-semibold">{v}</span> },
    { key: "name", label: "Name" },
    { key: "category", label: "Category", render: (v) => <span className="text-xs uppercase">{v || "—"}</span> },
    { key: "location", label: "Location" },
    { key: "stock_quantity", label: "In Stock", render: (v, row) => {
      const low = row.min_stock_level > 0 && v <= row.min_stock_level;
      return (
        <div className="flex items-center gap-2">
          <span className={low ? "text-red-500 font-bold" : "font-semibold"}>{v ?? 0}</span>
          {low && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
        </div>
      );
    }},
    { key: "min_stock_level", label: "Min Level" },
    { key: "supplier_name", label: "Supplier" },
    { key: "unit_cost", label: "Unit Cost", render: (v) => `$${(v || 0).toFixed(2)}` },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  const VIEWS = [
    { value: "all", label: `All (${parts.length})` },
    { value: "low", label: `Low Stock (${lowStock.length})` },
    { value: "out", label: `Out of Stock (${outOfStock.length})` },
  ];

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock levels and warehouse management" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." className="pl-9 rounded-sm" />
          </div>
          <div className="flex gap-2">
            {VIEWS.map(v => (
              <button key={v.value} onClick={() => setView(v.value)}
                className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${view === v.value ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={displayParts} emptyMessage="No inventory items found." />
        )}
      </div>
    </div>
  );
}