import { useState } from "react";
import { ChevronDown, ChevronUp, FileDown, ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReorderSupplierGroup({
  supplierName, parts, selectedLines, onUpdateLine,
  onCreatePO, onExportPDF, saving, savedPOId
}) {
  const [collapsed, setCollapsed] = useState(false);

  const includedLines = parts.filter(p => selectedLines[p.id]?.include);
  const subtotal = includedLines.reduce((s, p) => {
    const line = selectedLines[p.id] || {};
    return s + (line.qty || 0) * (line.unit_cost || 0);
  }, 0);

  return (
    <div className="border border-border rounded-sm bg-card overflow-hidden">
      {/* Supplier header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[hsl(0,0%,96%)] border-b border-border">
        <button onClick={() => setCollapsed(c => !c)} className="text-muted-foreground hover:text-foreground">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        <div className="flex-1">
          <span className="font-heading font-bold text-sm uppercase tracking-wider">{supplierName}</span>
          <span className="ml-3 text-xs text-muted-foreground">{includedLines.length} of {parts.length} parts selected</span>
        </div>
        <span className="font-mono font-bold text-sm text-primary">${subtotal.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">ex GST</span></span>
        <Button
          size="sm"
          variant="outline"
          onClick={onExportPDF}
          disabled={includedLines.length === 0}
          className="rounded-sm font-heading text-[10px] uppercase tracking-wider h-7"
        >
          <FileDown className="w-3 h-3 mr-1" /> PDF
        </Button>
        <Button
          size="sm"
          onClick={onCreatePO}
          disabled={saving || includedLines.length === 0 || !!savedPOId}
          className="rounded-sm font-heading text-[10px] uppercase tracking-wider h-7 bg-primary text-black hover:bg-primary/90"
        >
          {saving ? (
            <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</>
          ) : savedPOId ? (
            <><Check className="w-3 h-3 mr-1" /> PO Created</>
          ) : (
            <><ShoppingCart className="w-3 h-3 mr-1" /> Create PO</>
          )}
        </Button>
      </div>

      {!collapsed && (
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="w-8 px-3 py-2" />
              <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">APP #</th>
              <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Part # / Description</th>
              <th className="text-center px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-20">On Hand</th>
              <th className="text-center px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-20">Min</th>
              <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-24">Order Qty</th>
              <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-28">Unit Cost</th>
              <th className="text-right px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-24">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {parts.map(p => {
              const line = selectedLines[p.id] || { include: false, qty: 1, unit_cost: p.unit_cost || 0 };
              const lineTotal = (line.qty || 0) * (line.unit_cost || 0);
              const isLow = (p.stock_quantity || 0) <= (p.min_stock_level || 0);

              return (
                <tr key={p.id} className={`border-b border-border/50 ${line.include ? "" : "opacity-40"}`}>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!line.include}
                      onChange={e => onUpdateLine(p.id, { include: e.target.checked, qty: line.qty || p.reorder_qty || 1, unit_cost: line.unit_cost || p.unit_cost || 0, supplier_name: supplierName })}
                      className="w-4 h-4 accent-primary"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-[11px] text-primary font-semibold">{p.app_part_number || "—"}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-xs">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{p.part_number}</div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`font-semibold text-xs ${isLow ? "text-red-500" : "text-foreground"}`}>
                      {p.stock_quantity || 0}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-muted-foreground">{p.min_stock_level || 0}</td>
                  <td className="px-2 py-1.5 text-right">
                    <Input
                      type="number"
                      min="1"
                      value={line.qty || ""}
                      onChange={e => onUpdateLine(p.id, { qty: Number(e.target.value) })}
                      className="rounded-sm h-7 text-xs text-right w-20 ml-auto"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <Input
                      type="number"
                      step="0.01"
                      value={line.unit_cost || ""}
                      onChange={e => onUpdateLine(p.id, { unit_cost: Number(e.target.value) })}
                      className="rounded-sm h-7 text-xs text-right w-24 ml-auto"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-xs">
                    ${lineTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}