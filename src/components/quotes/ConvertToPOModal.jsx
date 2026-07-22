import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, ShoppingCart, Loader2, Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import { generateDocNumber } from "@/hooks/useDocNumber";

const calcLineTotal = (qty, cost) => (Number(qty) || 0) * (Number(cost) || 0);

export default function ConvertToPOModal({ quote, onClose, onConverted }) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const quoteItems = quote.items || [];
      const parts = await base44.entities.Part.list(null, 2000);

      const matched = [];
      const noSupplier = [];

      quoteItems.forEach(item => {
        const part = parts.find(p =>
          p.app_part_number === item.part_number ||
          p.app_part_number === item.app_part_number ||
          p.part_number === item.part_number ||
          p.supplier_sku === item.part_number
        );

        if (!part) {
          unmatched.push(item);
          return;
        }

        const supplierName = part.supplier_name || part.preferred_supplier || "";
        const supplierPartNumber = part.supplier_sku || part.part_number || item.part_number || "";

        if (!supplierName) {
          noSupplier.push({ item, part });
          return;
        }

        matched.push({
          supplier_name: supplierName,
          supplier_id: part.supplier_id || "",
          part_number: supplierPartNumber,
          app_part_number: part.app_part_number || item.part_number,
          description: part.description || part.name || item.description,
          quantity: item.quantity || 1,
          unit_cost: part.unit_cost || 0,
          total: calcLineTotal(item.quantity, part.unit_cost || 0),
          company_note: "",
          line_reference: quote.quote_number || "",
        });
      });

      // Group by supplier name
      const grouped = {};
      matched.forEach(line => {
        if (!grouped[line.supplier_name]) {
          grouped[line.supplier_name] = { supplier_name: line.supplier_name, supplier_id: line.supplier_id, items: [] };
        }
        if (line.supplier_id && !grouped[line.supplier_name].supplier_id) {
          grouped[line.supplier_name].supplier_id = line.supplier_id;
        }
        grouped[line.supplier_name].items.push(line);
      });

      const groupArray = Object.values(grouped).map(g => {
        const subtotal = g.items.reduce((s, l) => s + (Number(l.total) || 0), 0);
        return { ...g, subtotal, gst: subtotal * 0.1, total: subtotal * 1.1 };
      });

      setGroups(groupArray);
      setUnmatched([...unmatched, ...noSupplier.map(n => ({ ...n.item, _reason: n.part ? "No supplier assigned to part" : "Part not found in catalog" }))]);
      setLoading(false);
    })();
  }, [quote.id]);

  const generatePOs = async () => {
    setGenerating(true);
    const created = [];
    for (const g of groups) {
      const poNumber = await generateDocNumber("purchase_order", "parts");
      const po = await base44.entities.PurchaseOrder.create({
        po_number: poNumber,
        supplier_name: g.supplier_name,
        supplier_id: g.supplier_id || "",
        status: "draft",
        items: g.items,
        subtotal: g.subtotal,
        gst: g.gst,
        total: g.total,
        reference: `From Quote ${quote.quote_number}`,
        notes: `Auto-generated from ${quote.quote_number} for ${quote.customer_name || ""}`.trim(),
      });
      created.push({ po_number: poNumber, supplier_name: g.supplier_name, total: g.total, id: po.id });
    }

    // Mark quote as accepted/converted
    await base44.entities.Quote.update(quote.id, { status: "accepted" });

    setResults(created);
    setDone(true);
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-sm shadow-2xl mx-4">
        {/* Header */}
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-start justify-between rounded-t-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="font-heading font-bold text-base uppercase tracking-wider">Convert to Purchase Order</span>
            </div>
            <p className="font-heading text-white/50 text-xs uppercase tracking-wider">
              {quote.quote_number} · {quote.customer_name}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white mt-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-white/50">Resolving suppliers and mapping part numbers…</p>
            </div>
          )}

          {!loading && !done && (
            <>
              <p className="text-sm text-foreground/70">
                {groups.length === 1
                  ? "1 supplier identified from the quote line items."
                  : `${groups.length} suppliers identified — a separate PO will be generated for each.`}
                {" "}App part numbers have been mapped to supplier SKUs.
              </p>

              {/* Supplier groups */}
              <div className="space-y-4">
                {groups.map((g, i) => (
                  <div key={i} className="border border-border rounded-sm overflow-hidden">
                    <div className="bg-[hsl(0,0%,8%)] px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-heading text-sm font-semibold uppercase tracking-wide">{g.supplier_name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/40">PO Total</div>
                        <div className="font-bold text-primary text-sm">${g.total.toFixed(2)}</div>
                      </div>
                    </div>
                    <table className="w-full text-xs">
                      <thead className="bg-[hsl(0,0%,10%)] border-b border-border">
                        <tr>
                          <th className="text-left px-3 py-1.5 font-heading text-[9px] uppercase tracking-wider text-white/40">Supplier Part #</th>
                          <th className="text-left px-3 py-1.5 font-heading text-[9px] uppercase tracking-wider text-white/40">Description</th>
                          <th className="text-right px-3 py-1.5 font-heading text-[9px] uppercase tracking-wider text-white/40">Qty</th>
                          <th className="text-right px-3 py-1.5 font-heading text-[9px] uppercase tracking-wider text-white/40">Unit Cost</th>
                          <th className="text-right px-3 py-1.5 font-heading text-[9px] uppercase tracking-wider text-white/40">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.items.map((item, j) => (
                          <tr key={j} className="border-b border-border/40">
                            <td className="px-3 py-2 font-mono text-primary">{item.part_number || "—"}</td>
                            <td className="px-3 py-2 text-white/70">{item.description}</td>
                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">${(item.unit_cost || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-semibold">${(item.total || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Unmatched items */}
              {unmatched.length > 0 && (
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-sm p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-heading text-xs font-semibold uppercase tracking-wider text-amber-400">
                      {unmatched.length} item{unmatched.length > 1 ? "s" : ""} excluded
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mb-2">These items could not be matched to a supplier and will not be included in any PO:</p>
                  <div className="space-y-1">
                    {unmatched.map((item, i) => (
                      <div key={i} className="text-xs text-white/60 flex justify-between">
                        <span className="font-mono text-amber-400/80">{item.app_part_number || item.part_number}</span>
                        <span>{item.description}</span>
                        <span className="text-white/30">{item._reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Results */}
          {done && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
                <p className="font-heading text-base font-semibold uppercase tracking-wider">POs Generated</p>
                <p className="text-sm text-white/50">Quote marked as accepted.</p>
              </div>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between border border-border rounded-sm px-4 py-3 bg-muted/30">
                    <div>
                      <span className="font-mono text-primary font-bold text-sm">{r.po_number}</span>
                      <span className="text-white/40 text-xs ml-2">{r.supplier_name}</span>
                    </div>
                    <span className="font-semibold text-sm">${r.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">
            {done ? "Close" : "Cancel"}
          </Button>
          {!done && (
            <Button
              onClick={generatePOs}
              disabled={generating || groups.length === 0}
              className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating…</>
              ) : (
                <><ShoppingCart className="w-4 h-4 mr-1" /> Generate {groups.length} PO{groups.length > 1 ? "s" : ""}</>
              )}
            </Button>
          )}
          {done && (
            <Button onClick={() => onConverted && onConverted()} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}