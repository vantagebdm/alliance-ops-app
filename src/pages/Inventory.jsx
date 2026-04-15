import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, AlertTriangle, RefreshCw, Plus, BarChart2, ClipboardList, ArrowLeftRight, ArrowDownToLine, Package, TrendingDown, LayoutDashboard, List, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import InventoryDashboard from "@/components/inventory/InventoryDashboard";
import StockAdjustmentForm from "@/components/inventory/StockAdjustmentForm";
import StocktakeForm from "@/components/inventory/StocktakeForm";
import StockTransferForm from "@/components/inventory/StockTransferForm";
import StocktakeList from "@/components/inventory/StocktakeList";
import StockAdjustmentList from "@/components/inventory/StockAdjustmentList";
import StockMovementsLedger from "@/components/inventory/StockMovementsLedger";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "stock", label: "Stock List", icon: List },
  { id: "adjustments", label: "Adjustments", icon: BarChart2 },
  { id: "stocktakes", label: "Stocktakes", icon: ClipboardList },
  { id: "movements", label: "Movements Ledger", icon: FileText },
];

const FILTER_VIEWS = [
  { value: "all", label: "All Parts" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
  { value: "negative", label: "Negative Stock" },
  { value: "critical", label: "Critical Parts" },
  { value: "reorder", label: "Reorder Needed" },
];

const WAREHOUSES = ["All Warehouses", "Main Warehouse", "Karratha", "Port Hedland", "Newman", "Workshop", "Yard"];
const CATEGORIES = ["all", "engine", "transmission", "brakes", "suspension", "electrical", "body", "filters", "hydraulic", "driveline", "cooling", "fuel", "exhaust", "steering", "tyres", "other"];

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");
  const [warehouse, setWarehouse] = useState("All Warehouses");
  const [category, setCategory] = useState("all");
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showStocktake, setShowStocktake] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Part.list("-created_date", 1000);
    setParts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshKey]);

  const handleSaved = () => {
    setShowAdjustment(false);
    setShowStocktake(false);
    setShowTransfer(false);
    setRefreshKey(k => k + 1);
  };

  const lowStock = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level);
  const outOfStock = parts.filter(p => (p.stock_quantity || 0) === 0 && (p.min_stock_level || 0) > 0);
  const negative = parts.filter(p => (p.stock_quantity || 0) < 0);
  const critical = parts.filter(p => p.is_critical && (p.stock_quantity || 0) <= (p.min_stock_level || 0));
  const reorderNeeded = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level);
  const totalValue = parts.reduce((s, p) => s + (p.stock_quantity || 0) * (p.unit_cost || 0), 0);

  const displayParts = (() => {
    let list = parts;
    if (view === "low") list = lowStock;
    if (view === "out") list = outOfStock;
    if (view === "negative") list = negative;
    if (view === "critical") list = critical;
    if (view === "reorder") list = reorderNeeded;
    if (warehouse !== "All Warehouses") list = list.filter(p => p.location?.includes(warehouse) || p.warehouse === warehouse);
    if (category !== "all") list = list.filter(p => p.category === category);
    const q = search.toLowerCase();
    if (q) list = list.filter(p =>
      p.part_number?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) ||
      p.supplier_name?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
    return list;
  })();

  const columns = [
    { key: "part_number", label: "Part #", render: (v) => <span className="font-mono font-bold text-primary text-xs">{v}</span> },
    { key: "name", label: "Description", render: (v, row) => (
      <div>
        <div className="font-medium text-sm">{v}</div>
        {row.brand && <div className="text-xs text-muted-foreground">{row.brand}</div>}
      </div>
    )},
    { key: "equipment_type", label: "Equip. Type", render: (v) => <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{v?.replace(/_/g, " ") || "—"}</span> },
    { key: "category", label: "Category", render: (v) => <span className="text-xs text-muted-foreground capitalize">{v || "—"}</span> },
    { key: "location", label: "Location", render: (v, row) => (
      <div className="font-mono text-xs">
        <span className="font-bold">{v || "—"}</span>
        {row.bin && <span className="text-muted-foreground ml-1">/ {row.bin}</span>}
      </div>
    )},
    { key: "stock_quantity", label: "On Hand", render: (v, row) => {
      const out = (v || 0) === 0 && (row.min_stock_level || 0) > 0;
      const neg = (v || 0) < 0;
      const low = !out && !neg && row.min_stock_level > 0 && v <= row.min_stock_level;
      return (
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-sm tabular-nums ${neg ? "text-red-600" : out ? "text-red-500" : low ? "text-amber-500" : "text-foreground"}`}>{v ?? 0}</span>
          {(out || neg) && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          {low && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
        </div>
      );
    }},
    { key: "allocated_stock", label: "Allocated", render: (v) => <span className="text-xs text-blue-600 tabular-nums font-medium">{v ?? 0}</span> },
    { key: "min_stock_level", label: "Min", render: (v) => <span className="text-muted-foreground text-xs tabular-nums">{v ?? 0}</span> },
    { key: "max_stock_level", label: "Max", render: (v) => <span className="text-muted-foreground text-xs tabular-nums">{v ?? 0}</span> },
    { key: "unit_cost", label: "Unit Cost", render: (v) => <span className="text-xs">${(v || 0).toFixed(2)}</span> },
    { key: "stock_quantity", label: "Stock Value", render: (v, row) => {
      const val = (v || 0) * (row.unit_cost || 0);
      return <span className="font-semibold text-xs">${val.toFixed(0)}</span>;
    }},
    { key: "supplier_name", label: "Supplier", render: (v) => <span className="text-xs text-muted-foreground">{v || "—"}</span> },
    { key: "status", label: "Status", render: (v) => {
      if (!v) return null;
      const cfg = { active: "bg-green-100 text-green-700", discontinued: "bg-red-100 text-red-700", inactive: "bg-gray-100 text-gray-600", on_order: "bg-blue-100 text-blue-700" };
      return <span className={`text-[10px] font-heading uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-bold ${cfg[v] || ""}`}>{v}</span>;
    }},
  ];

  const reorderStatus = (p) => {
    if ((p.stock_quantity || 0) < 0) return { label: "Negative", cls: "bg-red-100 text-red-700" };
    if ((p.stock_quantity || 0) === 0) return { label: "Out of Stock", cls: "bg-red-100 text-red-700" };
    if (p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level) return { label: "Reorder", cls: "bg-amber-100 text-amber-700" };
    return { label: "OK", cls: "bg-green-100 text-green-700" };
  };

  return (
    <div>
      <PageHeader
        title="Inventory Control"
        subtitle={`${parts.length} SKUs · Cost Value: $${Math.round(totalValue).toLocaleString("en-AU")}`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowTransfer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading uppercase tracking-wider bg-secondary text-white rounded-sm hover:bg-secondary/80 transition-colors">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Transfer
            </button>
            <button onClick={() => setShowStocktake(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading uppercase tracking-wider bg-secondary text-white rounded-sm hover:bg-secondary/80 transition-colors">
              <ClipboardList className="w-3.5 h-3.5" /> Stocktake
            </button>
            <button onClick={() => setShowAdjustment(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading uppercase tracking-wider bg-primary text-black rounded-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Adjustment
            </button>
          </div>
        }
      />

      {/* Alert Banner */}
      {(negative.length > 0 || critical.length > 0) && (
        <div className="bg-red-600 text-white px-6 py-2 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-heading uppercase tracking-wider">
            {negative.length > 0 && `${negative.length} negative stock alert(s)`}
            {negative.length > 0 && critical.length > 0 && " · "}
            {critical.length > 0 && `${critical.length} critical part(s) below minimum`}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-border px-6">
        <div className="flex gap-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-heading uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <InventoryDashboard
            key={refreshKey}
            onNewAdjustment={() => setShowAdjustment(true)}
            onNewStocktake={() => setShowStocktake(true)}
            onNewTransfer={() => setShowTransfer(true)}
            onReceiveStock={() => navigate("/receive-stock")}
          />
        )}

        {/* STOCK LIST TAB */}
        {activeTab === "stock" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..." className="pl-9 rounded-sm" />
              </div>
              <Select value={view} onValueChange={setView}>
                <SelectTrigger className="w-44 rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{FILTER_VIEWS.map(v => <SelectItem key={v.value} value={v.value}>{v.label} {v.value === "low" ? `(${lowStock.length})` : v.value === "out" ? `(${outOfStock.length})` : v.value === "negative" ? `(${negative.length})` : v.value === "critical" ? `(${critical.length})` : v.value === "reorder" ? `(${reorderNeeded.length})` : `(${parts.length})`}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-36 rounded-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c === "all" ? "All Categories" : c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger className="w-44 rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{WAREHOUSES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-4 gap-px bg-border/60">
              {[
                { label: "Showing", value: displayParts.length },
                { label: "Low Stock", value: lowStock.length, color: lowStock.length > 0 ? "text-amber-500" : "" },
                { label: "Out of Stock", value: outOfStock.length, color: outOfStock.length > 0 ? "text-red-500" : "" },
                { label: "Cost Value", value: `$${Math.round(displayParts.reduce((s, p) => s + (p.stock_quantity || 0) * (p.unit_cost || 0), 0)).toLocaleString("en-AU")}`, color: "text-primary" },
              ].map(s => (
                <div key={s.label} className="bg-white px-4 py-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-heading">{s.label}</div>
                  <div className={`font-heading text-lg font-bold ${s.color || "text-foreground"}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
            ) : (
              <DataTable
                columns={columns}
                data={displayParts}
                onRowClick={(row) => navigate(`/parts/${row.id}`)}
                emptyMessage="No inventory items match this filter."
              />
            )}
          </div>
        )}

        {/* ADJUSTMENTS TAB */}
        {activeTab === "adjustments" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm uppercase tracking-wider font-bold text-foreground">Stock Adjustments</h3>
              <button onClick={() => setShowAdjustment(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-heading uppercase tracking-wider bg-primary text-black rounded-sm hover:bg-primary/90">
                <Plus className="w-3.5 h-3.5" /> New Adjustment
              </button>
            </div>
            <StockAdjustmentList key={refreshKey} onNewAdjustment={() => setShowAdjustment(true)} />
          </div>
        )}

        {/* STOCKTAKES TAB */}
        {activeTab === "stocktakes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm uppercase tracking-wider font-bold text-foreground">Stocktakes</h3>
              <button onClick={() => setShowStocktake(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-heading uppercase tracking-wider bg-primary text-black rounded-sm hover:bg-primary/90">
                <Plus className="w-3.5 h-3.5" /> New Stocktake
              </button>
            </div>
            <StocktakeList key={refreshKey} onNewStocktake={() => setShowStocktake(true)} />
          </div>
        )}

        {/* MOVEMENTS TAB */}
        {activeTab === "movements" && (
          <div className="space-y-4">
            <h3 className="font-heading text-sm uppercase tracking-wider font-bold text-foreground">Stock Movements Ledger</h3>
            <StockMovementsLedger key={refreshKey} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdjustment && <StockAdjustmentForm onClose={() => setShowAdjustment(false)} onSaved={handleSaved} />}
      {showStocktake && <StocktakeForm onClose={() => setShowStocktake(false)} onSaved={handleSaved} />}
      {showTransfer && <StockTransferForm onClose={() => setShowTransfer(false)} onSaved={handleSaved} />}
    </div>
  );
}