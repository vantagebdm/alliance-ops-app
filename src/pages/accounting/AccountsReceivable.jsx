import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { postInvoicePaymentToLedger } from "@/lib/accountingLedger";
import { Search, AlertTriangle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STYLES = {
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  approved: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  sent: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  part_paid: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  paid: "bg-green-500/10 text-primary border-green-500/30",
  overdue: "bg-red-500/10 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

const fmt = (n) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

const AGING_BUCKETS = [
  { label: "Current", days: [0, 30] },
  { label: "31–60 days", days: [31, 60] },
  { label: "61–90 days", days: [61, 90] },
  { label: "90+ days", days: [91, Infinity] },
];

export default function AccountsReceivable() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const list = await base44.entities.Invoice.list("-created_date");
    setInvoices(list); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const daysOverdue = (inv) => {
    if (!inv.due_date) return 0;
    const diff = (new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(diff));
  };

  const recordPayment = async () => {
    setSaving(true);
    const inv = paymentModal;
    const paid = parseFloat(paymentAmount) || 0;
    const totalPaid = (inv.amount_paid || 0) + paid;
    const balance = inv.total - totalPaid;
    const newStatus = balance <= 0 ? "paid" : "part_paid";
    await base44.entities.Invoice.update(inv.id, { amount_paid: totalPaid, status: newStatus });
    await postInvoicePaymentToLedger(inv, paid);
    setPaymentModal(null); setPaymentAmount("");
    await load(); setSaving(false);
  };

  const writeOff = async (inv) => {
    await base44.entities.Invoice.update(inv.id, { status: "cancelled" });
    await load();
  };

  const filtered = invoices.filter(i => {
    const matchSearch = !search || (i.customer_name || "").toLowerCase().includes(search.toLowerCase()) || (i.invoice_number || "").includes(search);
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAR = invoices.filter(i => !["paid","cancelled","draft"].includes(i.status)).reduce((s, i) => s + (i.total - (i.amount_paid || 0)), 0);
  const overdueAmt = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + (i.total - (i.amount_paid || 0)), 0);

  // Ageing
  const aging = AGING_BUCKETS.map(b => ({
    ...b,
    total: invoices.filter(i => !["paid","cancelled"].includes(i.status)).filter(i => {
      const d = daysOverdue(i);
      return d >= b.days[0] && d <= b.days[1];
    }).reduce((s, i) => s + (i.total - (i.amount_paid || 0)), 0)
  }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">Accounts Receivable</h2>
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-bold">{fmt(totalAR)}</span> total outstanding — <span className="text-red-400">{fmt(overdueAmt)} overdue</span>
          </p>
        </div>
      </div>

      {/* Ageing Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {aging.map(b => (
          <div key={b.label} className={`bg-card border rounded-sm p-3 ${b.label === "90+ days" ? "border-red-500/30" : "border-border"}`}>
            <div className="font-heading text-[9px] uppercase tracking-widest text-muted-foreground">{b.label}</div>
            <div className={`font-heading text-lg font-bold mt-1 ${b.label === "90+ days" ? "text-red-400" : "text-foreground"}`}>{fmt(b.total)}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." className="pl-9 rounded-sm" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 rounded-sm text-xs font-heading uppercase tracking-wider"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.keys(STATUS_STYLES).map(s => <SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {["Invoice #","Customer","Invoice Date","Due Date","Total","Paid","Balance","Days Due","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-muted-foreground text-xs">No invoices found</td></tr>
              ) : filtered.map(inv => {
                const balance = inv.total - (inv.amount_paid || 0);
                const days = daysOverdue(inv);
                return (
                  <tr key={inv.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{inv.invoice_number || "—"}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{inv.customer_name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{inv.created_date?.slice(0,10)}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{inv.due_date || "—"}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-foreground">{fmt(inv.total)}</td>
                    <td className="px-4 py-2.5 text-xs text-primary">{fmt(inv.amount_paid)}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-amber-400">{fmt(balance)}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {days > 0 ? <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{days}d</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-heading uppercase tracking-wider border ${STATUS_STYLES[inv.status] || ""}`}>{inv.status?.replace(/_/g," ")}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        {!["paid","cancelled"].includes(inv.status) && balance > 0 && (
                          <button onClick={() => { setPaymentModal(inv); setPaymentAmount(balance.toFixed(2)); }} className="text-[9px] font-heading uppercase tracking-wider text-primary hover:text-primary/70">Record Payment</button>
                        )}
                        {inv.status !== "cancelled" && inv.status !== "paid" && (
                          <button onClick={() => writeOff(inv)} className="text-[9px] font-heading uppercase tracking-wider text-red-400 hover:text-red-300 ml-1">Write Off</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-sm p-6 space-y-4">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Record Payment</h3>
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{paymentModal.customer_name}</span> — {paymentModal.invoice_number}
            </div>
            <div className="space-y-1">
              <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Payment Amount ($)</label>
              <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="rounded-sm text-lg font-bold" />
            </div>
            <div className="text-xs text-muted-foreground">Balance owing: <span className="text-amber-400 font-bold">{fmt(paymentModal.total - (paymentModal.amount_paid || 0))}</span></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPaymentModal(null)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={recordPayment} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
                <DollarSign className="w-4 h-4 mr-1" /> Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}