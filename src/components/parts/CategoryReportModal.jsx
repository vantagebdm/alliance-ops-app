import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, FileBarChart, ShoppingCart, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PART_CATEGORIES, CATEGORY_LABEL, CATEGORY_COLORS } from "@/lib/categories";
import { generateDocNumber } from "@/hooks/useDocNumber";

function getPeriodRange(period) {
  const now = new Date();
  const end = now;
  let start = new Date();

  if (period === "weekly") {
    const day = now.getDay() || 7; // Sunday = 7
    start = new Date(now);
    start.setDate(now.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "quarterly") {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), qMonth, 1);
  }

  return { start, end };
}

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function formatRange(start, end) {
  const fmt = (d) =>
    d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

const PERIOD_LABELS = {
  weekly: "This Week",
  monthly: "This Month",
  quarterly: "This Quarter",
};

export default function CategoryReportModal({ onClose }) {
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [creatingSupplier, setCreatingSupplier] = useState(null);
  const [createdPOs, setCreatedPOs] = useState([]);

  const generate = async () => {
    if (!category) return;
    setLoading(true);
    setCreatedPOs([]);

    const { start, end } = getPeriodRange(period);
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    // Fetch all parts in the selected category
    const allParts = await base44.entities.Part.filter({ category }, "-created_date", 500);
    const partMap = new Map();
    allParts.forEach((p) => {
      const key = (p.part_number || "").toLowerCase().trim();
      if (key) partMap.set(key, p);
    });

    // Fetch SalesOrders within the date range — fetch a large batch
    const orders = await base44.entities.SalesOrder.filter(
      { created_date: { $gte: startDate } },
      "-created_date",
      500
    );
    // Further filter by end date client-side (created_date is ISO string)
    const inRange = orders.filter((o) => {
      const d = o.created_date ? new Date(o.created_date) : null;
      return d && d <= end;
    });

    // Aggregate sold quantities per part
    const soldMap = new Map(); // partNumber(lower) -> { part, qtySold, lineTotal }
    inRange.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = (item.part_number || "").toLowerCase().trim();
        if (!key) return;
        const part = partMap.get(key);
        if (!part) return; // only parts in selected category
        const qty = Number(item.quantity) || 0;
        const existing = soldMap.get(key) || { part, qtySold: 0, lineTotal: 0 };
        existing.qtySold += qty;
        existing.lineTotal += Number(item.total) || 0;
        soldMap.set(key, existing);
      });
    });

    // Also include category parts with zero sales (for reorder context)
    allParts.forEach((p) => {
      const key = (p.part_number || "").toLowerCase().trim();
      if (!key) return;
      if (!soldMap.has(key)) {
        soldMap.set(key, { part: p, qtySold: 0, lineTotal: 0 });
      }
    });

    // Group by supplier
    const supplierGroups = {};
    soldMap.forEach(({ part, qtySold, lineTotal }) => {
      const supplier = part.supplier_name || part.preferred_supplier || "Unassigned";
      if (!supplierGroups[supplier]) {
        supplierGroups[supplier] = { supplier, parts: [], totalCost: 0, totalSold: 0 };
      }
      const reorderQty = Math.max(
        part.reorder_qty || 0,
        (part.max_stock_level || 0) - (part.stock_quantity || 0)
      );
      const suggestedQty = qtySold > 0
        ? Math.max(qtySold, reorderQty, 1)
        : Math.max(reorderQty, part.stock_quantity <= (part.min_stock_level || 0) ? 1 : 0);
      supplierGroups[supplier].parts.push({
        part,
        qtySold,
        lineTotal,
        suggestedQty,
        unitCost: part.unit_cost || part.landed_cost || 0,
      });
      supplierGroups[supplier].totalSold += qtySold;
    });

    const groups = Object.values(supplierGroups).sort((a, b) => b.totalSold - a.totalSold);

    setReport({
      category,
      period,
      start,
      end,
      totalParts: allParts.length,
      soldParts: Array.from(soldMap.values()).filter((s) => s.qtySold > 0).length,
      totalOrders: inRange.length,
      groups,
    });
    setLoading(false);
  };

  const createPO = async (group) => {
    setCreatingSupplier(group.supplier);
    try {
      const poNumber = await generateDocNumber("purchase_order", "parts");

      const lines = group.parts
        .map((p) => ({
          part_number: p.part.part_number || p.part.app_part_number || "",
          description: p.part.name || "",
          quantity: Math.max(p.suggestedQty, 1),
          unit_cost: p.unitCost,
          total: Math.round(Math.max(p.suggestedQty, 1) * p.unitCost * 100) / 100,
        }));

      const subtotal = lines.reduce((s, l) => s + l.total, 0);
      const gst = Math.round(subtotal * 0.1 * 100) / 100;

      const supplierPart = group.parts.find((p) => p.part.supplier_id)?.part;

      await base44.entities.PurchaseOrder.create({
        po_number: poNumber,
        supplier_id: supplierPart?.supplier_id || "",
        supplier_name: group.supplier,
        status: "draft",
        items: lines,
        subtotal: Math.round(subtotal * 100) / 100,
        gst,
        total: Math.round((subtotal + gst) * 100) / 100,
        notes: `Auto-generated from ${PERIOD_LABELS[period]} category report (${CATEGORY_LABEL[category]})`,
      });

      setCreatedPOs((prev) => [...prev, { supplier: group.supplier, poNumber, lineCount: lines.length }]);
    } catch (e) {
      console.error(e);
    }
    setCreatingSupplier(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto p-4 md:p-8">
      <div className="bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,18%)] rounded-md w-full max-w-5xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(0,0%,18%)]">
          <div className="flex items-center gap-3">
            <FileBarChart className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-heading text-lg font-bold uppercase tracking-wide">Category Sales & Reorder Report</h2>
              <p className="text-xs text-muted-foreground">Generate a sales-based reorder report and create purchase orders per supplier</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-[hsl(0,0%,18%)]">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select category…" /></SelectTrigger>
                <SelectContent>
                  {PART_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="quarterly">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generate}
              disabled={!category || loading}
              className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileBarChart className="w-4 h-4 mr-1" />}
              Generate Report
            </Button>
          </div>
        </div>

        {/* Report Body */}
        {report && (
          <div className="px-6 py-4 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-sm px-4 py-3">
                <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">Category</div>
                <div className={`inline-block text-xs font-heading font-bold uppercase px-2 py-0.5 rounded-sm mt-1 ${CATEGORY_COLORS[report.category] || "bg-gray-500/15 text-gray-400"}`}>
                  {CATEGORY_LABEL[report.category] || report.category}
                </div>
              </div>
              <div className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-sm px-4 py-3">
                <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">Period</div>
                <div className="text-sm font-semibold mt-1">{PERIOD_LABELS[report.period]}</div>
                <div className="text-[10px] text-muted-foreground">{formatRange(report.start, report.end)}</div>
              </div>
              <div className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-sm px-4 py-3">
                <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">Parts Sold</div>
                <div className="text-lg font-bold text-primary mt-1">{report.soldParts}</div>
                <div className="text-[10px] text-muted-foreground">of {report.totalParts} in category</div>
              </div>
              <div className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-sm px-4 py-3">
                <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">Orders in Period</div>
                <div className="text-lg font-bold mt-1">{report.totalOrders}</div>
              </div>
            </div>

            {/* Supplier Groups */}
            <div className="space-y-4">
              {report.groups.map((group) => {
                const poCreated = createdPOs.find((p) => p.supplier === group.supplier);
                return (
                  <div key={group.supplier} className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
                    {/* Supplier header */}
                    <div className="flex items-center justify-between bg-[hsl(0,0%,10%)] px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-heading text-sm font-bold uppercase tracking-wide">{group.supplier}</span>
                        <span className="text-xs text-muted-foreground">{group.parts.length} parts · {group.totalSold} sold</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => createPO(group)}
                        disabled={creatingSupplier === group.supplier || poCreated}
                        className="bg-primary text-black font-heading font-semibold uppercase text-[10px] tracking-wider hover:bg-primary/90 rounded-sm"
                      >
                        {poCreated ? (
                          <span className="flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5" /> {poCreated.poNumber}</span>
                        ) : creatingSupplier === group.supplier ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Creating…</>
                        ) : (
                          <><ShoppingCart className="w-3.5 h-3.5 mr-1" /> Create PO</>
                        )}
                      </Button>
                    </div>

                    {/* Parts table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[hsl(0,0%,18%)] text-left">
                            <th className="px-4 py-2 font-heading uppercase tracking-widest text-[9px] text-muted-foreground">Part #</th>
                            <th className="px-4 py-2 font-heading uppercase tracking-widest text-[9px] text-muted-foreground">Description</th>
                            <th className="px-4 py-2 text-right font-heading uppercase tracking-widest text-[9px] text-muted-foreground">Sold</th>
                            <th className="px-4 py-2 text-right font-heading uppercase tracking-widest text-[9px] text-muted-foreground">In Stock</th>
                            <th className="px-4 py-2 text-right font-heading uppercase tracking-widest text-[9px] text-muted-foreground">Min</th>
                            <th className="px-4 py-2 text-right font-heading uppercase tracking-widest text-[9px] text-muted-foreground">Suggest Qty</th>
                            <th className="px-4 py-2 text-right font-heading uppercase tracking-widest text-[9px] text-muted-foreground">Unit Cost</th>
                            <th className="px-4 py-2 text-right font-heading uppercase tracking-widest text-[9px] text-muted-foreground">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.parts.map(({ part, qtySold, suggestedQty, unitCost }) => {
                            const low = part.min_stock_level > 0 && part.stock_quantity <= part.min_stock_level;
                            return (
                              <tr key={part.id} className="border-b border-[hsl(0,0%,14%)] hover:bg-[hsl(0,0%,12%)]">
                                <td className="px-4 py-2 font-mono font-bold text-primary text-[11px]">{part.app_part_number || part.part_number}</td>
                                <td className="px-4 py-2">
                                  <div className="font-medium">{part.name}</div>
                                  {part.brand && <div className="text-[10px] text-muted-foreground">{part.brand}</div>}
                                </td>
                                <td className="px-4 py-2 text-right font-bold">{qtySold}</td>
                                <td className={`px-4 py-2 text-right font-semibold ${part.stock_quantity === 0 ? "text-red-500" : low ? "text-amber-500" : ""}`}>
                                  {part.stock_quantity ?? 0}
                                </td>
                                <td className="px-4 py-2 text-right text-muted-foreground">{part.min_stock_level ?? 0}</td>
                                <td className="px-4 py-2 text-right font-bold text-primary">{suggestedQty}</td>
                                <td className="px-4 py-2 text-right text-muted-foreground">${unitCost.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right font-semibold">${(suggestedQty * unitCost).toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {report.groups.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No parts found in this category.</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-[hsl(0,0%,18%)]">
          <Button onClick={onClose} variant="outline" className="rounded-sm font-heading text-xs uppercase tracking-wider border-white/20 text-white hover:bg-white/10">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}