import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardList, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

const STATUS_COLOR = {
  draft: "bg-gray-100 text-gray-600",
  released: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  submitted: "bg-purple-100 text-purple-700",
  variance_review: "bg-red-100 text-red-700",
  approved: "bg-green-100 text-green-700",
  posted: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-400",
};

export default function StocktakeList({ onNewStocktake }) {
  const [stocktakes, setStocktakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await base44.entities.Stocktake.list("-created_date", 100);
      setStocktakes(data);
      setLoading(false);
    };
    load();
  }, []);

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-3">
      {stocktakes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No stocktakes yet.</p>
          <button onClick={onNewStocktake} className="mt-3 text-primary text-sm font-heading uppercase tracking-wider hover:underline">
            Start First Stocktake →
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary text-white">
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Number</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Lines</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Variances</th>
                <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Value Impact</th>
                <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {stocktakes.map((st, idx) => (
                <tr key={st.id} className={`border-t border-border/50 ${idx % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                  <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{st.stocktake_number}</td>
                  <td className="px-3 py-2 text-sm font-medium">{st.stocktake_name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground capitalize">{st.stocktake_type?.replace(/_/g, " ")}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{st.warehouse}</td>
                  <td className="px-3 py-2 text-center text-xs text-muted-foreground">{formatDate(st.count_date)}</td>
                  <td className="px-3 py-2 text-center font-bold">{st.total_lines || 0}</td>
                  <td className="px-3 py-2 text-center">
                    {st.variance_lines > 0 ? (
                      <span className="font-bold text-amber-600 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" />{st.variance_lines}
                      </span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center text-xs">
                    {st.total_value_variance !== 0 && st.total_value_variance != null ? (
                      <span className={st.total_value_variance < 0 ? "text-red-600 font-bold" : "text-primary font-bold"}>
                        {st.total_value_variance > 0 ? "+" : ""}${st.total_value_variance?.toFixed(2)}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold ${STATUS_COLOR[st.status] || "bg-gray-100 text-gray-600"}`}>
                      {st.status?.replace(/_/g, " ")}
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