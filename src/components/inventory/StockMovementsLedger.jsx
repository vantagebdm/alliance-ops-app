import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MOVEMENT_TYPE_LABELS = {
  goods_receipt: { label: "Goods Receipt", color: "text-green-400 bg-green-500/10" },
  stock_adjustment: { label: "Adjustment", color: "text-blue-400 bg-blue-500/10" },
  stocktake_posting: { label: "Stocktake", color: "text-purple-400 bg-purple-500/10" },
  transfer_out: { label: "Transfer Out", color: "text-orange-400 bg-orange-500/10" },
  transfer_in: { label: "Transfer In", color: "text-cyan-400 bg-cyan-500/10" },
  sales_allocation: { label: "Sales Alloc.", color: "text-indigo-400 bg-indigo-500/10" },
  dispatch: { label: "Dispatch", color: "text-blue-400 bg-blue-500/10" },
  return_in: { label: "Return In", color: "text-green-400 bg-green-500/10" },
  return_out: { label: "Return Out", color: "text-red-400 bg-red-500/10" },
  warranty_hold: { label: "Warranty Hold", color: "text-amber-400 bg-amber-500/10" },
  quarantine_move: { label: "Quarantine", color: "text-amber-400 bg-amber-500/10" },
  writeoff: { label: "Write-off", color: "text-red-400 bg-red-500/10" },
  opening_balance: { label: "Opening Bal.", color: "text-gray-400 bg-gray-500/10" },
};

export default function StockMovementsLedger({ partId = null, partNumber = null }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let data;
      if (partId) {
        data = await base44.entities.StockMovement.filter({ part_id: partId }, "-movement_date", 200);
      } else if (partNumber) {
        data = await base44.entities.StockMovement.filter({ part_number: partNumber }, "-movement_date", 200);
      } else {
        data = await base44.entities.StockMovement.list("-movement_date", 200);
      }
      setMovements(data);
      setLoading(false);
    };
    load();
  }, [partId, partNumber]);

  const filtered = movements.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.part_number?.toLowerCase().includes(q) || m.movement_number?.toLowerCase().includes(q) || m.source_reference?.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || m.movement_type === typeFilter;
    return matchSearch && matchType;
  });

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; }
  };

  return (
    <div className="space-y-3">
      {!partId && !partNumber && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movements..." className="pl-9 rounded-sm" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 rounded-sm">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Movement Types</SelectItem>
              {Object.entries(MOVEMENT_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary text-white">
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Movement #</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Date</th>
                {(!partId && !partNumber) && <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Part #</th>}
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Qty In</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Qty Out</th>
                <th className="px-3 py-2 text-right font-heading text-[10px] uppercase tracking-wider">Value</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Reference</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground text-sm">No movements found.</td></tr>
              ) : filtered.map((m, idx) => {
                const typeConfig = MOVEMENT_TYPE_LABELS[m.movement_type] || { label: m.movement_type, color: "text-gray-400 bg-gray-500/10" };
                return (
                  <tr key={m.id} className={`border-t border-border/50 ${idx % 2 === 0 ? "bg-[hsl(0,0%,11%)]" : "bg-muted/20"}`}>
                    <td className="px-3 py-2 font-mono text-xs font-bold text-muted-foreground">{m.movement_number || "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(m.movement_date)}</td>
                    {(!partId && !partNumber) && <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{m.part_number}</td>}
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-heading uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-bold ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-bold text-primary">{m.qty_in > 0 ? `+${m.qty_in}` : "—"}</td>
                    <td className="px-3 py-2 text-center font-bold text-red-500">{m.qty_out > 0 ? `-${m.qty_out}` : "—"}</td>
                    <td className="px-3 py-2 text-right text-xs">
                      <span className={m.value_impact >= 0 ? "text-primary" : "text-red-500"}>
                        {m.value_impact >= 0 ? "+" : ""}${Math.abs(m.value_impact || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{m.source_reference || "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {m.to_warehouse || m.from_warehouse || "—"}
                      {(m.to_bin || m.from_bin) && <span className="ml-1 text-muted-foreground/60">/ {m.to_bin || m.from_bin}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {movements.length} movements
          </div>
        </div>
      )}
    </div>
  );
}