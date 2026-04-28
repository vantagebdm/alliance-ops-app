import { AlertTriangle, Plus, Trash2 } from "lucide-react";

const VARIANCE_TYPES = [
  { value: "short_supply", label: "Short Supply" },
  { value: "damaged_goods", label: "Damaged Goods" },
  { value: "wrong_part", label: "Wrong Part Received" },
  { value: "excess_quantity", label: "Excess Quantity" },
  { value: "missing_paperwork", label: "Missing Paperwork" },
  { value: "cost_variance", label: "Cost Variance" },
  { value: "freight_variance", label: "Freight Variance" },
];

const ACTIONS = [
  { value: "receive_quarantine", label: "Receive into Quarantine" },
  { value: "create_supplier_claim", label: "Create Supplier Claim" },
  { value: "create_return", label: "Create Return to Supplier" },
  { value: "leave_outstanding", label: "Leave Line Outstanding" },
  { value: "close_short", label: "Close Short Supplied" },
  { value: "accept_over_supply", label: "Accept Over-Supply (with approval)" },
  { value: "pending", label: "Pending Review" },
];

const newVariance = () => ({
  _id: Math.random().toString(36).slice(2),
  line_id: "",
  part_number: "",
  variance_type: "short_supply",
  variance_note: "",
  action_taken: "pending",
  status: "open",
});

export default function VariancesPanel({ variances, onChange, lines }) {
  const addVariance = () => onChange([...variances, newVariance()]);
  const removeVariance = (idx) => onChange(variances.filter((_, i) => i !== idx));
  const updateVariance = (idx, key, val) => {
    onChange(variances.map((v, i) => i === idx ? { ...v, [key]: val } : v));
  };

  // Auto-detect discrepancies from lines
  const discrepancyLines = (lines || []).filter(l => l.condition !== "good");

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="font-heading text-base font-bold uppercase tracking-wider mb-1">Discrepancies & Exceptions</h2>
        <p className="text-xs text-muted-foreground">Log and action any discrepancies found during receipt.</p>
      </div>

      {discrepancyLines.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-amber-400">Detected from line items</span>
          </div>
          <div className="space-y-1">
            {discrepancyLines.map((l, i) => (
              <div key={i} className="text-xs text-amber-300 flex gap-3">
                <span className="font-bold">{l.part_number || "Unknown"}</span>
                <span className="capitalize">{l.condition?.replace("_", " ")}</span>
                {l.notes && <span className="text-yellow-700">— {l.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {variances.length > 0 && (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[hsl(0,0%,8%)] text-white">
              <tr>
                {["Part #", "Variance Type", "Note", "Action", "Status", ""].map(h => (
                  <th key={h} className="font-heading text-[9px] uppercase tracking-wider px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variances.map((v, idx) => (
                <tr key={v._id} className={`border-b border-border ${idx % 2 === 0 ? "bg-[hsl(0,0%,11%)]" : "bg-muted/10"}`}>
                  <td className="px-3 py-1.5">
                    <select
                      value={v.part_number || ""}
                      onChange={e => updateVariance(idx, "part_number", e.target.value)}
                      className="h-7 px-1 border border-input rounded-sm text-[10px] bg-transparent"
                    >
                      <option value="">Select line...</option>
                      {(lines || []).map((l, li) => (
                        <option key={li} value={l.part_number}>{l.part_number} — {l.description}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={v.variance_type}
                      onChange={e => updateVariance(idx, "variance_type", e.target.value)}
                      className="h-7 px-1 border border-input rounded-sm text-[10px] bg-transparent"
                    >
                      {VARIANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={v.variance_note}
                      onChange={e => updateVariance(idx, "variance_note", e.target.value)}
                      placeholder="Describe the issue..."
                      className="w-40 h-7 px-2 border border-input rounded-sm"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={v.action_taken}
                      onChange={e => updateVariance(idx, "action_taken", e.target.value)}
                      className="h-7 px-1 border border-input rounded-sm text-[10px] bg-transparent"
                    >
                      {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading font-bold uppercase ${
                      v.status === "resolved" ? "bg-green-500/10 text-green-400" :
                      v.status === "open" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                    }`}>{v.status}</span>
                  </td>
                  <td className="px-3 py-1.5">
                    <button type="button" onClick={() => removeVariance(idx)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={addVariance}
        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-heading font-bold uppercase tracking-wider"
      >
        <Plus className="w-4 h-4" /> Add Variance / Exception
      </button>
    </div>
  );
}