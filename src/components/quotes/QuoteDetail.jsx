import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Edit3, FileText, ShoppingCart, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/ui/StatusBadge";
import moment from "moment";
import ConvertToPOModal from "./ConvertToPOModal";

export default function QuoteDetail({ quote, onClose, onUpdated, onEdit }) {
  const [status, setStatus] = useState(quote.status);
  const [items, setItems] = useState(quote.items || []);
  const [showConvertPO, setShowConvertPO] = useState(false);

  // Enrich items with app_part_number if missing
  useState(() => {
    const needsLookup = (quote.items || []).some(i => !i.app_part_number && i.part_number);
    if (!needsLookup) return;
    base44.entities.Part.list(null, 1000).then(parts => {
      const enriched = (quote.items || []).map(item => {
        if (item.app_part_number) return item;
        const match = parts.find(p =>
          p.part_number === item.part_number ||
          p.supplier_sku === item.part_number ||
          p.app_part_number === item.part_number
        );
        return match ? { ...item, app_part_number: match.app_part_number || item.part_number } : item;
      });
      setItems(enriched);
    });
  });

  const handleStatusChange = async (val) => {
    setStatus(val);
    await base44.entities.Quote.update(quote.id, { status: val });
    onUpdated && onUpdated();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-sm shadow-2xl mx-4">

        {/* Header */}
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-start justify-between rounded-t-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-primary font-bold text-lg">{quote.quote_number || "QUOTE"}</span>
              <StatusBadge status={status} />
            </div>
            <p className="font-heading text-white/50 text-xs uppercase tracking-wider">
              {quote.customer_name}{quote.company ? ` · ${quote.company}` : ""} · {moment(quote.created_date).format("DD MMM YYYY")}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white mt-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Customer</div>
              <div className="font-semibold">{quote.customer_name}</div>
              {quote.company && <div className="text-muted-foreground">{quote.company}</div>}
            </div>
            {quote.customer_email && (
              <div>
                <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Email</div>
                <div>{quote.customer_email}</div>
              </div>
            )}
            <div>
              <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Valid Until</div>
              <div>{quote.valid_until ? moment(quote.valid_until).format("DD MMM YYYY") : "—"}</div>
            </div>
            <div>
              <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Status</div>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="rounded-sm h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["draft","sent","accepted","rejected","expired"].map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line items */}
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2.5">
              <span className="font-heading text-xs font-semibold text-white uppercase tracking-wider">Line Items</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[hsl(0,0%,10%)] border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Part #</th>
                  <th className="text-left px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Description</th>
                  <th className="text-right px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Qty</th>
                  <th className="text-right px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Unit</th>
                  <th className="text-right px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((line, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="px-4 py-3 font-mono text-xs text-primary align-top">{line.app_part_number || line.part_number || "—"}</td>
                    <td className="px-4 py-3 text-foreground">
                      {line.description}
                      {(line.eta_days || line.eta_comment) && (
                        <div className="mt-1 text-xs text-amber-400 flex items-center gap-2">
                          {line.eta_days && <span className="font-semibold">ETA: {line.eta_days} days</span>}
                          {line.eta_days && line.eta_comment && <span className="text-white/20">·</span>}
                          {line.eta_comment && <span>{line.eta_comment}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right align-top">{line.quantity}</td>
                    <td className="px-4 py-3 text-right align-top">${(line.unit_price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold align-top">${(line.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 flex justify-end border-t border-border bg-muted/30">
              <div className="w-56 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-heading text-[10px] uppercase tracking-wider">Subtotal</span>
                  <span>${(quote.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-heading text-[10px] uppercase tracking-wider">GST (10%)</span>
                  <span>${(quote.gst || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                  <span className="font-heading uppercase tracking-wider">Total</span>
                  <span className="text-primary">${(quote.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="bg-muted/50 rounded-sm p-3 text-sm text-foreground/70 border-l-2 border-primary/40">
              {quote.notes}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Close</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit} className="rounded-sm font-heading text-xs uppercase tracking-wider">
              <Edit3 className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button onClick={() => setShowConvertPO(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <ShoppingCart className="w-4 h-4 mr-1" /> Convert to Purchase Order
            </Button>
          </div>
        </div>

        {showConvertPO && (
          <ConvertToPOModal
            quote={{ ...quote, items }}
            onClose={() => setShowConvertPO(false)}
            onConverted={() => {
              setShowConvertPO(false);
              onUpdated && onUpdated();
              onClose && onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}