import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { postBillToLedger, postBillPaymentToLedger } from "@/lib/accountingLedger";
import { Plus, Search, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STYLES = {
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  awaiting_approval: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  approved: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  paid: "bg-green-500/10 text-primary border-green-500/30",
  overdue: "bg-red-500/10 text-red-400 border-red-500/30",
};

const fmt = (n) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
const BLANK = { supplier_name: "", supplier_invoice_number: "", bill_date: new Date().toISOString().slice(0,10), due_date: "", status: "draft", lines: [], subtotal: 0, gst_total: 0, total: 0, balance_due: 0, notes: "" };

export default function AccountsPayable() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [lines, setLines] = useState([{ description: "", quantity: 1, unit_price: 0, gst_treatment: "taxable", gst_amount: 0, total: 0 }]);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const list = await base44.entities.SupplierBill.list("-bill_date");
    setBills(list); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const calcLine = (line) => {
    const total = (line.quantity || 0) * (line.unit_price || 0);
    const gst = line.gst_treatment === "taxable" ? total / 11 : 0;
    return { ...line, gst_amount: gst, total };
  };

  const totals = () => {
    const subtotal = lines.reduce((s, l) => s + (l.total || 0), 0);
    const gst_total = lines.reduce((s, l) => s + (l.gst_amount || 0), 0);
    return { subtotal, gst_total, total: subtotal, balance_due: subtotal };
  };

  const save = async () => {
    setSaving(true);
    const t = totals();
    const bill = await base44.entities.SupplierBill.create({ ...form, lines: lines.map(calcLine), ...t });
    await postBillToLedger(bill);
    setShowForm(false); setForm(BLANK); setLines([{ description: "", quantity: 1, unit_price: 0, gst_treatment: "taxable", gst_amount: 0, total: 0 }]);
    await load(); setSaving(false);
  };

  const approve = async (bill) => {
    await base44.entities.SupplierBill.update(bill.id, { status: "approved" });
    await load();
  };

  const markPaid = async (bill) => {
    await base44.entities.SupplierBill.update(bill.id, { status: "paid", amount_paid: bill.total, balance_due: 0 });
    await postBillPaymentToLedger({ ...bill, amount_paid: bill.total });
    await load();
  };

  const filtered = bills.filter(b => {
    const matchSearch = !search || b.supplier_name.toLowerCase().includes(search.toLowerCase()) || (b.bill_number || "").includes(search);
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalOwing = filtered.filter(b => !["paid","draft"].includes(b.status)).reduce((s, b) => s + (b.balance_due || b.total || 0), 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">Accounts Payable</h2>
          <p className="text-xs text-muted-foreground">{bills.length} bills — <span className="text-amber-400 font-bold">{fmt(totalOwing)} outstanding</span></p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
          <Plus className="w-4 h-4 mr-1" /> Enter Supplier Bill
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bills..." className="pl-9 rounded-sm" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 rounded-sm text-xs font-heading uppercase tracking-wider"><SelectValue placeholder="All Status" /></SelectTrigger>
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
                {["Bill #","Supplier","Supplier Inv #","Bill Date","Due Date","Total","Balance Due","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground text-xs">No bills found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(b)}>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{b.bill_number || "—"}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{b.supplier_name}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.supplier_invoice_number || "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.bill_date}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.due_date || "—"}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-foreground">{fmt(b.total)}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-amber-400">{fmt(b.balance_due)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-heading uppercase tracking-wider border ${STATUS_STYLES[b.status] || ""}`}>{b.status?.replace(/_/g," ")}</span>
                  </td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {b.status === "draft" && <button onClick={() => approve(b)} className="text-[9px] font-heading uppercase tracking-wider text-primary hover:text-primary/70">Approve</button>}
                      {b.status === "approved" && <button onClick={() => markPaid(b)} className="text-[9px] font-heading uppercase tracking-wider text-primary hover:text-primary/70">Mark Paid</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Bill Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-3 flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Enter Supplier Bill</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Supplier Name</label>
                  <Input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Supplier Invoice #</label>
                  <Input value={form.supplier_invoice_number} onChange={e => setForm(f => ({ ...f, supplier_invoice_number: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Bill Date</label>
                  <Input type="date" value={form.bill_date} onChange={e => setForm(f => ({ ...f, bill_date: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Due Date</label>
                  <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="rounded-sm" />
                </div>
              </div>

              {/* Lines */}
              <div>
                <div className="font-heading text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Line Items</div>
                <div className="space-y-2">
                  {lines.map((line, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <Input className="col-span-5 rounded-sm text-xs" placeholder="Description" value={line.description} onChange={e => setLines(ls => ls.map((l,j) => j===i ? calcLine({...l, description: e.target.value}) : l))} />
                      <Input className="col-span-2 rounded-sm text-xs" type="number" placeholder="Qty" value={line.quantity} onChange={e => setLines(ls => ls.map((l,j) => j===i ? calcLine({...l, quantity: parseFloat(e.target.value)||0}) : l))} />
                      <Input className="col-span-2 rounded-sm text-xs" type="number" placeholder="Unit $" value={line.unit_price} onChange={e => setLines(ls => ls.map((l,j) => j===i ? calcLine({...l, unit_price: parseFloat(e.target.value)||0}) : l))} />
                      <div className="col-span-2 text-xs font-bold text-right text-foreground">{fmt(line.total)}</div>
                      <button className="col-span-1 text-muted-foreground hover:text-red-400" onClick={() => setLines(ls => ls.filter((_,j) => j!==i))}><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => setLines(ls => [...ls, { description: "", quantity: 1, unit_price: 0, gst_treatment: "taxable", gst_amount: 0, total: 0 }])} className="text-xs text-primary font-heading uppercase tracking-wider hover:text-primary/70">+ Add Line</button>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 flex flex-col items-end gap-1 text-xs">
                <div className="flex gap-8 text-muted-foreground"><span>Subtotal (inc GST)</span><span className="font-bold text-foreground">{fmt(totals().subtotal)}</span></div>
                <div className="flex gap-8 text-muted-foreground"><span>GST Included</span><span className="font-bold text-foreground">{fmt(totals().gst_total)}</span></div>
                <div className="flex gap-8 text-foreground font-heading font-bold text-sm"><span>TOTAL</span><span className="text-primary">{fmt(totals().total)}</span></div>
              </div>

              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Notes</label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-sm" />
              </div>
            </div>
            <div className="border-t border-border px-6 py-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={save} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">Save Bill</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}