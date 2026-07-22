import { useState } from "react";
import { AlertTriangle, CheckSquare, Square } from "lucide-react";
import { Input } from "@/components/ui/input";

const CONDITIONS = [
  { value: "good", label: "Good" },
  { value: "damaged", label: "Damaged" },
  { value: "short_supplied", label: "Short Supplied" },
  { value: "incorrect_item", label: "Incorrect Item" },
  { value: "quarantine", label: "Quarantine" },
  { value: "warranty_return", label: "Warranty Return" },
  { value: "replacement_stock", label: "Replacement Stock" },
];

const DESTINATIONS = [
  { value: "available_stock", label: "Available Stock" },
  { value: "quarantine", label: "Quarantine" },
  { value: "damaged_stock", label: "Damaged Stock" },
  { value: "customer_reserved", label: "Customer Reserved" },
  { value: "workshop_allocation", label: "Workshop Allocation" },
];

export default function ReceiptLines({ lines, onChange, defaultWarehouse }) {
  const [batchBin, setBatchBin] = useState("");
  const [batchWarehouse, setBatchWarehouse] = useState(defaultWarehouse || "");

  const updateLine = (idx, key, val) => {
    const updated = lines.map((l, i) => {
      if (i !== idx) return l;
      const line = { ...l, [key]: val };
      // Auto-set destination based on condition
      if (key === "condition") {
        if (val === "damaged") line.destination = "damaged_stock";
        else if (val === "quarantine") line.destination = "quarantine";
        else line.destination = "available_stock";
      }
      // Recalculate landed cost
      if (key === "unit_cost" || key === "freight_allocated" || key === "surcharge_allocated" || key === "discount") {
        line.landed_cost = (
          parseFloat(line.unit_cost || 0) +
          parseFloat(key === "freight_allocated" ? val : line.freight_allocated || 0) +
          parseFloat(key === "surcharge_allocated" ? val : line.surcharge_allocated || 0) -
          parseFloat(key === "discount" ? val : line.discount || 0)
        );
      }
      return line;
    });
    onChange(updated);
  };

  const toggleSelect = (idx) => {
    updateLine(idx, "selected", !lines[idx].selected);
  };

  const applyBatch = () => {
    const updated = lines.map(l => {
      if (!l.selected) return l;
      return {
        ...l,
        warehouse: batchWarehouse || l.warehouse,
        bin: batchBin || l.bin,
      };
    });
    onChange(updated);
  };

  const selectedCount = lines.filter(l => l.selected).length;
  const hasDiscrepancy = lines.some(l => l.condition !== "good");

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-heading text-base font-bold uppercase tracking-wider">Receipt Line Items</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{lines.length} line(s) · {selectedCount} selected</p>
        </div>

        {/* Batch actions */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={batchWarehouse}
            onChange={e => setBatchWarehouse(e.target.value)}
            placeholder="Batch warehouse"
            className="h-7 px-2 text-xs border border-input rounded-sm w-32"
          />
          <input
            type="text"
            value={batchBin}
            onChange={e => setBatchBin(e.target.value)}
            placeholder="Batch bin"
            className="h-7 px-2 text-xs border border-input rounded-sm w-24"
          />
          <button
            type="button"
            onClick={applyBatch}
            className="h-7 px-3 bg-primary text-black text-[10px] font-heading font-bold uppercase tracking-wider rounded-sm hover:bg-primary/90"
          >
            Apply to Selected
          </button>
        </div>
      </div>

      {hasDiscrepancy && (
        <div className="mb-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-sm px-4 py-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-400 font-body">One or more lines have non-Good condition. Review destination and add notes.</span>
        </div>
      )}

      <div className="border border-border rounded-sm overflow-hidden">
        <table className="w-full text-xs table-fixed">
          <colgroup>
            <col className="w-8" />
            <col className="w-32" />
            <col className="w-auto" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-24" />
            <col className="w-20" />
            <col className="w-20" />
            <col className="w-24" />
            <col className="w-20" />
            <col className="w-28" />
          </colgroup>
          <thead className="bg-[hsl(0,0%,8%)] text-white">
            <tr>
              {["", "Part #", "Description", "Ord", "Prev", "O/S", "Qty", "Unit $", "Freight $", "Landed $", "Warehouse", "Bin", "Condition"].map(h => (
                <th key={h} className="font-heading text-[9px] uppercase tracking-wider px-2 py-2 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => {
              const outstanding = Math.max(0, (line.outstanding_qty ?? (line.ordered_qty - (line.previously_received_qty || 0))));
              const isDiscrepancy = line.condition !== "good";
              return (
                <tr key={idx} className={`border-b border-border ${isDiscrepancy ? "bg-amber-500/10" : idx % 2 === 0 ? "bg-[hsl(0,0%,11%)]" : "bg-muted/10"}`}>
                  <td className="px-2 py-2">
                    <button type="button" onClick={() => toggleSelect(idx)}>
                      {line.selected
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="px-2 py-2 font-heading font-bold text-[11px] truncate">{line.part_number}</td>
                  <td className="px-2 py-2">
                    <div className="truncate text-[11px]">{line.description}</div>
                    {line.supplier_part_number && <div className="text-muted-foreground text-[9px] truncate">Sup: {line.supplier_part_number}</div>}
                    {(line.company_note || line.line_reference) && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {line.company_note && (
                          <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[8px] font-heading uppercase tracking-wide px-1 py-0.5 rounded-sm">
                            {line.company_note}
                          </span>
                        )}
                        {line.line_reference && (
                          <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-heading uppercase tracking-wide px-1 py-0.5 rounded-sm">
                            Ref: {line.line_reference}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">{line.ordered_qty || 0}</td>
                  <td className="px-2 py-2 text-center text-muted-foreground">{line.previously_received_qty || 0}</td>
                  <td className="px-2 py-2 text-center font-bold text-primary">{outstanding}</td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      value={line.qty_received_now ?? 0}
                      onChange={e => updateLine(idx, "qty_received_now", parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-1 border border-input rounded-sm text-center"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unit_cost ?? 0}
                      onChange={e => updateLine(idx, "unit_cost", parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-1 border border-input rounded-sm text-right"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.freight_allocated ?? 0}
                      onChange={e => updateLine(idx, "freight_allocated", parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-1 border border-input rounded-sm text-right"
                    />
                  </td>
                  <td className="px-2 py-2 font-bold text-[11px]">
                    ${((line.unit_cost || 0) + (line.freight_allocated || 0) + (line.surcharge_allocated || 0) - (line.discount || 0)).toFixed(2)}
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={line.warehouse || ""}
                      onChange={e => updateLine(idx, "warehouse", e.target.value)}
                      placeholder="Warehouse"
                      className="w-full h-7 px-1 border border-input rounded-sm text-[11px]"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={line.bin || ""}
                      onChange={e => updateLine(idx, "bin", e.target.value)}
                      placeholder="Bin"
                      className="w-full h-7 px-1 border border-input rounded-sm text-[11px]"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={line.condition || "good"}
                      onChange={e => updateLine(idx, "condition", e.target.value)}
                      className={`w-full h-7 px-1 border rounded-sm text-[10px] ${isDiscrepancy ? "border-amber-500/50 bg-amber-500/10" : "border-input bg-transparent"}`}
                    >
                      {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Per-line destination & notes — expanded below table */}
      {lines.some(l => l.condition !== "good") && (
        <div className="mt-3 space-y-2">
          <div className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">Discrepancy Details</div>
          {lines.map((line, idx) => line.condition !== "good" && (
            <div key={idx} className="grid grid-cols-2 gap-3 bg-amber-500/10 border border-amber-500/30 rounded-sm px-3 py-2">
              <div>
                <div className="font-heading text-[9px] uppercase tracking-wider text-amber-400 mb-1">{line.part_number} — Destination</div>
                <select
                  value={line.destination || "available_stock"}
                  onChange={e => updateLine(idx, "destination", e.target.value)}
                  className="w-full h-7 px-2 border border-amber-500/50 rounded-sm text-[11px] bg-[hsl(0,0%,13%)]"
                >
                  {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <div className="font-heading text-[9px] uppercase tracking-wider text-amber-400 mb-1">Notes *</div>
                <input
                  type="text"
                  value={line.notes || ""}
                  onChange={e => updateLine(idx, "notes", e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full h-7 px-2 border border-amber-500/50 rounded-sm text-[11px] bg-[hsl(0,0%,13%)]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual add line for manual receipts */}
    </div>
  );
}