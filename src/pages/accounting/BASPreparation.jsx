import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, AlertTriangle, CheckCircle, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STYLES = {
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  prepared: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  lodged: "bg-green-500/10 text-primary border-green-500/30",
  paid: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const fmt = (n) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

export default function BASPreparation() {
  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ period: "quarterly", period_start: "", period_end: "", status: "draft" });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const [ret, inv, bil] = await Promise.all([
      base44.entities.BASReturn.list("-period_end"),
      base44.entities.Invoice.list(),
      base44.entities.SupplierBill.list(),
    ]);
    setReturns(ret); setInvoices(inv); setBills(bil); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const calcBAS = (start, end) => {
    const inRange = (date) => date && date >= start && date <= end;
    const salesInv = invoices.filter(i => inRange(i.created_date?.slice(0,10)) && i.status !== "cancelled");
    const g1 = salesInv.reduce((s, i) => s + (i.subtotal || 0), 0);
    const gst1a = salesInv.reduce((s, i) => s + (i.gst || 0), 0);
    const purBills = bills.filter(b => inRange(b.bill_date) && b.status !== "draft");
    const gst1b = purBills.reduce((s, b) => s + (b.gst_total || 0), 0);
    const netGST = gst1a - gst1b;
    return { g1_total_sales: g1, g1a_gst_on_sales: gst1a, g1b_gst_on_purchases: gst1b, net_gst: netGST, bas_payable: netGST > 0 ? netGST : 0 };
  };

  const prepareBAS = async () => {
    setSaving(true);
    const calcs = calcBAS(form.period_start, form.period_end);
    await base44.entities.BASReturn.create({ ...form, ...calcs, status: "prepared" });
    setShowForm(false);
    await load(); setSaving(false);
  };

  const updateStatus = async (ret, status) => {
    await base44.entities.BASReturn.update(ret.id, { status, ...(status === "lodged" ? { lodgement_date: new Date().toISOString().slice(0,10) } : {}) });
    await load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">BAS Preparation</h2>
          <p className="text-xs text-muted-foreground">Business Activity Statement — Australian GST Reporting</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
          <Plus className="w-4 h-4 mr-1" /> Prepare BAS
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200">
          <span className="font-bold">Disclaimer:</span> BAS figures are system-generated estimates and should be reviewed by a registered BAS agent or accountant before lodgement.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {["BAS #","Period","Start","End","G1 Sales","1A GST on Sales","1B GST on Purchases","Net GST","BAS Payable","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {returns.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-8 text-muted-foreground text-xs">No BAS returns yet</td></tr>
              ) : returns.map(r => (
                <tr key={r.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.bas_number || "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground capitalize">{r.period}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.period_start}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.period_end}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-primary">{fmt(r.g1_total_sales)}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-foreground">{fmt(r.g1a_gst_on_sales)}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-foreground">{fmt(r.g1b_gst_on_purchases)}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-foreground">{fmt(r.net_gst)}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-amber-400">{fmt(r.bas_payable)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-heading uppercase tracking-wider border ${STATUS_STYLES[r.status] || ""}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {r.status === "prepared" && <button onClick={() => updateStatus(r, "lodged")} className="text-[9px] font-heading uppercase tracking-wider text-primary hover:text-primary/70">Mark Lodged</button>}
                      {r.status === "lodged" && <button onClick={() => updateStatus(r, "paid")} className="text-[9px] font-heading uppercase tracking-wider text-primary hover:text-primary/70">Mark Paid</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BAS Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-lg">
            <div className="bg-[hsl(0,0%,8%)] px-5 py-3 flex items-center justify-between rounded-t-sm">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">BAS Summary — {selected.period_start} to {selected.period_end}</h3>
              <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {[
                  ["G1 — Total Sales", selected.g1_total_sales, "text-primary"],
                  ["1A — GST on Sales", selected.g1a_gst_on_sales, "text-foreground"],
                  ["1B — GST on Purchases", selected.g1b_gst_on_purchases, "text-foreground"],
                  ["Net GST Position", selected.net_gst, selected.net_gst > 0 ? "text-red-400" : "text-primary"],
                  ["PAYG Withholding", selected.payg_withheld || 0, "text-amber-400"],
                ].map(([label, val, color]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className={`font-heading font-bold text-sm ${color}`}>{fmt(val)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 bg-muted/30 rounded-sm px-3 mt-2">
                  <span className="font-heading text-xs uppercase tracking-wider font-bold text-foreground">BAS {selected.bas_payable >= 0 ? "PAYABLE TO ATO" : "REFUND FROM ATO"}</span>
                  <span className={`font-heading font-bold text-lg ${selected.bas_payable >= 0 ? "text-red-400" : "text-primary"}`}>{fmt(Math.abs(selected.bas_payable))}</span>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-3">
                <p className="text-[10px] text-amber-200">BAS figures are system-generated estimates and should be reviewed by a registered BAS agent or accountant before lodgement.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New BAS Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Prepare BAS Return</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Reporting Period</label>
                <Select value={form.period} onValueChange={v => setForm(f => ({ ...f, period: v }))}>
                  <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Period Start</label>
                <Input type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Period End</label>
                <Input type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} className="rounded-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={prepareBAS} disabled={saving || !form.period_start || !form.period_end} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
                <FileText className="w-4 h-4 mr-1" /> Prepare
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}