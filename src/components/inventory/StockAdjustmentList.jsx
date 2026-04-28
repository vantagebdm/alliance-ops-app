import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart2 } from "lucide-react";

const STATUS_COLOR = {
  draft: "bg-gray-500/10 text-gray-400",
  pending_approval: "bg-amber-500/10 text-amber-400",
  approved: "bg-blue-500/10 text-blue-400",
  posted: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
};

const TYPE_LABEL = {
  adjustment_in: "Adj In",
  adjustment_out: "Adj Out",
  stock_correction: "Correction",
  damaged_writedown: "Damaged W/D",
  found_stock: "Found",
  lost_missing: "Lost/Missing",
  internal_use: "Internal Use",
  quarantine_move: "Quarantine",
  return_to_available: "Return Avail.",
  opening_balance: "Opening Bal.",
  other: "Other",
};

export default function StockAdjustmentList({ onNewAdjustment, partId = null }) {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let data;
      if (partId) {
        data = await base44.entities.StockAdjustment.filter({ part_id: partId }, "-created_date", 50);
      } else {
        data = await base44.entities.StockAdjustment.list("-created_date", 100);
      }
      setAdjustments(data);
      setLoading(false);
    };
    load();
  }, [partId]);

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-3">
      {adjustments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No stock adjustments yet.</p>
          {onNewAdjustment && (
            <button onClick={onNewAdjustment} className="mt-3 text-primary text-sm font-heading uppercase tracking-wider hover:underline">
              New Adjustment →
            </button>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary text-white">
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Number</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Date</th>
                {!partId && <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Part #</th>}
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Reason</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Before</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Adj Qty</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">After</th>
                <th className="px-3 py-2 text-right font-heading text-[10px] uppercase tracking-wider">Value Impact</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((a, idx) => (
                <tr key={a.id} className={`border-t border-border/50 ${idx % 2 === 0 ? "bg-[hsl(0,0%,11%)]" : "bg-muted/20"}`}>
                  <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{a.adjustment_number}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(a.adjustment_date)}</td>
                  {!partId && <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{a.part_number}</td>}
                  <td className="px-3 py-2">
                    <span className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground">
                      {TYPE_LABEL[a.adjustment_type] || a.adjustment_type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground capitalize">{a.reason_code?.replace(/_/g, " ") || "—"}</td>
                  <td className="px-3 py-2 text-center font-mono text-sm">{a.qty_before ?? "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`font-bold font-mono text-sm ${a.adjustment_qty >= 0 ? "text-primary" : "text-red-500"}`}>
                      {a.adjustment_qty > 0 ? "+" : ""}{a.adjustment_qty}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-sm">{a.qty_after ?? "—"}</td>
                  <td className="px-3 py-2 text-right text-xs">
                    <span className={a.value_impact >= 0 ? "text-primary" : "text-red-500"}>
                      {a.value_impact >= 0 ? "+" : ""}${Math.abs(a.value_impact || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold ${STATUS_COLOR[a.status] || ""}`}>
                      {a.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}