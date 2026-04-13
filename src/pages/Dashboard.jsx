import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  AlertTriangle, ShoppingCart, FileText, Package, Truck,
  MessageSquare, TrendingUp, DollarSign, Clock, Zap,
  CheckCircle, ArrowRight
} from "lucide-react";
import UrgentPanel from "../components/dashboard/UrgentPanel";
import QuickActions from "../components/dashboard/QuickActions";
import moment from "moment";

const KPI = ({ label, value, sub, color = "text-foreground", border = "" }) => (
  <div className={`bg-white p-4 border-l-4 ${border || "border-transparent"} relative overflow-hidden`}>
    <div className="font-heading text-[10px] uppercase tracking-widest text-foreground/40 mb-1">{label}</div>
    <div className={`font-heading text-2xl font-bold ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-foreground/40 mt-0.5 font-body">{sub}</div>}
  </div>
);

export default function Dashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [enq, qt, ord, pt, po] = await Promise.all([
        base44.entities.Enquiry.list("-created_date", 100),
        base44.entities.Quote.list("-created_date", 100),
        base44.entities.SalesOrder.list("-created_date", 100),
        base44.entities.Part.list("-created_date", 200),
        base44.entities.PurchaseOrder.list("-created_date", 50),
      ]);
      setEnquiries(enq);
      setQuotes(qt);
      setOrders(ord);
      setParts(pt);
      setPOs(po);
      setLoading(false);
    };
    load();
  }, []);

  // Derived metrics
  const breakdownEnquiries = enquiries.filter(e => e.urgency === "breakdown");
  const urgentEnquiries = enquiries.filter(e => e.urgency === "urgent" || e.urgency === "breakdown");
  const newEnquiries = enquiries.filter(e => e.status === "new");
  const todayEnquiries = enquiries.filter(e => moment(e.created_date).isSame(moment(), "day"));
  const openQuotes = quotes.filter(q => ["draft", "sent"].includes(q.status));
  const expiredQuotes = quotes.filter(q => q.status === "expired" || (q.valid_until && moment(q.valid_until).isBefore(moment()) && q.status !== "accepted"));
  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const todayOrders = orders.filter(o => moment(o.created_date).isSame(moment(), "day"));
  const lowStock = parts.filter(p => p.min_stock_level > 0 && p.stock_quantity <= p.min_stock_level);
  const outOfStock = parts.filter(p => p.stock_quantity === 0 && p.min_stock_level > 0);
  const openPOs = pos.filter(p => !["received", "cancelled"].includes(p.status));
  const overduePOs = pos.filter(p =>
    p.expected_date && moment(p.expected_date).isBefore(moment()) && !["received", "cancelled"].includes(p.status)
  );
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">Loading Operations Data...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="bg-[hsl(0,0%,6%)] border-b border-[hsl(0,0%,12%)] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white uppercase tracking-wider">Operations Dashboard</h1>
            <p className="text-white/30 text-xs mt-1 font-body uppercase tracking-wider">
              Alliance Priority Parts · Karratha, WA · {moment().format("dddd DD MMMM YYYY")}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            {breakdownEnquiries.length > 0 && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-sm">
                <Zap className="w-4 h-4 text-red-400" />
                <span className="font-heading text-xs uppercase tracking-wider text-red-400 font-bold">
                  {breakdownEnquiries.length} BREAKDOWN{breakdownEnquiries.length > 1 ? "S" : ""}
                </span>
              </div>
            )}
            <div className="text-right">
              <div className="font-heading text-[10px] uppercase tracking-widest text-white/30">Today's Revenue</div>
              <div className="font-heading text-xl font-bold text-primary">${todayRevenue.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-px bg-border/60">
        <KPI label="New Enquiries" value={newEnquiries.length} sub={`${todayEnquiries.length} today`} color="text-primary" border="border-primary" />
        <KPI label="Breakdown / Urgent" value={urgentEnquiries.length}
          sub={breakdownEnquiries.length > 0 ? `${breakdownEnquiries.length} breakdown` : "No breakdowns"}
          color={urgentEnquiries.length > 0 ? "text-red-500" : "text-foreground"}
          border={urgentEnquiries.length > 0 ? "border-red-500" : "border-transparent"} />
        <KPI label="Open Quotes" value={openQuotes.length} sub={expiredQuotes.length > 0 ? `${expiredQuotes.length} expired` : "All current"} color="text-blue-500" border="border-blue-500" />
        <KPI label="Active Orders" value={activeOrders.length} sub={`${todayOrders.length} today`} color="text-amber-500" border="border-amber-500" />
        <KPI label="Low Stock" value={lowStock.length} sub={`${outOfStock.length} out of stock`} color={lowStock.length > 0 ? "text-red-500" : "text-foreground"} border={lowStock.length > 0 ? "border-red-500" : "border-transparent"} />
        <KPI label="Open POs" value={openPOs.length} sub={overduePOs.length > 0 ? `${overduePOs.length} overdue` : "On schedule"} color="text-purple-500" border={overduePOs.length > 0 ? "border-red-500" : "border-purple-500"} />
        <KPI label="Parts in Catalogue" value={parts.length} sub="Active & on order" color="text-foreground" />
        <KPI label="Total Revenue" value={`$${Math.round(totalRevenue / 1000)}k`} sub="All orders combined" color="text-primary" border="border-primary" />
      </div>

      <div className="p-6 space-y-6">
        {/* Breakdown alert banner */}
        {breakdownEnquiries.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-sm flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="font-heading text-sm font-bold text-red-400 uppercase tracking-wider">
                {breakdownEnquiries.length} Active Breakdown Request{breakdownEnquiries.length > 1 ? "s" : ""}
              </div>
              <div className="text-xs text-red-400/70 mt-0.5">
                {breakdownEnquiries.map(e => e.enquiry_number || "ENQ").join(", ")} — Machine{breakdownEnquiries.length > 1 ? "s" : ""} down, priority response required
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-red-400/50 ml-auto flex-shrink-0" />
          </div>
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <UrgentPanel
            title="Breakdown & Urgent"
            icon={AlertTriangle}
            basePath="/enquiries"
            emptyText="No urgent requests — all clear"
            items={urgentEnquiries.map(e => ({
              id: e.id,
              title: `${e.enquiry_number || "ENQ"} — ${e.part_description}`,
              subtitle: `${e.customer_name}${e.company ? ` · ${e.company}` : ""}`,
              badge: e.urgency,
              time: e.created_date,
            }))}
          />

          <UrgentPanel
            title="New Enquiries"
            icon={MessageSquare}
            basePath="/enquiries"
            emptyText="No new enquiries"
            items={newEnquiries.slice(0, 8).map(e => ({
              id: e.id,
              title: `${e.enquiry_number || "ENQ"} — ${e.part_description}`,
              subtitle: `${e.customer_name} · via ${(e.source || "website").replace("_", " ")}`,
              badge: e.status,
              time: e.created_date,
            }))}
          />

          <UrgentPanel
            title="Active Sales Orders"
            icon={ShoppingCart}
            basePath="/orders"
            emptyText="No active orders"
            items={activeOrders.slice(0, 8).map(o => ({
              id: o.id,
              title: `${o.order_number} — ${o.customer_name}`,
              subtitle: `$${(o.total || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}${o.company ? ` · ${o.company}` : ""}`,
              badge: o.priority !== "normal" ? o.priority : o.status,
              time: o.created_date,
            }))}
          />

          <UrgentPanel
            title="Open Quotes"
            icon={FileText}
            basePath="/quotes"
            emptyText="No open quotes"
            items={openQuotes.slice(0, 8).map(q => ({
              id: q.id,
              title: `${q.quote_number || "QT"} — ${q.customer_name}`,
              subtitle: `$${(q.total || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}${q.valid_until ? ` · Expires ${moment(q.valid_until).format("DD/MM")}` : ""}`,
              badge: q.status,
              time: q.created_date,
            }))}
          />

          <UrgentPanel
            title="Low Stock Alerts"
            icon={Package}
            basePath="/inventory"
            emptyText="All stock levels healthy"
            items={lowStock.slice(0, 8).map(p => ({
              id: p.id,
              title: `${p.part_number} — ${p.name}`,
              subtitle: `${p.stock_quantity} on hand / Min: ${p.min_stock_level}${p.supplier_name ? ` · ${p.supplier_name}` : ""}`,
              badge: p.stock_quantity === 0 ? "out_of_stock" : "urgent",
            }))}
          />

          <UrgentPanel
            title="Open Purchase Orders"
            icon={Truck}
            basePath="/purchasing"
            emptyText="No open purchase orders"
            items={openPOs.slice(0, 8).map(po => ({
              id: po.id,
              title: `${po.po_number} — ${po.supplier_name}`,
              subtitle: `$${(po.total || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}${po.expected_date ? ` · ETA ${moment(po.expected_date).format("DD/MM")}` : ""}`,
              badge: overduePOs.find(o => o.id === po.id) ? "overdue" : po.status,
              time: po.created_date,
            }))}
          />
        </div>
      </div>
    </div>
  );
}