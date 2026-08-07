import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, History, Receipt, FileText, ShoppingCart, Loader2 } from "lucide-react";

const fmt = (n) => `$${Number(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }) : "—");

const SOURCES = [
  { key: "invoice", label: "Invoice", icon: Receipt, entity: "Invoice", numberField: "invoice_number", dateField: "invoice_date" },
  { key: "quote", label: "Quote", icon: FileText, entity: "Quote", numberField: "quote_number", dateField: "created_date" },
  { key: "order", label: "Sales Order", icon: ShoppingCart, entity: "SalesOrder", numberField: "order_number", dateField: "created_date" },
];

function matchesItem(item, part) {
  const candidates = [part.part_number, part.app_part_number, part.supplier_sku, part.oem_number].filter(Boolean).map((s) => String(s).trim().toLowerCase());
  const itemPN = String(item.part_number || item.app_part_number || item.supplier_sku || "").trim().toLowerCase();
  return candidates.some((c) => c && (itemPN === c));
}

export default function PartSalesHistory({ part, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const all = [];
      for (const src of SOURCES) {
        try {
          const records = await base44.entities[src.entity].list("-created_date", 500);
          for (const rec of records || []) {
            const matchedItems = (rec.items || []).filter((it) => matchesItem(it, part));
            if (matchedItems.length > 0) {
              for (const it of matchedItems) {
                all.push({
                  source: src.key,
                  sourceLabel: src.label,
                  icon: src.icon,
                  docNumber: rec[src.numberField],
                  date: rec[src.dateField] || rec.created_date,
                  customerName: rec.customer_name || "—",
                  company: rec.company || "",
                  quantity: Number(it.quantity || 0),
                  unitPrice: Number(it.unit_price || 0),
                  total: Number(it.total || it.quantity * it.unit_price || 0),
                  recordId: rec.id,
                });
              }
            }
          }
        } catch (_) {}
      }
      all.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      if (!cancelled) {
        setRows(all);
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [part.id]);

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalValue = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="bg-[hsl(0,0%,10%)] w-full max-w-5xl rounded-sm shadow-2xl mx-4">
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-heading text-sm uppercase tracking-wider text-white/90">Sale History</h2>
              <p className="text-xs text-white/40 font-mono">{part.app_part_number || part.part_number} · {part.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-3 border-b border-[hsl(0,0%,16%)] grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-sm p-2.5 text-center">
            <div className="font-heading text-[10px] uppercase tracking-wider text-white/40">Transactions</div>
            <div className="font-heading text-xl font-bold text-white">{rows.length}</div>
          </div>
          <div className="bg-muted/50 rounded-sm p-2.5 text-center">
            <div className="font-heading text-[10px] uppercase tracking-wider text-white/40">Total Qty Sold</div>
            <div className="font-heading text-xl font-bold text-primary">{totalQty}</div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-sm p-2.5 text-center">
            <div className="font-heading text-[10px] uppercase tracking-wider text-primary/60">Total Value</div>
            <div className="font-heading text-xl font-bold text-primary">{fmt(totalValue)}</div>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-white/40 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Scanning invoices, quotes & orders...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-white/40 text-sm">No sale history found for this part.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[hsl(0,0%,8%)]">
                <tr className="text-left border-b border-[hsl(0,0%,16%)]">
                  <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-white/40">Date</th>
                  <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-white/40">Type</th>
                  <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-white/40">Doc #</th>
                  <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-white/40">Client</th>
                  <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-white/40">Company</th>
                  <th className="px-4 py-2 text-right font-heading text-[10px] uppercase tracking-wider text-white/40">Qty</th>
                  <th className="px-4 py-2 text-right font-heading text-[10px] uppercase tracking-wider text-white/40">Unit Price</th>
                  <th className="px-4 py-2 text-right font-heading text-[10px] uppercase tracking-wider text-white/40">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <tr key={i} className="border-b border-[hsl(0,0%,14%)] hover:bg-white/5">
                      <td className="px-4 py-2 text-white/70 whitespace-nowrap">{fmtDate(r.date)}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-white/60">
                          <Icon className="w-3.5 h-3.5 text-primary/70" /> {r.sourceLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-white/90">{r.docNumber || "—"}</td>
                      <td className="px-4 py-2 text-white/80">{r.customerName}</td>
                      <td className="px-4 py-2 text-white/50">{r.company || "—"}</td>
                      <td className="px-4 py-2 text-right text-white/90 font-medium">{r.quantity}</td>
                      <td className="px-4 py-2 text-right text-white/60">{fmt(r.unitPrice)}</td>
                      <td className="px-4 py-2 text-right text-primary font-medium">{fmt(r.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 bg-muted/30 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 h-9 rounded-sm border border-input text-white/70 text-xs font-heading uppercase tracking-wider hover:bg-white/5">Close</button>
        </div>
      </div>
    </div>
  );
}