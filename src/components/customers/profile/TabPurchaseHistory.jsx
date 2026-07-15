import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { SectionTitle } from "./ProfileField";
import { Loader2, Package, TrendingUp, Calendar } from "lucide-react";
import moment from "moment";

const RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "12m", label: "Last 12 Months" },
];

export default function TabPurchaseHistory({ customer }) {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [allOrders, allInvoices] = await Promise.all([
        base44.entities.SalesOrder.list("-created_date", 500),
        base44.entities.Invoice.list("-created_date", 500),
      ]);
      const match = (item) =>
        item.customer_name === customer.name ||
        (customer.company && item.company === customer.company) ||
        (customer.email && item.billing_email === customer.email);

      setOrders(allOrders.filter(match));
      setInvoices(allInvoices.filter(match));
      setLoading(false);
    };
    load();
  }, [customer]);

  const { dateFrom, dateTo, rangeLabel } = useMemo(() => {
    const now = moment();
    if (customFrom || customTo) {
      return {
        dateFrom: customFrom ? moment(customFrom) : null,
        dateTo: customTo ? moment(customTo).endOf("day") : null,
        rangeLabel: `${customFrom || "Start"} → ${customTo || "Now"}`,
      };
    }
    switch (range) {
      case "month":
        return { dateFrom: now.clone().startOf("month"), dateTo: now.clone().endOf("month"), rangeLabel: now.format("MMMM YYYY") };
      case "quarter":
        return { dateFrom: now.clone().startOf("quarter"), dateTo: now.clone().endOf("quarter"), rangeLabel: `Q${now.quarter()} ${now.year()}` };
      case "year":
        return { dateFrom: now.clone().startOf("year"), dateTo: now.clone().endOf("year"), rangeLabel: now.format("YYYY") };
      case "12m":
        return { dateFrom: now.clone().subtract(12, "months"), dateTo: now.clone(), rangeLabel: "Last 12 Months" };
      default:
        return { dateFrom: null, dateTo: null, rangeLabel: "All Time" };
    }
  }, [range, customFrom, customTo]);

  // Aggregate part quantities from both orders and invoices
  const partData = useMemo(() => {
    const partMap = new Map();

    const inDateRange = (record) => {
      if (!dateFrom && !dateTo) return true;
      const date = moment(record.created_date || record.invoice_date);
      if (dateFrom && date.isBefore(dateFrom)) return false;
      if (dateTo && date.isAfter(dateTo)) return false;
      return true;
    };

    const addItems = (record, sourceType, sourceNumber) => {
      if (!inDateRange(record)) return;
      if (record.status === "cancelled") return;
      (record.items || []).forEach((item) => {
        const partKey = item.part_number || item.description || "Unknown";
        const qty = Number(item.quantity) || 0;
        const existing = partMap.get(partKey) || { partNumber: partKey, description: item.description || "", totalQty: 0, orderCount: 0, totalValue: 0, sources: [] };
        existing.totalQty += qty;
        existing.orderCount += 1;
        existing.totalValue += Number(item.total) || (qty * (Number(item.unit_price) || 0));
        existing.sources.push({ type: sourceType, number: sourceNumber, date: record.created_date || record.invoice_date, qty });
        partMap.set(partKey, existing);
      });
    };

    orders.forEach((o) => addItems(o, "order", o.order_number));
    invoices.forEach((inv) => addItems(inv, "invoice", inv.invoice_number));

    // Deduplicate sources by order/invoice number (avoid double-counting if an order was invoiced)
    const result = Array.from(partMap.values()).map((p) => {
      const uniqueSources = new Map();
      p.sources.forEach((s) => {
        const key = s.number;
        if (!uniqueSources.has(key)) {
          uniqueSources.set(key, s);
        } else {
          const existing = uniqueSources.get(key);
          existing.qty = Math.max(existing.qty, s.qty);
        }
      });
      return {
        ...p,
        sources: Array.from(uniqueSources.values()).sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()),
      };
    });

    return result.sort((a, b) => b.totalQty - a.totalQty);
  }, [orders, invoices, dateFrom, dateTo]);

  const totalQty = partData.reduce((sum, p) => sum + p.totalQty, 0);
  const totalValue = partData.reduce((sum, p) => sum + p.totalValue, 0);
  const uniqueParts = partData.length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Purchase History — Parts Sold</SectionTitle>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/20 border border-border rounded-sm p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unique Parts</p>
          <p className="text-xl font-heading font-bold text-foreground mt-0.5">{uniqueParts}</p>
        </div>
        <div className="bg-muted/20 border border-border rounded-sm p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Qty Sold</p>
          <p className="text-xl font-heading font-bold text-primary mt-0.5">{totalQty.toLocaleString()}</p>
        </div>
        <div className="bg-muted/20 border border-border rounded-sm p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Value</p>
          <p className="text-xl font-heading font-bold text-foreground mt-0.5">${totalValue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setRange(opt.value); setCustomFrom(""); setCustomTo(""); }}
            className={`px-3 py-1.5 text-[11px] font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${
              range === opt.value && !customFrom && !customTo
                ? "bg-primary text-black"
                : "bg-[hsl(0,0%,14%)] text-white/50 hover:text-white hover:bg-[hsl(0,0%,18%)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[10px] text-muted-foreground uppercase">Custom:</span>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="bg-[hsl(0,0%,10%)] border border-border text-foreground text-xs rounded-sm px-2 py-1 focus:outline-none focus:border-primary"
          />
          <span className="text-muted-foreground text-xs">→</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="bg-[hsl(0,0%,10%)] border border-border text-foreground text-xs rounded-sm px-2 py-1 focus:outline-none focus:border-primary"
          />
        </div>
        <span className="ml-auto text-xs text-muted-foreground font-heading uppercase tracking-wider">{rangeLabel}</span>
      </div>

      {/* Parts table */}
      {partData.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm p-8 text-center">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No parts sold to this customer in the selected period.</p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="text-left">
                <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Part Number</th>
                <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Description</th>
                <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-widest text-muted-foreground text-right">Qty Sold</th>
                <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-widest text-muted-foreground text-right">Orders</th>
                <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-widest text-muted-foreground text-right">Value</th>
                <th className="px-4 py-2 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Last Ordered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {partData.map((p, i) => (
                <tr key={i} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary font-semibold">{p.partNumber}</td>
                  <td className="px-4 py-2.5 text-xs text-white/70 truncate max-w-[200px]">{p.description || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-foreground">{p.totalQty.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-white/60">{p.sources.length}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-foreground">${p.totalValue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-xs text-white/60">{p.sources[0]?.date ? moment(p.sources[0].date).format("DD/MM/YY") : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/20 border-t-2 border-border">
              <tr>
                <td colSpan={2} className="px-4 py-2.5 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Total</td>
                <td className="px-4 py-2.5 text-right font-heading font-bold text-primary">{totalQty.toLocaleString()}</td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5 text-right font-heading font-bold text-foreground">${totalValue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}