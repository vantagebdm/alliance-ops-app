import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Package, AlertTriangle, TrendingDown, ShieldAlert, Wrench, RefreshCw, ArrowRight, ClipboardList, BarChart2, ArrowLeftRight, ArrowDownToLine } from "lucide-react";
import { Link } from "react-router-dom";

export default function InventoryDashboard({ onNewAdjustment, onNewStocktake, onNewTransfer, onReceiveStock }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustmentsToday, setAdjustmentsToday] = useState(0);
  const [activeStocktakes, setActiveStocktakes] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [parts, adjustments, stocktakes] = await Promise.all([
        base44.entities.Part.list("-created_date", 1000),
        base44.entities.StockAdjustment.list("-created_date", 100),
        base44.entities.Stocktake.list("-created_date", 50),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const adjToday = adjustments.filter(a => a.adjustment_date === today || a.created_date?.startsWith?.(today));

      const totalValue = parts.reduce((s, p) => s + (p.stock_quantity || 0) * (p.unit_cost || 0), 0);
      const lowStock = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level);
      const outOfStock = parts.filter(p => (p.stock_quantity || 0) === 0 && (p.min_stock_level || 0) > 0);
      const negative = parts.filter(p => (p.stock_quantity || 0) < 0);
      const critical = parts.filter(p => p.is_critical && (p.stock_quantity || 0) <= (p.min_stock_level || 0));
      const reorderNeeded = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level);

      setStats({ parts, totalValue, lowStock, outOfStock, negative, critical, reorderNeeded, total: parts.length });
      setAdjustmentsToday(adjToday.length);
      setActiveStocktakes(stocktakes.filter(s => ["released", "in_progress", "submitted", "variance_review"].includes(s.status)).length);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;
  }

  const STAT_CARDS = [
    { label: "Total SKUs", value: stats.total, color: "text-foreground", icon: Package, bg: "bg-white" },
    { label: "Low Stock", value: stats.lowStock.length, color: stats.lowStock.length > 0 ? "text-amber-500" : "text-foreground", icon: TrendingDown, bg: stats.lowStock.length > 0 ? "bg-amber-50" : "bg-white" },
    { label: "Out of Stock", value: stats.outOfStock.length, color: stats.outOfStock.length > 0 ? "text-red-500" : "text-foreground", icon: AlertTriangle, bg: stats.outOfStock.length > 0 ? "bg-red-50" : "bg-white" },
    { label: "Negative Stock", value: stats.negative.length, color: stats.negative.length > 0 ? "text-red-600" : "text-foreground", icon: AlertTriangle, bg: stats.negative.length > 0 ? "bg-red-50" : "bg-white" },
    { label: "Critical Parts ↓ Min", value: stats.critical.length, color: stats.critical.length > 0 ? "text-red-600" : "text-foreground", icon: ShieldAlert, bg: stats.critical.length > 0 ? "bg-red-50" : "bg-white" },
    { label: "Reorder Needed", value: stats.reorderNeeded.length, color: stats.reorderNeeded.length > 0 ? "text-amber-500" : "text-foreground", icon: RefreshCw, bg: stats.reorderNeeded.length > 0 ? "bg-amber-50" : "bg-white" },
    { label: "Stocktakes Active", value: activeStocktakes, color: activeStocktakes > 0 ? "text-blue-600" : "text-foreground", icon: ClipboardList, bg: activeStocktakes > 0 ? "bg-blue-50" : "bg-white" },
    { label: "Adjustments Today", value: adjustmentsToday, color: "text-foreground", icon: BarChart2, bg: "bg-white" },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} p-4`}>
              <div className="flex items-center justify-between mb-1">
                <div className="font-heading text-[10px] uppercase tracking-widest text-foreground/40">{card.label}</div>
                <Icon className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <div className={`font-heading text-2xl font-bold ${card.color}`}>{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Total Value Banner */}
      <div className="bg-secondary text-white px-4 py-3 rounded-sm flex items-center justify-between">
        <div>
          <div className="font-heading text-[10px] uppercase tracking-widest text-white/40">Total Inventory Value (Cost)</div>
          <div className="font-heading text-3xl font-bold text-primary">${Math.round(stats.totalValue).toLocaleString("en-AU")}</div>
        </div>
        <Package className="w-8 h-8 text-white/20" />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="font-heading text-xs uppercase tracking-widest text-foreground/40 mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "New Adjustment", icon: BarChart2, action: onNewAdjustment, color: "bg-primary text-black hover:bg-primary/90" },
            { label: "New Stocktake", icon: ClipboardList, action: onNewStocktake, color: "bg-secondary text-white hover:bg-secondary/80" },
            { label: "Transfer Stock", icon: ArrowLeftRight, action: onNewTransfer, color: "bg-secondary text-white hover:bg-secondary/80" },
            { label: "Receive Stock", icon: ArrowDownToLine, action: onReceiveStock, color: "bg-secondary text-white hover:bg-secondary/80" },
          ].map(a => {
            const Icon = a.icon;
            return (
              <button key={a.label} onClick={a.action}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-sm font-heading text-xs uppercase tracking-wider transition-colors ${a.color}`}>
                <Icon className="w-4 h-4" /> {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Panels */}
      {stats.critical.length > 0 && (
        <div className="border border-red-200 rounded-sm overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-heading text-xs uppercase tracking-wider font-bold">Critical Parts Below Minimum ({stats.critical.length})</span>
          </div>
          <div className="divide-y divide-border/50">
            {stats.critical.slice(0, 5).map(p => (
              <div key={p.id} className="px-4 py-2 flex items-center justify-between bg-red-50/30">
                <div>
                  <span className="font-mono font-bold text-xs text-primary">{p.part_number}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{p.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-red-600 font-bold">Stock: {p.stock_quantity || 0}</span>
                  <span className="text-muted-foreground">Min: {p.min_stock_level}</span>
                </div>
              </div>
            ))}
            {stats.critical.length > 5 && (
              <div className="px-4 py-2 text-xs text-muted-foreground text-center">
                +{stats.critical.length - 5} more critical parts
              </div>
            )}
          </div>
        </div>
      )}

      {stats.reorderNeeded.length > 0 && (
        <div className="border border-amber-200 rounded-sm overflow-hidden">
          <div className="bg-amber-500 text-black px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span className="font-heading text-xs uppercase tracking-wider font-bold">Reorder Recommendations ({stats.reorderNeeded.length})</span>
            </div>
            <Link to="/purchasing" className="flex items-center gap-1 text-xs font-heading uppercase tracking-wider hover:opacity-70">
              Create POs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {stats.reorderNeeded.slice(0, 5).map(p => (
              <div key={p.id} className="px-4 py-2 flex items-center justify-between bg-amber-50/20">
                <div>
                  <span className="font-mono font-bold text-xs text-primary">{p.part_number}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{p.name}</span>
                  {p.supplier_name && <span className="ml-2 text-xs text-muted-foreground/60">— {p.supplier_name}</span>}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-amber-600 font-bold">Stock: {p.stock_quantity || 0}</span>
                  <span className="text-muted-foreground">Min: {p.min_stock_level}</span>
                  {p.reorder_qty > 0 && <span className="text-muted-foreground">Reorder: {p.reorder_qty}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}