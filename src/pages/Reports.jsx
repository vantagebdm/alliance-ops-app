import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, ShoppingCart, TrendingUp, Package, Users, BarChart3, AlertTriangle, Target } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/categories";
import PageHeader from "@/components/ui/PageHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const KPICard = ({ label, value, sub, icon: Icon, color = "text-foreground" }) => (
  <div className="bg-white border border-border rounded-sm p-4">
    <div className="flex items-start justify-between">
      <div>
        <div className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-1">{label}</div>
        <div className={`font-heading text-2xl font-bold ${color}`}>{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
      <Icon className={`w-5 h-5 ${color} opacity-40`} />
    </div>
  </div>
);

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState("overview");

  useEffect(() => {
    Promise.all([
      base44.entities.SalesOrder.list("-created_date", 200),
      base44.entities.Enquiry.list("-created_date", 200),
      base44.entities.Quote.list("-created_date", 200),
      base44.entities.Part.list("-created_date", 500),
    ]).then(([ord, enq, qt, pt]) => {
      setOrders(ord);
      setEnquiries(enq);
      setQuotes(qt);
      setParts(pt);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const conversionRate = enquiries.length ? ((orders.length / enquiries.length) * 100).toFixed(1) : 0;
  const acceptedQuotes = quotes.filter(q => q.status === "accepted").length;
  const quoteConversion = quotes.length ? ((acceptedQuotes / quotes.length) * 100).toFixed(1) : 0;
  const lowStockCount = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level).length;
  const stockValue = parts.reduce((s, p) => s + (p.stock_quantity || 0) * (p.unit_cost || 0), 0);

  // Monthly revenue
  const monthlyRevenue = (() => {
    const months = {};
    orders.forEach(o => {
      const m = new Date(o.created_date).toLocaleString("en-AU", { month: "short", year: "2-digit" });
      months[m] = (months[m] || 0) + (o.total || 0);
    });
    return Object.entries(months).map(([name, revenue]) => ({ name, revenue })).slice(-8);
  })();

  // Enquiry source breakdown
  const enquirySources = (() => {
    const srcs = {};
    enquiries.forEach(e => { srcs[e.source || "website"] = (srcs[e.source || "website"] || 0) + 1; });
    return Object.entries(srcs).map(([name, count]) => ({ name: name.replace("_", " "), count })).sort((a, b) => b.count - a.count);
  })();

  // Parts and value by category
  const partsByCategory = (() => {
    const cats = {};
    parts.forEach(p => { cats[p.category || "other"] = (cats[p.category || "other"] || 0) + 1; });
    return Object.entries(cats)
      .map(([key, count]) => ({ name: CATEGORY_LABEL[key] || key, count }))
      .sort((a, b) => b.count - a.count).slice(0, 10);
  })();

  const stockValueByCategory = (() => {
    const cats = {};
    parts.forEach(p => {
      const cat = p.category || "other";
      cats[cat] = (cats[cat] || 0) + ((p.stock_quantity || 0) * (p.unit_cost || 0));
    });
    return Object.entries(cats)
      .map(([key, value]) => ({ name: CATEGORY_LABEL[key] || key, value: Math.round(value) }))
      .filter(x => x.value > 0)
      .sort((a, b) => b.value - a.value).slice(0, 10);
  })();

  const lowStockByCategory = (() => {
    const cats = {};
    parts.filter(p => p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level).forEach(p => {
      const cat = p.category || "other";
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return Object.entries(cats)
      .map(([key, count]) => ({ name: CATEGORY_LABEL[key] || key, count }))
      .sort((a, b) => b.count - a.count);
  })();

  // Order status distribution
  const orderStatuses = (() => {
    const statuses = ["pending","confirmed","processing","ready","dispatched","delivered","cancelled"];
    return statuses.map(s => ({ name: s, count: orders.filter(o => o.status === s).length })).filter(x => x.count > 0);
  })();

  // Urgency breakdown for enquiries
  const urgencyBreakdown = [
    { name: "Breakdown", count: enquiries.filter(e => e.urgency === "breakdown").length, color: "#ef4444" },
    { name: "Urgent", count: enquiries.filter(e => e.urgency === "urgent").length, color: "#f59e0b" },
    { name: "Standard", count: enquiries.filter(e => e.urgency === "standard").length, color: "#22c55e" },
  ];

  const REPORTS = [
    { value: "overview", label: "Overview" },
    { value: "sales", label: "Sales" },
    { value: "enquiries", label: "Enquiries" },
    { value: "inventory", label: "Inventory" },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader title="Reports" subtitle="Business intelligence and analytics" />
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Business intelligence — Alliance Priority Parts" />

      <div className="p-6 space-y-6">
        {/* Report Tabs */}
        <div className="flex gap-2">
          {REPORTS.map(r => (
            <button key={r.value} onClick={() => setActiveReport(r.value)}
              className={`px-4 py-2 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${activeReport === r.value ? "bg-[hsl(0,0%,8%)] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total Revenue" value={`$${Math.round(totalRevenue).toLocaleString("en-AU")}`} sub={`${orders.length} total orders`} icon={DollarSign} color="text-primary" />
          <KPICard label="Avg Order Value" value={`$${avgOrderValue.toFixed(0)}`} sub="Across all orders" icon={TrendingUp} color="text-blue-500" />
          <KPICard label="Quote Conversion" value={`${quoteConversion}%`} sub={`${acceptedQuotes} of ${quotes.length} accepted`} icon={Target} color="text-amber-500" />
          <KPICard label="Enquiry to Order" value={`${conversionRate}%`} sub={`${enquiries.length} enquiries → ${orders.length} orders`} icon={BarChart3} color="text-purple-500" />
        </div>

        {activeReport === "overview" || activeReport === "sales" ? (
          <>
            {/* Revenue by Month */}
            <div className="bg-white border border-border rounded-sm overflow-hidden">
              <div className="bg-[hsl(0,0%,8%)] px-5 py-3">
                <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Revenue by Month</h3>
              </div>
              <div className="p-6">
                {monthlyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "var(--font-heading)" }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => [`$${v.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="hsl(145, 80%, 42%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-12 text-sm">No revenue data yet — create sales orders to see data</div>
                )}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-border rounded-sm overflow-hidden">
                <div className="bg-[hsl(0,0%,8%)] px-5 py-3">
                  <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Orders by Status</h3>
                </div>
                <div className="p-4 space-y-2">
                  {orderStatuses.length > 0 ? orderStatuses.map(s => {
                    const pct = orders.length ? (s.count / orders.length * 100) : 0;
                    return (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-20 flex-shrink-0">{s.name}</span>
                        <div className="flex-1 bg-muted rounded-sm h-5 overflow-hidden">
                          <div className="h-full bg-primary rounded-sm" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-heading text-sm font-bold w-6 text-right">{s.count}</span>
                      </div>
                    );
                  }) : <div className="text-muted-foreground text-sm py-4 text-center">No order data</div>}
                </div>
              </div>

              <div className="bg-white border border-border rounded-sm overflow-hidden">
                <div className="bg-[hsl(0,0%,8%)] px-5 py-3">
                  <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Enquiry Urgency</h3>
                </div>
                <div className="p-4 space-y-2">
                  {urgencyBreakdown.map(u => {
                    const pct = enquiries.length ? (u.count / enquiries.length * 100) : 0;
                    return (
                      <div key={u.name} className="flex items-center gap-3">
                        <span className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-20 flex-shrink-0">{u.name}</span>
                        <div className="flex-1 bg-muted rounded-sm h-5 overflow-hidden">
                          <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: u.color }} />
                        </div>
                        <span className="font-heading text-sm font-bold w-6 text-right">{u.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeReport === "enquiries" || activeReport === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Enquiry Sources */}
            <div className="bg-white border border-border rounded-sm overflow-hidden">
              <div className="bg-[hsl(0,0%,8%)] px-5 py-3">
                <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Enquiries by Source</h3>
              </div>
              <div className="p-4 space-y-2">
                {enquirySources.length > 0 ? enquirySources.map(s => {
                  const pct = enquiries.length ? (s.count / enquiries.length * 100) : 0;
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-20 flex-shrink-0 capitalize">{s.name}</span>
                      <div className="flex-1 bg-muted rounded-sm h-5 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-sm" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-heading text-sm font-bold w-6 text-right">{s.count}</span>
                    </div>
                  );
                }) : <div className="text-muted-foreground text-sm py-4 text-center">No enquiry data</div>}
              </div>
            </div>

            {/* Enquiry Status */}
            <div className="bg-white border border-border rounded-sm overflow-hidden">
              <div className="bg-[hsl(0,0%,8%)] px-5 py-3">
                <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Enquiry Pipeline</h3>
              </div>
              <div className="p-4 space-y-2">
                {["new","under_review","pricing_in_progress","sourcing_in_progress","quoted","converted","closed"].map(status => {
                  const count = enquiries.filter(e => e.status === status).length;
                  const pct = enquiries.length ? (count / enquiries.length * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-28 flex-shrink-0">{status.replace(/_/g, " ")}</span>
                      <div className="flex-1 bg-muted rounded-sm h-5 overflow-hidden">
                        <div className="h-full bg-primary rounded-sm" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-heading text-sm font-bold w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {activeReport === "inventory" || activeReport === "overview" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Total SKUs" value={parts.length} sub="Active parts in catalogue" icon={Package} color="text-foreground" />
            <KPICard label="Low / Out of Stock" value={lowStockCount} sub="Items below min level" icon={AlertTriangle} color={lowStockCount > 0 ? "text-red-500" : "text-foreground"} />
            <KPICard label="Stock Cost Value" value={`$${Math.round(stockValue).toLocaleString("en-AU")}`} sub="Total cost of inventory" icon={DollarSign} color="text-blue-500" />
            <KPICard label="Parts by Category" value={partsByCategory.length} sub="Categories stocked" icon={BarChart3} color="text-purple-500" />

            {/* Parts by Category */}
            <div className="col-span-2 md:col-span-4 bg-white border border-border rounded-sm overflow-hidden">
              <div className="bg-[hsl(0,0%,8%)] px-5 py-3">
                <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Parts Count by Category</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={partsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "var(--font-heading)" }} angle={-30} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(145, 80%, 42%)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Value by Category */}
            {stockValueByCategory.length > 0 && (
              <div className="col-span-2 md:col-span-4 bg-white border border-border rounded-sm overflow-hidden">
                <div className="bg-[hsl(0,0%,8%)] px-5 py-3">
                  <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Stock Cost Value by Category</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stockValueByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "var(--font-heading)" }} angle={-30} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => [`$${v.toLocaleString("en-AU")}`, "Cost Value"]} />
                      <Bar dataKey="value" fill="hsl(210, 60%, 50%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Low Stock by Category */}
            {lowStockByCategory.length > 0 && (
              <div className="col-span-2 md:col-span-2 bg-white border border-border rounded-sm overflow-hidden">
                <div className="bg-amber-600 px-5 py-3">
                  <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Low Stock by Category</h3>
                </div>
                <div className="p-4 space-y-2">
                  {lowStockByCategory.map(c => (
                    <div key={c.name} className="flex items-center justify-between">
                      <span className="font-heading text-xs uppercase tracking-wider text-foreground/60">{c.name}</span>
                      <span className="font-heading font-bold text-amber-600">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}