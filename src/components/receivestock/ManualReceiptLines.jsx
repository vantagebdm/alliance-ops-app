import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MANUAL_REASONS = [
  "Initial Stock Load",
  "Emergency Purchase",
  "Counter Purchase",
  "Replacement Stock",
  "Found Stock",
  "Internal Adjustment In",
  "Other",
];

const CONDITIONS = [
  { value: "good", label: "Good" },
  { value: "damaged", label: "Damaged" },
  { value: "short_supplied", label: "Short Supplied" },
  { value: "incorrect_item", label: "Incorrect Item" },
  { value: "quarantine", label: "Quarantine" },
];

const newLine = () => ({
  _id: Math.random().toString(36).slice(2),
  part_number: "",
  description: "",
  qty_received_now: 1,
  unit_cost: 0,
  freight_allocated: 0,
  landed_cost: 0,
  warehouse: "",
  bin: "",
  condition: "good",
  destination: "available_stock",
  notes: "",
  selected: true,
});

export default function ManualReceiptLines({ lines, onChange, form, update }) {
  const [partSearch, setPartSearch] = useState({});

  const addLine = () => onChange([...lines, newLine()]);

  const removeLine = (idx) => onChange(lines.filter((_, i) => i !== idx));

  const updateLine = (idx, key, val) => {
    const updated = lines.map((l, i) => {
      if (i !== idx) return l;
      const line = { ...l, [key]: val };
      if (key === "unit_cost" || key === "freight_allocated") {
        line.landed_cost = (parseFloat(line.unit_cost || 0) + parseFloat(key === "freight_allocated" ? val : line.freight_allocated || 0));
      }
      return line;
    });
    onChange(updated);
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="font-heading text-base font-bold uppercase tracking-wider mb-1">Manual Stock Receipt</h2>
        <p className="text-xs text-muted-foreground">Add parts and quantities received without a purchase order.</p>
      </div>

      {/* Reason */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Reason for Manual Receipt *</label>
          <select
            value={form.manual_receipt_reason || ""}
            onChange={e => update("manual_receipt_reason", e.target.value)}
            className="flex h-8 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select reason...</option>
            {MANUAL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {form.manual_receipt_reason === "Other" && (
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Explain Reason *</label>
            <input
              type="text"
              value={form.notes || ""}
              onChange={e => update("notes", e.target.value)}
              placeholder="Provide reason details..."
              className="flex h-8 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Lines table */}
      <div className="overflow-x-auto border border-border rounded-sm">
        <table className="w-full text-xs">
          <thead className="bg-[hsl(0,0%,8%)] text-white">
            <tr>
              {["Part Number", "Description", "Qty", "Unit Cost $", "Freight $", "Landed $", "Warehouse", "Bin", "Condition", "Notes", ""].map(h => (
                <th key={h} className="font-heading text-[9px] uppercase tracking-wider px-2 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={line._id} className={`border-b border-border ${idx % 2 === 0 ? "bg-white" : "bg-muted/10"}`}>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={line.part_number}
                    onChange={e => updateLine(idx, "part_number", e.target.value)}
                    placeholder="Part #"
                    className="w-24 h-7 px-2 border border-input rounded-sm text-xs"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={line.description}
                    onChange={e => updateLine(idx, "description", e.target.value)}
                    placeholder="Description"
                    className="w-36 h-7 px-2 border border-input rounded-sm text-xs"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min="1"
                    value={line.qty_received_now}
                    onChange={e => updateLine(idx, "qty_received_now", parseFloat(e.target.value) || 0)}
                    className="w-14 h-7 px-2 border border-input rounded-sm text-center"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unit_cost}
                    onChange={e => updateLine(idx, "unit_cost", parseFloat(e.target.value) || 0)}
                    className="w-20 h-7 px-2 border border-input rounded-sm text-right"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.freight_allocated}
                    onChange={e => updateLine(idx, "freight_allocated", parseFloat(e.target.value) || 0)}
                    className="w-20 h-7 px-2 border border-input rounded-sm text-right"
                  />
                </td>
                <td className="px-2 py-1.5 font-bold">
                  ${((line.unit_cost || 0) + (line.freight_allocated || 0)).toFixed(2)}
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={line.warehouse}
                    onChange={e => updateLine(idx, "warehouse", e.target.value)}
                    placeholder="Warehouse"
                    className="w-24 h-7 px-2 border border-input rounded-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={line.bin}
                    onChange={e => updateLine(idx, "bin", e.target.value)}
                    placeholder="Bin"
                    className="w-16 h-7 px-2 border border-input rounded-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <select
                    value={line.condition}
                    onChange={e => updateLine(idx, "condition", e.target.value)}
                    className="h-7 px-1 border border-input rounded-sm text-[10px] bg-transparent"
                  >
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={line.notes}
                    onChange={e => updateLine(idx, "notes", e.target.value)}
                    placeholder="Notes"
                    className="w-28 h-7 px-2 border border-input rounded-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <button type="button" onClick={() => removeLine(idx)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addLine}
        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-heading font-bold uppercase tracking-wider"
      >
        <Plus className="w-4 h-4" /> Add Line
      </button>
    </div>
  );
}