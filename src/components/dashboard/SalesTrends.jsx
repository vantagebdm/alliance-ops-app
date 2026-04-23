import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import moment from "moment";

const fmt = (v) => `$${(v / 1000).toFixed(1)}k`;

export default function SalesTrends({ invoices }) {
  // Monthly sales for last 6 months
  const monthlySales = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = moment().subtract(i, "months");
      const key = m.format("YYYY-MM");
      const label = m.format("MMM");
      const total = invoices
        .filter(inv => moment(inv.created_date).format("YYYY-MM") === key)
        .reduce((s, inv) => s + (inv.total || 0), 0);
      months.push({ label, total });
    }
    return months;
  }, [invoices]);

  // Pending invoices by status
  const pendingInvoices = useMemo(() =>
    invoices.filter(inv => ["draft", "sent", "overdue"].includes(inv.status))
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 8),
    [invoices]
  );

  const totalPending = pendingInvoices.reduce((s, i) => s + (i.total || 0), 0);
  const overdue = pendingInvoices.filter(i => i.status === "overdue");
  const thisMonth = invoices
    .filter(i => moment(i.created_date).isSame(moment(), "month"))
    .reduce((s, i) => s + (i.total || 0), 0);

  const statusColor = { draft: "text-amber-400", sent: "text-blue-400", overdue: "text-red-400" };
  const statusBg = { draft: "bg-amber-500/10 border-amber-500/30", sent: "bg-blue-500/10 border-blue-500/30", overdue: "bg-red-500/10 border-red-500/30" };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

      {/* Monthly Sales Chart */}
      <div className="bg-white border border-border rounded-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Monthly Sales</h3>
            <p className="text-[10px] text-muted-foreground font-body mt-0.5">Last 6 months · Invoice totals</p>
          </div>
          <div className="text-right">
            <div className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">This Month</div>
            <div className="font-heading text-xl font-bold text-primary">${thisMonth.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlySales} barSize={28}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "var(--font-heading)", fill: "hsl(0 0% 40%)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: "hsl(0 0% 40%)" }} axisLine={false} tickLine={false} width={45} />
            <Tooltip
              formatter={(v) => [`$${v.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`, "Sales"]}
              contentStyle={{ background: "hsl(0 0% 8%)", border: "none", borderRadius: "2px", color: "#fff", fontSize: 11 }}
              cursor={{ fill: "hsl(145 80% 42% / 0.08)" }}
            />
            <Bar dataKey="total" fill="hsl(145, 80%, 42%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Invoices */}
      <div className="bg-white border border-border rounded-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Pending Invoices</h3>
            <p className="text-[10px] text-muted-foreground font-body mt-0.5">
              {pendingInvoices.length} outstanding · {overdue.length > 0 ? <span className="text-red-500 font-semibold">{overdue.length} overdue</span> : "none overdue"}
            </p>
          </div>
          <div className="text-right">
            <div className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Total Owed</div>
            <div className="font-heading text-xl font-bold text-amber-500">${totalPending.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
        {pendingInvoices.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm font-heading uppercase tracking-wider">
            All invoices cleared ✓
          </div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto max-h-[180px]">
            {pendingInvoices.map(inv => (
              <div key={inv.id} className={`flex items-center justify-between px-3 py-2 rounded-sm border text-sm ${statusBg[inv.status] || "bg-muted/30 border-border"}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-xs text-foreground/70 flex-shrink-0">{inv.invoice_number || "—"}</span>
                  <span className="truncate text-xs text-muted-foreground">{inv.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className={`text-[10px] font-heading font-bold uppercase tracking-wider ${statusColor[inv.status] || "text-muted-foreground"}`}>{inv.status}</span>
                  <span className="font-semibold text-xs">${(inv.total || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}