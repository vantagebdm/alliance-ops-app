import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, AlertTriangle, Package, TrendingDown, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Inventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Part.list("-created_date", 500);
    setParts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const lowStock = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level);
  const outOfStock = parts.filter(p => p.stock_quantity === 0 && p.min_stock_level > 0);
  const reorderNeeded = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level);

  const displayParts = (() => {
    let list = parts;
    if (view === "low") list = lowStock;
    if (view === "out") list = outOfStock;
    if (view === "reorder") list = reorderNeeded;
    const q = search.toLowerCase();
    if (q) list = list.filter(p =>
      p.part_number?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.supplier_name?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    );
    return list;
  })();

  // Total stock value
  const totalValue = parts.reduce((s, p) => s + (p.stock_quantity || 0) * (p.unit_cost || 0), 0);
  const sellValue = parts.reduce((s, p) => s + (p.stock_quantity || 0) * (p.sell_price || 0), 0);

  const columns = [
    { key: "part_number", label: "Part #", render: (v) => <span className="font-mono font-bold text-primary text-xs">{v}</span> },
    { key: "name", label: "Description", render: (v, row) => (
      <div>
        <div className="font-medium text-sm">{v}</div>
        {row.brand && <div className="text-xs text-muted-foreground">{row.brand}</div>}
      </div>
    )},
    { key: "category", label: "Category", render: (v) => <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">{v || "—"}</span> },
    { key: "location", label: "Location", render: (v, row) => (
      <div>
        <span className="font-mono text-xs font-bold">{v || "—"}</span>
        {row.bin && <span className="text-muted-foreground text-xs ml-1">/ {row.bin}</span>}
      </div>
    )},
    { key: "stock_quantity", label: "On Hand", render: (v, row) => {
      const out = v === 0 && row.min_stock_level > 0;
      const low = !out && row.min_stock_level > 0 && v <= row.min_stock_level;
      return (
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-sm tabular-nums ${out ? "text-red-500" : low ? "text-amber-500" : "text-foreground"}`}>{v ?? 0}</span>
          {out && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          {low && !out && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
        </div>
      );
    }},
    { key: "min_stock_level", label: "Min", render: (v) => <span className="text-muted-foreground text-xs tabular-nums">{v ?? 0}</span> },
    { key: "max_stock_level", label: "Max", render: (v) => <span className="text-muted-foreground text-xs tabular-nums">{v ?? 0}</span> },
    { key: "unit_cost", label: "Cost", render: (v) => <span className="text-sm">${(v || 0).toFixed(2)}</span> },
    { key: "stock_quantity", label: "Stock Value", render: (v, row) => {
      const val = (v || 0) * (row.unit_cost || 0);
      return <span className="font-semibold text-sm">${val.toFixed(0)}</span>;
    }},
    { key: "supplier_name", label: "Supplier", render: (v) => <span className="text-xs text-muted-foreground">{v || "—"}</span> },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  const VIEWS = [
    { value: "all", label: `All Parts (${parts.length})` },
    { value: "low", label: `Low Stock (${lowStock.length})` },
    { value: "out", label: `Out of Stock (${outOfStock.length})` },
    { value: "reorder", label: `Reorder Needed (${reorderNeeded.length})` },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${parts.length} SKUs · Stock Value: $${Math.round(totalValue).toLocaleString("en-AU")} cost / $${Math.round(sellValue).toLocaleString("en-AU")} sell`}
        actions={
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60">
        <div className="bg-white p-4">
          <div className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Total SKUs</div>
          <div className="font-heading text-2xl font-bold text-foreground">{parts.length}</div>
        </div>
        <div className="bg-white p-4">
          <div className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Out of Stock</div>
          <div className={`font-heading text-2xl font-bold ${outOfStock.length > 0 ? "text-red-500" : "text-foreground"}`}>{outOfStock.length}</div>
        </div>
        <div className="bg-white p-4">
          <div className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Low Stock</div>
          <div className={`font-heading text-2xl font-bold ${lowStock.length > 0 ? "text-amber-500" : "text-foreground"}`}>{lowStock.length}</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-primary">
          <div className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Cost Value</div>
          <div className="font-heading text-xl font-bold text-primary">${Math.round(totalValue).toLocaleString("en-AU")}</div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." className="pl-9 rounded-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {VIEWS.map(v => (
              <button key={v.value} onClick={() => setView(v.value)}
                className={`px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${view === v.value ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={displayParts} emptyMessage="No inventory items match this filter." />
        )}
      </div>
    </div>
  );
}