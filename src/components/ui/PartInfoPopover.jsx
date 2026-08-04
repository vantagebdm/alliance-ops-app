import { Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export default function PartInfoPopover({ part }) {
  if (!part) return null;

  const cost = part.landed_cost || part.unit_cost || 0;
  const onHand = Number(part.stock_quantity || 0) - Number(part.allocated_stock || 0);
  const lowStock = Number(part.stock_quantity || 0) <= Number(part.min_stock_level || 0) && part.min_stock_level;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
          <Info className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-56 p-3 rounded-md border border-border bg-popover text-popover-foreground shadow-xl">
        <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-2">Part Info</div>
        <div className="flex justify-between items-center py-1 border-b border-border/40">
          <span className="text-xs text-muted-foreground">Cost Price</span>
          <span className="text-sm font-semibold font-mono">${Number(cost).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-border/40">
          <span className="text-xs text-muted-foreground">Qty On Hand</span>
          <span className={`text-sm font-semibold font-mono ${onHand <= 0 ? "text-red-400" : "text-foreground"}`}>{onHand}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-muted-foreground">Allocated</span>
          <span className="text-sm font-mono text-foreground/80">{Number(part.allocated_stock || 0)}</span>
        </div>
        {lowStock && (
          <div className="mt-2 px-2 py-1 rounded-sm bg-amber-500/10 text-amber-400 text-[10px] font-heading uppercase tracking-wider text-center">
            Low Stock
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}