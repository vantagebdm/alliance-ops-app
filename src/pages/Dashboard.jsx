import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, ShoppingCart, FileText, Package, Truck, MessageSquare } from "lucide-react";
import StatsBar from "../components/dashboard/StatsBar";
import UrgentPanel from "../components/dashboard/UrgentPanel";
import QuickActions from "../components/dashboard/QuickActions";
import PageHeader from "@/components/ui/PageHeader";

export default function Dashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [enq, qt, ord, pt] = await Promise.all([
          base44.entities.Enquiry.list("-created_date", 50),
          base44.entities.Quote.list("-created_date", 50),
          base44.entities.SalesOrder.list("-created_date", 50),
          base44.entities.Part.list("-created_date", 50),
        ]);
        setEnquiries(enq);
        setQuotes(qt);
        setOrders(ord);
        setParts(pt);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const urgentEnquiries = enquiries.filter(e => e.urgency === "breakdown" || e.urgency === "urgent");
  const newEnquiries = enquiries.filter(e => e.status === "new");
  const openQuotes = quotes.filter(q => q.status === "draft" || q.status === "sent");
  const activeOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const lowStock = parts.filter(p => p.stock_quantity <= p.min_stock_level && p.min_stock_level > 0);

  const stats = [
    { label: "New Enquiries", value: newEnquiries.length, color: "text-primary" },
    { label: "Urgent / Breakdown", value: urgentEnquiries.length, color: urgentEnquiries.length > 0 ? "text-red-500" : "text-foreground" },
    { label: "Open Quotes", value: openQuotes.length, color: "text-blue-500" },
    { label: "Active Orders", value: activeOrders.length, color: "text-amber-500" },
    { label: "Low Stock Items", value: lowStock.length, color: lowStock.length > 0 ? "text-red-500" : "text-foreground" },
    { label: "Total Parts", value: parts.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Operations Dashboard" subtitle="Alliance Priority Parts — Control Panel" />

      <div className="p-6 space-y-6">
        <StatsBar stats={stats} />
        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UrgentPanel
            title="Breakdown & Urgent Requests"
            icon={AlertTriangle}
            basePath="/enquiries"
            emptyText="No urgent requests"
            items={urgentEnquiries.map(e => ({
              id: e.id,
              title: `${e.enquiry_number || "ENQ"} — ${e.part_description}`,
              subtitle: `${e.customer_name} • ${e.vehicle_make || ""} ${e.vehicle_model || ""}`,
              badge: e.urgency,
              time: e.created_date,
            }))}
          />

          <UrgentPanel
            title="New Enquiries"
            icon={MessageSquare}
            basePath="/enquiries"
            emptyText="No new enquiries"
            items={newEnquiries.map(e => ({
              id: e.id,
              title: `${e.enquiry_number || "ENQ"} — ${e.part_description}`,
              subtitle: `${e.customer_name} • ${e.source || "website"}`,
              badge: e.status,
              time: e.created_date,
            }))}
          />

          <UrgentPanel
            title="Open Quotes"
            icon={FileText}
            basePath="/quotes"
            emptyText="No open quotes"
            items={openQuotes.map(q => ({
              id: q.id,
              title: `${q.quote_number || "QT"} — ${q.customer_name}`,
              subtitle: q.company || "No company",
              badge: q.status,
              time: q.created_date,
            }))}
          />

          <UrgentPanel
            title="Active Orders"
            icon={ShoppingCart}
            basePath="/orders"
            emptyText="No active orders"
            items={activeOrders.map(o => ({
              id: o.id,
              title: `${o.order_number} — ${o.customer_name}`,
              subtitle: `$${(o.total || 0).toLocaleString()}`,
              badge: o.status,
              time: o.created_date,
            }))}
          />

          <UrgentPanel
            title="Low Stock Alerts"
            icon={Package}
            basePath="/parts"
            emptyText="Stock levels OK"
            items={lowStock.map(p => ({
              id: p.id,
              title: `${p.part_number} — ${p.name}`,
              subtitle: `Stock: ${p.stock_quantity} / Min: ${p.min_stock_level}`,
              badge: "urgent",
            }))}
          />
        </div>
      </div>
    </div>
  );
}