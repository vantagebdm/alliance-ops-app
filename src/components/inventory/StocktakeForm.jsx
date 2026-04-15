import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, CheckCircle, AlertTriangle, Eye, EyeOff, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateDocNumber } from "@/hooks/useDocNumber";

const STOCKTAKE_TYPES = [
  { value: "full", label: "Full Stocktake" },
  { value: "partial", label: "Partial Stocktake" },
  { value: "cycle_count", label: "Cycle Count" },
  { value: "bin_count", label: "Bin Count" },
  { value: "category_count", label: "Category Count" },
  { value: "supplier_count", label: "Supplier-Specific Count" },
  { value: "equipment_type_count", label: "Equipment Type Count" },
];

const WAREHOUSES = ["Main Warehouse", "Karratha", "Port Hedland", "Newman", "Workshop", "Yard"];
const CATEGORIES = ["engine", "transmission", "brakes", "suspension", "electrical", "body", "filters", "hydraulic", "driveline", "cooling", "fuel", "exhaust", "steering", "tyres", "other"];

export default function StocktakeForm({ onClose, onSaved }) {
  const [step, setStep] = useState(1); // 1=setup, 2=count, 3=variance
  const [form, setForm] = useState({
    stocktake_name: "",
    stocktake_type: "full",
    warehouse: "Main Warehouse",
    selected_categories: [],
    count_date: new Date().toISOString().split("T")[0],
    count_mode: "blind",
    notes: "",
    status: "draft",
  });
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stocktakeId, setStocktakeId] = useState(null);
  const [stocktakeNumber, setStocktakeNumber] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generateLines = async () => {
    setLoading(true);
    let parts = await base44.entities.Part.list("-part_number", 500);
    if (form.stocktake_type === "category_count" && form.selected_categories.length > 0) {
      parts = parts.filter(p => form.selected_categories.includes(p.category));
    }
    const generatedLines = parts.map(p => ({
      _id: `${p.id}_${Date.now()}`,
      part_id: p.id,
      part_number: p.part_number,
      description: p.name,
      warehouse: form.warehouse,
      bin: p.bin || p.location || "",
      system_qty: p.stock_quantity || 0,
      counted_qty: null,
      variance_qty: 0,
      unit_cost: p.unit_cost || 0,
      variance_value: 0,
      status: "pending",
      notes: "",
      recount_required: false,
    }));
    setLines(generatedLines);
    setLoading(false);
  };

  const createStocktake = async () => {
    if (!form.stocktake_name || !form.warehouse) return;
    setSaving(true);
    const stNum = await generateDocNumber("stocktake");
    setStocktakeNumber(stNum);
    await generateLines();
    const st = await base44.entities.Stocktake.create({
      ...form,
      stocktake_number: stNum,
      status: "released",
      total_lines: lines.length,
      counted_lines: 0,
      variance_lines: 0,
    });
    setStocktakeId(st.id);
    setSaving(false);
    setStep(2);
  };

  const updateCount = (idx, qty) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const counted = parseFloat(qty);
      if (isNaN(counted) || qty === "") return { ...l, counted_qty: null };
      const variance = counted - l.system_qty;
      return {
        ...l,
        counted_qty: counted,
        variance_qty: variance,
        variance_value: variance * l.unit_cost,
        status: "counted",
      };
    }));
  };

  const submitCount = async () => {
    setSaving(true);
    const varianceLines = lines.filter(l => l.counted_qty !== null && l.variance_qty !== 0);
    const totalValueVariance = varianceLines.reduce((s, l) => s + l.variance_value, 0);
    if (stocktakeId) {
      await base44.entities.Stocktake.update(stocktakeId, {
        status: "variance_review",
        lines: lines,
        counted_lines: lines.filter(l => l.counted_qty !== null).length,
        variance_lines: varianceLines.length,
        total_value_variance: totalValueVariance,
      });
    }
    setSaving(false);
    setStep(3);
  };

  const postStocktake = async () => {
    setSaving(true);
    const varianceLines = lines.filter(l => l.counted_qty !== null && l.variance_qty !== 0);
    // Create adjustments for each variance
    for (const line of varianceLines) {
      const adjNum = await generateDocNumber("stock_adjustment");
      const movNum = await generateDocNumber("stock_movement");
      await base44.entities.StockAdjustment.create({
        adjustment_number: adjNum,
        adjustment_date: form.count_date,
        part_id: line.part_id,
        part_number: line.part_number,
        part_description: line.description,
        warehouse: form.warehouse,
        bin: line.bin,
        adjustment_type: line.variance_qty > 0 ? "adjustment_in" : "adjustment_out",
        reason_code: "count_variance",
        qty_before: line.system_qty,
        adjustment_qty: Math.abs(line.variance_qty),
        qty_after: line.counted_qty,
        unit_cost: line.unit_cost,
        value_impact: line.variance_value,
        status: "posted",
        stocktake_id: stocktakeId,
        stocktake_number: stocktakeNumber,
        notes: `Posted from stocktake ${stocktakeNumber}`,
      });
      await base44.entities.StockMovement.create({
        movement_number: movNum,
        movement_date: new Date().toISOString(),
        part_id: line.part_id,
        part_number: line.part_number,
        part_description: line.description,
        movement_type: "stocktake_posting",
        qty_in: line.variance_qty > 0 ? Math.abs(line.variance_qty) : 0,
        qty_out: line.variance_qty < 0 ? Math.abs(line.variance_qty) : 0,
        unit_cost: line.unit_cost,
        value_impact: line.variance_value,
        to_warehouse: form.warehouse,
        to_bin: line.bin,
        source_reference: stocktakeNumber,
        source_type: "stocktake_posting",
        notes: `Stocktake variance — ${stocktakeNumber}`,
      });
      // Update part qty
      if (line.part_id) {
        await base44.entities.Part.update(line.part_id, { stock_quantity: line.counted_qty });
      }
    }
    if (stocktakeId) {
      await base44.entities.Stocktake.update(stocktakeId, {
        status: "posted",
        posted_date: new Date().toISOString().split("T")[0],
        lines: lines.map(l => ({ ...l, status: l.variance_qty !== 0 ? "adjusted" : "approved" })),
      });
    }
    await base44.entities.Notification.create({
      type: "stock_adjustment",
      category: "inventory",
      priority: varianceLines.length > 5 ? "urgent" : "normal",
      title: `Stocktake Posted — ${stocktakeNumber}`,
      description: `${varianceLines.length} variance lines adjusted, total value impact: $${Math.abs(lines.reduce((s, l) => s + l.variance_value, 0)).toFixed(2)}`,
      entity_type: "Stocktake",
      entity_id: stocktakeId,
      entity_ref: stocktakeNumber,
    });
    setSaving(false);
    onSaved?.();
  };

  const varianceLines = lines.filter(l => l.counted_qty !== null && l.variance_qty !== 0);
  const countedLines = lines.filter(l => l.counted_qty !== null).length;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-secondary px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-white">
              {step === 1 ? "New Stocktake" : step === 2 ? `Count Entry — ${stocktakeNumber}` : `Variance Review — ${stocktakeNumber}`}
            </h2>
            <p className="text-white/50 text-xs mt-0.5">
              {step === 1 ? "Configure stocktake parameters" : step === 2 ? `${countedLines}/${lines.length} lines counted` : `${varianceLines.length} variances found`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicators */}
            <div className="flex gap-1.5">
              {[1,2,3].map(s => (
                <div key={s} className={`w-2 h-2 rounded-full ${step >= s ? "bg-primary" : "bg-white/20"}`} />
              ))}
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {/* STEP 1: Setup */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Stocktake Name *</label>
                  <Input value={form.stocktake_name} onChange={e => set("stocktake_name", e.target.value)} placeholder="e.g. April 2026 Full Count" className="rounded-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Stocktake Type *</label>
                  <Select value={form.stocktake_type} onValueChange={v => set("stocktake_type", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{STOCKTAKE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Warehouse *</label>
                  <Select value={form.warehouse} onValueChange={v => set("warehouse", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{WAREHOUSES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Count Date</label>
                  <Input type="date" value={form.count_date} onChange={e => set("count_date", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Count Mode</label>
                  <Select value={form.count_mode} onValueChange={v => set("count_mode", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blind">Blind Count (hide system qty)</SelectItem>
                      <SelectItem value="visible">Visible Count (show system qty)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.stocktake_type === "category_count" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Select Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c} type="button"
                        onClick={() => set("selected_categories", form.selected_categories.includes(c)
                          ? form.selected_categories.filter(x => x !== c)
                          : [...form.selected_categories, c])}
                        className={`px-2 py-1 text-xs font-heading uppercase tracking-wider rounded-sm transition-colors ${form.selected_categories.includes(c) ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/60"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                  className="flex w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[70px]"
                  placeholder="Stocktake notes..." />
              </div>
            </div>
          )}

          {/* STEP 2: Count Entry */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{countedLines}/{lines.length} counted</span>
                  {form.count_mode === "blind" ? (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm"><EyeOff className="w-3 h-3" /> Blind Mode</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm"><Eye className="w-3 h-3" /> Visible Mode</span>
                  )}
                </div>
              </div>
              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary text-white">
                      <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Part #</th>
                      <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Description</th>
                      <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Bin</th>
                      {form.count_mode === "visible" && <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">System</th>}
                      <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider w-28">Count Qty</th>
                      <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => {
                      const hasVariance = line.counted_qty !== null && line.variance_qty !== 0;
                      return (
                        <tr key={line._id} className={`border-t border-border/50 ${hasVariance ? "bg-amber-50/50" : idx % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                          <td className="px-3 py-1.5 font-mono text-xs font-bold text-primary">{line.part_number}</td>
                          <td className="px-3 py-1.5 text-xs text-muted-foreground max-w-[180px] truncate">{line.description}</td>
                          <td className="px-3 py-1.5 font-mono text-xs">{line.bin || "—"}</td>
                          {form.count_mode === "visible" && <td className="px-3 py-1.5 text-center font-bold text-sm">{line.system_qty}</td>}
                          <td className="px-3 py-1.5">
                            <input
                              type="number"
                              value={line.counted_qty ?? ""}
                              onChange={e => updateCount(idx, e.target.value)}
                              className="w-20 text-center font-bold border-b-2 border-primary bg-transparent focus:outline-none text-sm"
                              placeholder="—"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            {line.counted_qty !== null ? (
                              <span className={`font-bold text-sm ${line.variance_qty > 0 ? "text-primary" : line.variance_qty < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                                {line.variance_qty > 0 ? "+" : ""}{line.variance_qty}
                              </span>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Variance Review */}
          {step === 3 && (
            <div className="space-y-4">
              {varianceLines.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-bold uppercase">No Variances Found</h3>
                  <p className="text-muted-foreground text-sm mt-1">All counted quantities match system quantities.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <div className="font-heading font-bold text-sm uppercase text-amber-800">{varianceLines.length} Variances Found</div>
                      <div className="text-xs text-amber-700">
                        Total value impact: ${Math.abs(varianceLines.reduce((s, l) => s + l.variance_value, 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="border border-border rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary text-white">
                          <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Part #</th>
                          <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Description</th>
                          <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">System</th>
                          <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Counted</th>
                          <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Variance</th>
                          <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Value Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {varianceLines.map((line, idx) => (
                          <tr key={line._id} className={`border-t border-border/50 ${idx % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                            <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{line.part_number}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{line.description}</td>
                            <td className="px-3 py-2 text-center font-bold">{line.system_qty}</td>
                            <td className="px-3 py-2 text-center font-bold">{line.counted_qty}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`font-bold ${line.variance_qty > 0 ? "text-primary" : "text-red-500"}`}>
                                {line.variance_qty > 0 ? "+" : ""}{line.variance_qty}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`font-bold text-xs ${line.variance_value > 0 ? "text-primary" : "text-red-500"}`}>
                                {line.variance_value > 0 ? "+" : ""}${line.variance_value.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 flex justify-between items-center flex-shrink-0 bg-muted/20">
          <button onClick={step > 1 ? () => setStep(s => s - 1) : onClose}
            className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider font-heading">
            {step > 1 ? "← Back" : "Cancel"}
          </button>
          <div className="flex gap-2">
            {step === 1 && (
              <Button onClick={createStocktake} disabled={saving || !form.stocktake_name}
                className="bg-primary text-black rounded-sm font-heading text-xs uppercase tracking-wider hover:bg-primary/90">
                <ClipboardList className="w-4 h-4 mr-1" />{saving ? "Creating..." : "Create & Start Count"}
              </Button>
            )}
            {step === 2 && (
              <Button onClick={submitCount} disabled={saving || countedLines === 0}
                className="bg-primary text-black rounded-sm font-heading text-xs uppercase tracking-wider hover:bg-primary/90">
                {saving ? "Submitting..." : "Submit Count →"}
              </Button>
            )}
            {step === 3 && (
              <Button onClick={postStocktake} disabled={saving}
                className="bg-primary text-black rounded-sm font-heading text-xs uppercase tracking-wider hover:bg-primary/90">
                <CheckCircle className="w-4 h-4 mr-1" />{saving ? "Posting..." : "Approve & Post Stocktake"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}