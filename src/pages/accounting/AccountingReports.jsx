import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, TrendingUp, TrendingDown, BarChart2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const fmt = (n) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

const REPORTS = [
  { id: "pl", label: "Profit & Loss" },
  { id: "bs", label: "Balance Sheet" },
  { id: "ar_aging", label: "AR Ageing" },
  { id: "ap_aging", label: "AP Ageing" },
  { id: "gst", label: "GST Report" },
  { id: "cashflow", label: "Cashflow Statement" },
];

function PLReport({ invoices, bills }) {
  const revenue = invoices.filter(i => i.status !== "cancelled").reduce((s, i) => s + (i.subtotal || 0), 0);
  const gstCollected = invoices.filter(i => i.status !== "cancelled").reduce((s, i) => s + (i.gst || 0), 0);
  const cogs = 0; // would come from inventory costing
  const grossProfit = revenue - cogs;
  const expenses = bills.reduce((s, b) => s + (b.subtotal || 0), 0);
  const netProfit = grossProfit - expenses;

  return (
    <div className="space-y-4">
      <Section title="Income">
        <Row label="Parts Sales" value={revenue} />
        <Row label="GST Collected" value={gstCollected} muted />
        <TotalRow label="Total Income" value={revenue} color="text-primary" />
      </Section>
      <Section title="Cost of Goods Sold">
        <Row label="Parts Purchases" value={cogs} />
        <TotalRow label="Total COGS" value={cogs} />
      </Section>
      <div className="bg-[hsl(0,0%,9%)] rounded-sm p-3 flex justify-between items-center">
        <span className="font-heading text-xs uppercase tracking-wider font-bold text-white">GROSS PROFIT</span>
        <span className={`font-heading font-bold text-lg ${grossProfit >= 0 ? "text-primary" : "text-red-400"}`}>{fmt(grossProfit)}</span>
      </div>
      <Section title="Operating Expenses">
        <Row label="Supplier Bills / Expenses" value={expenses} />
        <TotalRow label="Total Expenses" value={expenses} />
      </Section>
      <div className="bg-[hsl(0,0%,8%)] rounded-sm p-4 flex justify-between items-center">
        <span className="font-heading text-sm uppercase tracking-wider font-bold text-white">NET PROFIT</span>
        <span className={`font-heading font-bold text-2xl ${netProfit >= 0 ? "text-primary" : "text-red-400"}`}>{fmt(netProfit)}</span>
      </div>
    </div>
  );
}

function ARAgingReport({ invoices }) {
  const buckets = [
    { label: "Current (0–30 days)", max: 30 },
    { label: "31–60 days", min: 31, max: 60 },
    { label: "61–90 days", min: 61, max: 90 },
    { label: "90+ days", min: 91 },
  ];
  const open = invoices.filter(i => !["paid","cancelled"].includes(i.status));
  return (
    <div className="space-y-2">
      {buckets.map(b => {
        const items = open.filter(i => {
          if (!i.due_date) return b.max === 30;
          const days = Math.max(0, Math.floor((new Date() - new Date(i.due_date)) / 86400000));
          return days >= (b.min || 0) && days <= (b.max || Infinity);
        });
        const total = items.reduce((s, i) => s + (i.total - (i.amount_paid || 0)), 0);
        return (
          <div key={b.label} className={`flex justify-between items-center py-2 px-4 rounded-sm ${b.label.includes("90+") ? "bg-red-500/10" : "bg-muted/20"}`}>
            <span className="text-sm text-muted-foreground">{b.label} ({items.length} invoices)</span>
            <span className={`font-heading font-bold ${b.label.includes("90+") ? "text-red-400" : "text-foreground"}`}>{fmt(total)}</span>
          </div>
        );
      })}
      <div className="flex justify-between items-center py-3 bg-[hsl(0,0%,9%)] rounded-sm px-4 mt-2 border border-[hsl(0,0%,18%)]">
        <span className="font-heading text-xs uppercase tracking-wider font-bold text-white">TOTAL RECEIVABLE</span>
        <span className="font-heading font-bold text-lg text-primary">{fmt(open.reduce((s, i) => s + (i.total - (i.amount_paid || 0)), 0))}</span>
      </div>
    </div>
  );
}

function APAgingReport({ bills }) {
  const buckets = [
    { label: "Current (0–30 days)", max: 30 },
    { label: "31–60 days", min: 31, max: 60 },
    { label: "61–90 days", min: 61, max: 90 },
    { label: "90+ days", min: 91 },
  ];
  const open = bills.filter(b => !["paid","draft"].includes(b.status));
  return (
    <div className="space-y-2">
      {buckets.map(b => {
        const items = open.filter(i => {
          if (!i.due_date) return b.max === 30;
          const days = Math.max(0, Math.floor((new Date() - new Date(i.due_date)) / 86400000));
          return days >= (b.min || 0) && days <= (b.max || Infinity);
        });
        const total = items.reduce((s, i) => s + (i.balance_due || i.total || 0), 0);
        return (
          <div key={b.label} className={`flex justify-between items-center py-2 px-4 rounded-sm ${b.label.includes("90+") ? "bg-red-500/10" : "bg-[hsl(0,0%,12%)]"}`}>
            <span className="text-sm text-white/50">{b.label} ({items.length} bills)</span>
            <span className={`font-heading font-bold ${b.label.includes("90+") ? "text-red-400" : "text-white"}`}>{fmt(total)}</span>
          </div>
        );
      })}
      <div className="flex justify-between items-center py-3 bg-[hsl(0,0%,9%)] rounded-sm px-4 mt-2 border border-[hsl(0,0%,18%)]">
        <span className="font-heading text-xs uppercase tracking-wider font-bold text-white">TOTAL PAYABLE</span>
        <span className="font-heading font-bold text-lg text-amber-400">{fmt(open.reduce((s, i) => s + (i.balance_due || i.total || 0), 0))}</span>
      </div>
    </div>
  );
}

function GSTReport({ invoices, bills }) {
  const gstCollected = invoices.filter(i => i.status !== "cancelled").reduce((s, i) => s + (i.gst || 0), 0);
  const gstPaid = bills.reduce((s, b) => s + (b.gst_total || 0), 0);
  const net = gstCollected - gstPaid;
  return (
    <div className="space-y-3">
      <Row label="GST Collected on Sales (1A)" value={gstCollected} />
      <Row label="GST Paid on Purchases (1B)" value={gstPaid} />
      <div className="border-t border-[hsl(0,0%,18%)] pt-3 flex justify-between items-center">
        <span className="font-heading text-sm uppercase tracking-wider font-bold text-white">Net GST {net >= 0 ? "Payable" : "Refund"}</span>
        <span className={`font-heading font-bold text-xl ${net >= 0 ? "text-red-400" : "text-primary"}`}>{fmt(Math.abs(net))}</span>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="font-heading text-[9px] uppercase tracking-widest text-white/30 mb-2 px-2">{title}</div>
      <div className="border border-[hsl(0,0%,18%)] rounded-sm divide-y divide-[hsl(0,0%,16%)]">{children}</div>
    </div>
  );
}

function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between items-center px-4 py-2">
      <span className={`text-sm ${muted ? "text-white/40" : "text-white/80"}`}>{label}</span>
      <span className={`text-sm font-bold ${muted ? "text-white/40" : "text-white"}`}>{fmt(value)}</span>
    </div>
  );
}

function TotalRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center px-4 py-2 bg-[hsl(0,0%,9%)]">
      <span className="font-heading text-xs uppercase tracking-wider font-bold text-white/40">{label}</span>
      <span className={`font-heading font-bold text-sm ${color || "text-white"}`}>{fmt(value)}</span>
    </div>
  );
}

export default function AccountingReports() {
  const [activeReport, setActiveReport] = useState("pl");
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Invoice.list(),
      base44.entities.SupplierBill.list(),
    ]).then(([inv, bil]) => { setInvoices(inv); setBills(bil); setLoading(false); });
  }, []);

  const renderReport = () => {
    if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;
    switch (activeReport) {
      case "pl": return <PLReport invoices={invoices} bills={bills} />;
      case "ar_aging": return <ARAgingReport invoices={invoices} />;
      case "ap_aging": return <APAgingReport bills={bills} />;
      case "gst": return <GSTReport invoices={invoices} bills={bills} />;
      default: return <div className="text-center py-12 text-muted-foreground text-xs">Select a report</div>;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">Accounting Reports</h2>
          <p className="text-xs text-muted-foreground">Financial reporting and analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Report list */}
        <div className="bg-card border border-border rounded-sm p-2 space-y-0.5 h-fit">
          {REPORTS.map(r => (
            <button key={r.id} onClick={() => setActiveReport(r.id)}
              className={`w-full text-left px-3 py-2 rounded-sm text-xs font-heading uppercase tracking-wider transition-all ${activeReport === r.id ? "bg-primary/15 text-primary border-l-2 border-primary pl-[10px]" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Report content */}
        <div className="lg:col-span-3 bg-card border border-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider">
              {REPORTS.find(r => r.id === activeReport)?.label}
            </h3>
          </div>
          {renderReport()}
        </div>
      </div>
    </div>
  );
}