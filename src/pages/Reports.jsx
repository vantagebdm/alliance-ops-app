import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, TrendingUp, Package, Users, DollarSign, ShoppingCart } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SalesOrder.list("-created_date", 100),
      base44.entities.Enquiry.list("-created_date", 100),
    ]).then(([ord, enq]) => {
      setOrders(ord);
      setEnquiries(enq);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const conversionRate = enquiries.length ? ((orders.length / enquiries.length) * 100).toFixed(1) : 0;

  const REPORT_CARDS = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString("en-AU")}`, icon: DollarSign, color: "text-primary" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-500" },
    { label: "Total Enquiries", value: enquiries.length, icon: TrendingUp, color: "text-amber-500" },
    { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(0)}`, icon: BarChart3, color: "text-purple-500" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: Users, color: "text-teal-500" },
    { label: "Parts Ordered", value: orders.reduce((s, o) => s + (o.items?.length || 0), 0), icon: Package, color: "text-orange-500" },
  ];

  // Simple monthly data
  const monthlyData = (() => {
    const months = {};
    orders.forEach(o => {
      const m = new Date(o.created_date).toLocaleString("en-AU", { month: "short" });
      months[m] = (months[m] || 0) + (o.total || 0);
    });
    return Object.entries(months).map(([name, total]) => ({ name, total }));
  })();

  if (loading) {
    return (
      <div>
        <PageHeader title="Reports" subtitle="Business intelligence and analytics" />
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Business intelligence and analytics" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-sm overflow-hidden">
          {REPORT_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white p-4">
                <Icon className={`w-5 h-5 ${card.color} mb-2`} />
                <div className="font-heading text-[11px] uppercase tracking-wider text-foreground/40 mb-1">{card.label}</div>
                <div className={`font-heading text-xl font-bold ${card.color}`}>{card.value}</div>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white border border-border rounded-sm overflow-hidden">
          <div className="bg-[hsl(0,0%,8%)] px-4 py-3">
            <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Revenue by Month</h3>
          </div>
          <div className="p-6">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "var(--font-heading)" }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v.toLocaleString()}`} />
                  <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                  <Bar dataKey="total" fill="hsl(145, 80%, 42%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-12">No data available yet</div>
            )}
          </div>
        </div>

        {/* Enquiry Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-3">
              <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Enquiries by Status</h3>
            </div>
            <div className="p-4">
              {["new", "in_progress", "quoted", "converted", "closed"].map(status => {
                const count = enquiries.filter(e => e.status === status).length;
                const pct = enquiries.length ? (count / enquiries.length * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3 py-2">
                    <span className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 w-24">{status.replace("_", " ")}</span>
                    <div className="flex-1 bg-muted rounded-sm h-5 overflow-hidden">
                      <div className="h-full bg-primary rounded-sm transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-heading text-sm font-bold w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-border rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-3">
              <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">Orders by Status</h3>
            </div>
            <div className="p-4">
              {["pending", "confirmed", "processing", "ready", "dispatched", "delivered"].map(status => {
                const count = orders.filter(o => o.status === status).length;
                const pct = orders.length ? (count / orders.length * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3 py-2">
                    <span className="font-heading text-[11px] uppercase tracking-wider text-foreground/60 w-24">{status}</span>
                    <div className="flex-1 bg-muted rounded-sm h-5 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-sm transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-heading text-sm font-bold w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}