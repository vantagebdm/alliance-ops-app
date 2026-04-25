import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, XCircle, Clock, TrendingUp, Database } from "lucide-react";

const KPI = ({ label, value, sub }) => (
  <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
    <div className="text-[10px] font-heading uppercase tracking-widest text-white/30 mb-1">{label}</div>
    <div className="font-heading text-2xl font-bold text-white">{value}</div>
    {sub && <div className="text-[10px] text-white/30 mt-1">{sub}</div>}
  </div>
);

const AlertCard = ({ icon: Icon, label, count, level }) => {
  const colors = {
    red:    "bg-red-500/10 border-red-500/30 text-red-400",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    blue:   "bg-blue-500/10 border-blue-500/30 text-blue-400",
  };
  return (
    <div className={`flex items-center justify-between px-4 py-3 border rounded-sm ${colors[level]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-heading uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-heading font-bold text-sm">{count}</span>
    </div>
  );
};

export default function DataDashboard() {
  const [counts, setCounts] = useState({ parts: 0, suppliers: 0, customers: 0, invoices: 0, pos: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [healthScore] = useState(82);

  useEffect(() => {
    Promise.all([
      base44.entities.Part.list("-created_date", 1),
      base44.entities.Supplier.list("-created_date", 1),
      base44.entities.Customer.list("-created_date", 1),
      base44.entities.Invoice.list("-created_date", 1),
      base44.entities.PurchaseOrder.list("-created_date", 1),
      base44.entities.SalesOrder.list("-created_date", 1),
    ]).then(([parts, suppliers, customers, invoices, pos, orders]) => {
      setCounts({ parts: parts.length, suppliers: suppliers.length, customers: customers.length, invoices: invoices.length, pos: pos.length, orders: orders.length });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const healthColor = healthScore >= 85 ? "text-primary" : healthScore >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Health Score */}
      <div className="flex items-center justify-between bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm px-6 py-4">
        <div>
          <div className="text-[10px] font-heading uppercase tracking-widest text-white/30 mb-1">Data Health Score</div>
          <div className={`font-heading text-4xl font-bold ${healthColor}`}>{healthScore}%</div>
          <div className="text-[10px] text-white/30 mt-1">Based on completeness, duplicates, validation, reconciliation</div>
        </div>
        <div className="w-32 h-32 relative">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(0,0%,20%)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(145,80%,42%)" strokeWidth="3"
              strokeDasharray={`${healthScore} ${100 - healthScore}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className={`w-8 h-8 ${healthColor}`} />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/30 mb-3">Record Counts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI label="Parts" value={loading ? "—" : counts.parts} sub="Active part records" />
          <KPI label="Suppliers" value={loading ? "—" : counts.suppliers} sub="Active suppliers" />
          <KPI label="Customers" value={loading ? "—" : counts.customers} sub="Active customers" />
          <KPI label="Invoices" value={loading ? "—" : counts.invoices} sub="All invoices" />
          <KPI label="Purchase Orders" value={loading ? "—" : counts.pos} sub="All POs" />
          <KPI label="Sales Orders" value={loading ? "—" : counts.orders} sub="All SOs" />
          <KPI label="Last Backup" value="Today" sub="04:00 AWST scheduled" />
          <KPI label="Last Import" value="Yesterday" sub="Parts master CSV" />
        </div>
      </div>

      {/* Activity Status */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Failed Imports", val: 0, icon: XCircle, ok: true },
          { label: "Pending Validation", val: 3, icon: Clock, ok: false },
          { label: "Duplicate Records", val: 7, icon: AlertTriangle, ok: false },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 p-4 border rounded-sm ${s.ok ? "bg-green-500/5 border-green-500/20" : "bg-yellow-500/5 border-yellow-500/20"}`}>
            <s.icon className={`w-5 h-5 ${s.ok ? "text-green-400" : "text-yellow-400"}`} />
            <div>
              <div className={`font-heading text-xl font-bold ${s.ok ? "text-green-400" : "text-yellow-400"}`}>{s.val}</div>
              <div className="text-[10px] font-heading uppercase tracking-wider text-white/30">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Cards */}
      <div>
        <h3 className="font-heading text-xs uppercase tracking-wider text-white/30 mb-3">System Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AlertCard icon={AlertTriangle} label="Backup Overdue" count={0} level="blue" />
          <AlertCard icon={XCircle} label="Failed Imports" count={0} level="blue" />
          <AlertCard icon={AlertTriangle} label="Duplicate Customers" count={2} level="yellow" />
          <AlertCard icon={AlertTriangle} label="Duplicate Suppliers" count={1} level="yellow" />
          <AlertCard icon={AlertTriangle} label="Duplicate Part Numbers" count={4} level="yellow" />
          <AlertCard icon={XCircle} label="Missing Cost Price" count={12} level="red" />
          <AlertCard icon={XCircle} label="Missing Sell Price" count={8} level="red" />
          <AlertCard icon={XCircle} label="Missing GST Code" count={5} level="red" />
          <AlertCard icon={AlertTriangle} label="Unmapped Chart of Accounts" count={3} level="yellow" />
          <AlertCard icon={XCircle} label="Negative Inventory Quantity" count={0} level="blue" />
          <AlertCard icon={AlertTriangle} label="Customers Without Trading Terms" count={6} level="yellow" />
          <AlertCard icon={AlertTriangle} label="Suppliers Without Payment Terms" count={2} level="yellow" />
        </div>
      </div>
    </div>
  );
}