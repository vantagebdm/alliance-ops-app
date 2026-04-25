import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fmt = (n) => `$${(n || 0).toFixed(2)}`;

const BLANK_LINE = { gl_account_code: "", gl_account_name: "", description: "", debit: 0, credit: 0, gst_treatment: "no_gst" };

export default function Journals() {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ journal_date: new Date().toISOString().slice(0,10), reference: "", description: "", status: "draft" });
  const [lines, setLines] = useState([{ ...BLANK_LINE }, { ...BLANK_LINE }]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [jnls, accs] = await Promise.all([
      base44.entities.Journal.list("-journal_date"),
      base44.entities.ChartOfAccount.list("code"),
    ]);
    setJournals(jnls); setAccounts(accs); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalDebits = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

  const save = async () => {
    if (!balanced) return;
    setSaving(true);
    await base44.entities.Journal.create({ ...form, lines, total_debits: totalDebits, total_credits: totalCredits });
    setShowForm(false);
    setLines([{ ...BLANK_LINE }, { ...BLANK_LINE }]);
    setForm({ journal_date: new Date().toISOString().slice(0,10), reference: "", description: "", status: "draft" });
    await load(); setSaving(false);
  };

  const updateLine = (i, field, value) => {
    setLines(ls => ls.map((l, j) => j === i ? { ...l, [field]: value } : l));
  };

  const post = async (j) => {
    await base44.entities.Journal.update(j.id, { status: "posted" });
    await load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">Manual Journals</h2>
          <p className="text-xs text-muted-foreground">{journals.length} journals recorded</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
          <Plus className="w-4 h-4 mr-1" /> New Journal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(0,0%,9%)] border-b border-[hsl(0,0%,18%)]">
                 {["Journal #","Date","Reference","Description","Debits","Credits","Status","Action"].map(h => (
                   <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                 ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {journals.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-white/30 text-xs">No journals yet</td></tr>
              ) : journals.map(j => (
                <tr key={j.id} className="hover:bg-[hsl(0,0%,14%)]">
                  <td className="px-4 py-2.5 font-mono text-xs text-white/40">{j.journal_number || "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-white/40">{j.journal_date}</td>
                  <td className="px-4 py-2.5 text-xs text-white/40">{j.reference || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-white">{j.description}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-white">{fmt(j.total_debits)}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-white">{fmt(j.total_credits)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-heading uppercase tracking-wider border ${j.status === "posted" ? "bg-green-500/10 text-primary border-green-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>{j.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {j.status === "draft" && <button onClick={() => post(j)} className="text-[9px] font-heading uppercase tracking-wider text-primary hover:text-primary/70">Post</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Journal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-3 flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">New Manual Journal</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Date</label>
                  <Input type="date" value={form.journal_date} onChange={e => setForm(f => ({ ...f, journal_date: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Reference</label>
                  <Input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Description</label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-sm" />
                </div>
              </div>

              {/* Journal Lines */}
              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[hsl(0,0%,9%)] border-b border-[hsl(0,0%,18%)]">
                      {["Account","Description","Debit","Credit","GST",""].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lines.map((line, i) => (
                      <tr key={i}>
                        <td className="px-2 py-1.5">
                          <Select value={line.gl_account_code} onValueChange={v => {
                            const acc = accounts.find(a => a.code === v);
                            updateLine(i, "gl_account_code", v);
                            updateLine(i, "gl_account_name", acc?.name || "");
                          }}>
                            <SelectTrigger className="rounded-sm text-xs h-7 w-40"><SelectValue placeholder="Select account" /></SelectTrigger>
                            <SelectContent>
                              {accounts.filter(a => a.is_active).map(a => <SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-2 py-1.5"><Input className="rounded-sm text-xs h-7" value={line.description} onChange={e => updateLine(i, "description", e.target.value)} /></td>
                        <td className="px-2 py-1.5"><Input type="number" className="rounded-sm text-xs h-7 w-24" value={line.debit || ""} onChange={e => updateLine(i, "debit", parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1.5"><Input type="number" className="rounded-sm text-xs h-7 w-24" value={line.credit || ""} onChange={e => updateLine(i, "credit", parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1.5">
                          <Select value={line.gst_treatment} onValueChange={v => updateLine(i, "gst_treatment", v)}>
                            <SelectTrigger className="rounded-sm text-xs h-7 w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no_gst">No GST</SelectItem>
                              <SelectItem value="taxable">10% GST</SelectItem>
                              <SelectItem value="gst_free">GST Free</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-2 py-1.5">
                          {lines.length > 2 && <button onClick={() => setLines(ls => ls.filter((_,j)=>j!==i))} className="text-white/30 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[hsl(0,0%,9%)] border-t border-[hsl(0,0%,18%)]">
                       <td colSpan={2} className="px-3 py-2 font-heading text-[9px] uppercase tracking-wider text-white/30">TOTALS</td>
                       <td className="px-3 py-2 text-xs font-bold text-white">{fmt(totalDebits)}</td>
                       <td className="px-3 py-2 text-xs font-bold text-white">{fmt(totalCredits)}</td>
                      <td colSpan={2} className="px-3 py-2">
                        {balanced ? (
                          <span className="flex items-center gap-1 text-[9px] text-primary font-heading uppercase"><CheckCircle className="w-3 h-3" /> Balanced</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] text-red-400 font-heading uppercase"><AlertTriangle className="w-3 h-3" /> Out by {fmt(Math.abs(totalDebits - totalCredits))}</span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <button onClick={() => setLines(ls => [...ls, { ...BLANK_LINE }])} className="text-xs text-primary font-heading uppercase tracking-wider hover:text-primary/70">+ Add Line</button>
            </div>
            <div className="border-t border-border px-6 py-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={save} disabled={saving || !balanced} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm disabled:opacity-50">Save Journal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}