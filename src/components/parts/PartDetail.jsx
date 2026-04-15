import { base44 } from "@/api/base44Client";
import { X, Edit3, Package, AlertTriangle, DollarSign, Warehouse, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import FitmentDisplay from "./FitmentDisplay";

export default function PartDetail({ part, onClose, onEdit, onUpdated }) {
  const lowStock = part.min_stock_level > 0 && part.stock_quantity <= part.min_stock_level;
  const outOfStock = part.stock_quantity === 0;

  const marginPct = part.unit_cost > 0 && part.sell_price > 0
    ? (((part.sell_price - part.unit_cost) / part.sell_price) * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl mx-4">

        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-start justify-between rounded-t-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-primary font-bold text-lg">{part.part_number}</span>
              <StatusBadge status={part.status} />
              {part.is_critical && <span className="bg-red-500/20 text-red-400 text-[10px] font-heading font-bold px-2 py-0.5 rounded-sm border border-red-500/30 uppercase tracking-wider">Critical</span>}
            </div>
            <p className="font-heading text-white/50 text-xs uppercase tracking-wider">{part.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white mt-1"><X className="w-5 h-5" /></button>
        </div>

        {(lowStock || outOfStock) && (
          <div className={`border-b px-6 py-2 flex items-center gap-2 ${outOfStock ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
            <AlertTriangle className={`w-4 h-4 ${outOfStock ? "text-red-400" : "text-amber-400"}`} />
            <span className={`font-heading text-xs uppercase tracking-wider font-semibold ${outOfStock ? "text-red-400" : "text-amber-400"}`}>
              {outOfStock ? "Out of Stock — Reorder Required" : `Low Stock — ${part.stock_quantity} remaining (min: ${part.min_stock_level})`}
            </span>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Part Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">Part Details</span>
            </div>
            <div className="space-y-2 text-sm">
              {part.brand && <div className="flex gap-2"><span className="text-muted-foreground w-28 flex-shrink-0">Brand</span><span className="font-medium">{part.brand}</span></div>}
              {part.category && <div className="flex gap-2"><span className="text-muted-foreground w-28 flex-shrink-0">Category</span><span className="font-medium capitalize">{part.category}</span></div>}
              {part.oem_number && <div className="flex gap-2"><span className="text-muted-foreground w-28 flex-shrink-0">OEM #</span><span className="font-mono">{part.oem_number}</span></div>}
              {part.aftermarket_number && <div className="flex gap-2"><span className="text-muted-foreground w-28 flex-shrink-0">Aftermarket #</span><span className="font-mono">{part.aftermarket_number}</span></div>}
              {part.cross_references && <div className="flex gap-2"><span className="text-muted-foreground w-28 flex-shrink-0">Cross Refs</span><span className="font-mono text-xs">{part.cross_references}</span></div>}

              {part.supplier_name && <div className="flex gap-2"><span className="text-muted-foreground w-28 flex-shrink-0">Supplier</span><span className="font-medium">{part.supplier_name}</span></div>}
            </div>
            {part.description && (
              <div className="mt-4 bg-muted/50 rounded-sm p-3 text-sm text-foreground/70 border-l-2 border-primary/40">
                {part.description}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">Pricing</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Cost</div>
                <div className="font-heading text-lg font-bold text-foreground">${(part.unit_cost || 0).toFixed(2)}</div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-sm p-3">
                <div className="font-heading text-[10px] uppercase tracking-wider text-primary/60 mb-1">Sell Price</div>
                <div className="font-heading text-lg font-bold text-primary">${(part.sell_price || 0).toFixed(2)}</div>
              </div>
              {part.trade_price > 0 && (
                <div className="bg-muted/50 rounded-sm p-3">
                  <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Trade</div>
                  <div className="font-heading text-base font-bold">${(part.trade_price || 0).toFixed(2)}</div>
                </div>
              )}
              {part.fleet_price > 0 && (
                <div className="bg-muted/50 rounded-sm p-3">
                  <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Fleet</div>
                  <div className="font-heading text-base font-bold">${(part.fleet_price || 0).toFixed(2)}</div>
                </div>
              )}
              {marginPct && (
                <div className="col-span-2 bg-green-500/10 border border-green-500/20 rounded-sm p-3 flex items-center justify-between">
                  <span className="font-heading text-[10px] uppercase tracking-wider text-green-600/70">Gross Margin</span>
                  <span className="font-heading text-lg font-bold text-green-600">{marginPct}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Stock / Warehouse */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Warehouse className="w-4 h-4 text-primary" />
              <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">Stock & Location</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center bg-muted/50 rounded-sm p-3">
                <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">On Hand</div>
                <div className={`font-heading text-2xl font-bold ${outOfStock ? "text-red-500" : lowStock ? "text-amber-500" : "text-foreground"}`}>{part.stock_quantity ?? 0}</div>
              </div>
              <div className="text-center bg-muted/50 rounded-sm p-3">
                <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Min Level</div>
                <div className="font-heading text-2xl font-bold text-foreground">{part.min_stock_level ?? 0}</div>
              </div>
              <div className="text-center bg-muted/50 rounded-sm p-3">
                <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Reorder Qty</div>
                <div className="font-heading text-2xl font-bold text-foreground">{part.reorder_qty ?? 0}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              {part.location && <div className="flex gap-2"><span className="text-muted-foreground w-20 flex-shrink-0">Location</span><span className="font-mono font-bold">{part.location}</span></div>}
              {part.bin && <div className="flex gap-2"><span className="text-muted-foreground w-20 flex-shrink-0">Bin</span><span className="font-mono">{part.bin}</span></div>}
            </div>
          </div>

          {/* Fitments */}
          {part.fitments?.length > 0 && (
            <div className="col-span-2">
              <FitmentDisplay fitments={part.fitments} />
            </div>
          )}

          {/* Specs */}
          {(part.weight_kg || part.dimensions || part.barcode || part.hazardous) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-primary" />
                <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">Specifications</span>
              </div>
              <div className="space-y-2 text-sm">
                {part.weight_kg && <div className="flex gap-2"><span className="text-muted-foreground w-24 flex-shrink-0">Weight</span><span>{part.weight_kg} kg</span></div>}
                {part.dimensions && <div className="flex gap-2"><span className="text-muted-foreground w-24 flex-shrink-0">Dimensions</span><span>{part.dimensions}</span></div>}
                {part.barcode && <div className="flex gap-2"><span className="text-muted-foreground w-24 flex-shrink-0">Barcode</span><span className="font-mono">{part.barcode}</span></div>}
                {part.hazardous && <div className="flex gap-2"><span className="text-muted-foreground w-24 flex-shrink-0">Hazardous</span><span className="text-amber-500 font-semibold">Yes — DG</span></div>}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Close</Button>
          <Button onClick={onEdit} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Edit3 className="w-4 h-4 mr-1" /> Edit Part
          </Button>
        </div>
      </div>
    </div>
  );
}