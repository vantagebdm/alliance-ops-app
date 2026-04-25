import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, BarChart2, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";

const KPICard = ({ label, value, sub, icon: Icon, color = "text-white", alert }) => (
  <div className={`bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 flex flex-col gap-2 ${alert ? "border-red-500/40" : ""}`}>
    <div className="flex items-center justify-between">
      <span className="font-heading text-[9px] uppercase tracking-widest text-white/30">{label}</span>
      {Icon && <Icon className={`w-4 h-4 ${color}`} />}
    </div>
    <div className={`font-heading text-xl font-bold ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-white/30">{sub}</div>}
  </div>
);

const fmt = (n) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AccountingDashboard() {
  const [bills, setBills] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SupplierBill.list(),
      base44.entities.Invoice.list(),
      base44.entities.BankTransaction.list(),
      base44.entities.BankAccount.list(),
    ]).then(([b, inv, tx, ba]) => {
      setBills(b); setInvoices(inv); setTransactions(tx); setBankAccounts(ba);
      setLoading(false);
    });
  }, []);

  const totalBank = bankAccounts.reduce((s, a) => s + (a.current_balance || 0), 0);
  const ar = invoices.filter(i => ["sent","part_paid","overdue"].includes(i.status)).reduce((s, i) => s + (i.total - (i.amount_paid || 0)), 0);
  const ap = bills.filter(b => ["approved","scheduled","overdue"].includes(b.status)).reduce((s, b) => s + (b.balance_due || b.total || 0), 0);
  const overdueInv = invoices.filter(i => i.status === "overdue");
  const overdueBills = bills.filter(b => b.status === "overdue");

  const now = new Date();
  const thisMonth = (arr) => arr.filter(i => {
    const d = new Date(i.created_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthlyRevenue = thisMonth(invoices).filter(i => i.status !== "cancelled").reduce((s, i) => s + (i.subtotal || 0), 0);
  const monthlyExpenses = thisMonth(bills).reduce((s, b) => s + (b.subtotal || 0), 0);
  const gstCollected = thisMonth(invoices).reduce((s, i) => s + (i.gst || 0), 0);
  const gstPaid = thisMonth(bills).reduce((s, b) => s + (b.gst_total || 0), 0);
  const netGST = gstCollected - gstPaid;
  const grossProfit = monthlyRevenue - monthlyExpenses;

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider mb-1">Accounting Dashboard</h2>
        <p className="text-xs text-white/40">Financial overview — {now.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}</p>
      </div>

      {/* Bank & Cashflow */}
      <div>
        <div className="font-heading text-[9px] uppercase tracking-widest text-white/30 mb-2">Bank & Cashflow</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Total Bank Balance" value={fmt(totalBank)} icon={DollarSign} color="text-primary" />
          <KPICard label="Accounts Receivable" value={fmt(ar)} icon={ArrowUpRight} color="text-blue-400" sub={`${invoices.filter(i=>["sent","part_paid","overdue"].includes(i.status)).length} open invoices`} />
          <KPICard label="Accounts Payable" value={fmt(ap)} icon={ArrowDownRight} color="text-amber-400" sub={`${bills.filter(b=>["approved","scheduled","overdue"].includes(b.status)).length} outstanding bills`} />
          <KPICard label="Net Position" value={fmt(ar - ap)} icon={BarChart2} color={ar - ap >= 0 ? "text-primary" : "text-red-400"} />
        </div>
      </div>

      {/* Monthly P&L */}
      <div>
        <div className="font-heading text-[9px] uppercase tracking-widest text-white/30 mb-2">This Month — P&L Snapshot</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Revenue" value={fmt(monthlyRevenue)} icon={TrendingUp} color="text-primary" />
          <KPICard label="Expenses" value={fmt(monthlyExpenses)} icon={TrendingDown} color="text-red-400" />
          <KPICard label="Gross Profit" value={fmt(grossProfit)} icon={BarChart2} color={grossProfit >= 0 ? "text-primary" : "text-red-400"} />
          <KPICard label="Net Profit" value={fmt(grossProfit)} color={grossProfit >= 0 ? "text-primary" : "text-red-400"} />
        </div>
      </div>

      {/* GST / BAS */}
      <div>
        <div className="font-heading text-[9px] uppercase tracking-widest text-white/30 mb-2">GST & BAS Estimate (This Month)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="GST Collected" value={fmt(gstCollected)} color="text-primary" />
          <KPICard label="GST Paid" value={fmt(gstPaid)} color="text-amber-400" />
          <KPICard label="Net GST Position" value={fmt(netGST)} color={netGST > 0 ? "text-red-400" : "text-primary"} sub={netGST > 0 ? "Payable to ATO" : "Refund from ATO"} />
          <KPICard label="BAS Estimate" value={fmt(netGST > 0 ? netGST : 0)} icon={CheckCircle} color="text-amber-400" />
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overdue Invoices */}
        <div className="bg-[hsl(0,0%,11%)] border border-red-500/30 rounded-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-heading text-xs uppercase tracking-wider text-red-400">Overdue Invoices ({overdueInv.length})</span>
          </div>
          {overdueInv.length === 0 ? (
            <div className="text-xs text-white/30">No overdue invoices</div>
          ) : (
            <div className="space-y-1.5">
              {overdueInv.slice(0, 5).map(i => (
                <div key={i.id} className="flex justify-between text-xs">
                  <span className="text-white/80">{i.customer_name}</span>
                  <span className="text-red-400 font-bold">{fmt(i.total - (i.amount_paid || 0))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bills Due */}
        <div className="bg-[hsl(0,0%,11%)] border border-amber-500/30 rounded-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-heading text-xs uppercase tracking-wider text-amber-400">Supplier Bills Due ({overdueBills.length + bills.filter(b=>b.status==="approved").length})</span>
          </div>
          {bills.filter(b=>["approved","overdue"].includes(b.status)).length === 0 ? (
            <div className="text-xs text-white/30">No bills outstanding</div>
          ) : (
            <div className="space-y-1.5">
              {bills.filter(b=>["approved","overdue"].includes(b.status)).slice(0, 5).map(b => (
                <div key={b.id} className="flex justify-between text-xs">
                  <span className={`${b.status === "overdue" ? "text-red-400" : "text-white/70"}`}>{b.supplier_name}</span>
                  <span className="text-amber-400 font-bold">{fmt(b.balance_due || b.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
        <div className="font-heading text-[9px] uppercase tracking-widest text-white/30 mb-3">Bank Accounts</div>
        {bankAccounts.length === 0 ? (
          <div className="text-xs text-white/30">No bank accounts configured. Go to Bank & Reconciliation to add accounts.</div>
        ) : (
          <div className="space-y-2">
            {bankAccounts.map(a => (
              <div key={a.id} className="flex justify-between items-center text-sm border-b border-[hsl(0,0%,18%)] pb-2 last:border-0">
                <div>
                  <span className="text-white font-medium">{a.name}</span>
                  <span className="text-white/40 text-xs ml-2">{a.bank_name}</span>
                </div>
                <div className={`font-heading font-bold text-sm ${(a.current_balance || 0) >= 0 ? "text-primary" : "text-red-400"}`}>{fmt(a.current_balance)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}