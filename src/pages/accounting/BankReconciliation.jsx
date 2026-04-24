import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Upload, CheckCircle, Clock, AlertTriangle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STYLES = {
  unmatched: "bg-red-500/10 text-red-400 border-red-500/30",
  suggested: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  matched: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  reconciled: "bg-green-500/10 text-primary border-green-500/30",
};

const fmt = (n) => `$${Math.abs(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

const BLANK_TXN = { date: "", description: "", reference: "", debit: 0, credit: 0, gst_treatment: "no_gst", notes: "", reconciliation_status: "unmatched" };

export default function BankReconciliation() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [txnForm, setTxnForm] = useState(BLANK_TXN);
  const [accountForm, setAccountForm] = useState({ name: "", bank_name: "", bsb: "", account_number: "", opening_balance: 0, current_balance: 0 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [accs, txns] = await Promise.all([
      base44.entities.BankAccount.list(),
      base44.entities.BankTransaction.list("-date"),
    ]);
    setBankAccounts(accs);
    if (accs.length && !selectedAccount) setSelectedAccount(accs[0].id);
    setTransactions(txns);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveAccount = async () => {
    setSaving(true);
    await base44.entities.BankAccount.create(accountForm);
    setShowAddAccount(false);
    setAccountForm({ name: "", bank_name: "", bsb: "", account_number: "", opening_balance: 0, current_balance: 0 });
    await load();
    setSaving(false);
  };

  const saveTxn = async () => {
    setSaving(true);
    await base44.entities.BankTransaction.create({ ...txnForm, bank_account_id: selectedAccount, bank_account_name: bankAccounts.find(a => a.id === selectedAccount)?.name, source: "manual" });
    setShowAddTxn(false);
    setTxnForm(BLANK_TXN);
    await load();
    setSaving(false);
  };

  const reconcile = async (txn) => {
    await base44.entities.BankTransaction.update(txn.id, { reconciliation_status: "reconciled" });
    await load();
  };

  const filtered = transactions.filter(t => {
    const matchAccount = !selectedAccount || t.bank_account_id === selectedAccount;
    const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase()) || (t.reference || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.reconciliation_status === filterStatus;
    return matchAccount && matchSearch && matchStatus;
  });

  const acc = bankAccounts.find(a => a.id === selectedAccount);
  const balance = (acc?.current_balance || 0) + filtered.filter(t => t.reconciliation_status !== "reconciled").reduce((s, t) => s + (t.credit || 0) - (t.debit || 0), 0);

  if (loading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">Bank & Reconciliation</h2>
          <p className="text-xs text-muted-foreground">{bankAccounts.length} bank accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddAccount(true)} className="rounded-sm font-heading text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-1" /> Add Bank Account
          </Button>
          {selectedAccount && (
            <Button size="sm" onClick={() => setShowAddTxn(true)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Account tabs */}
      {bankAccounts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {bankAccounts.map(a => (
            <button key={a.id} onClick={() => setSelectedAccount(a.id)}
              className={`px-4 py-2 rounded-sm text-xs font-heading uppercase tracking-wider border transition-all ${selectedAccount === a.id ? "bg-primary text-black border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {a.name}
              <span className={`ml-2 font-bold ${(a.current_balance || 0) >= 0 ? "text-primary" : "text-red-400"}`}>{fmt(a.current_balance)}</span>
            </button>
          ))}
        </div>
      )}

      {bankAccounts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground/50 font-heading uppercase tracking-wider text-xs">
          No bank accounts. Add your first bank account to get started.
        </div>
      ) : (
        <>
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="pl-9 rounded-sm" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 rounded-sm text-xs font-heading uppercase tracking-wider">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unmatched">Unmatched</SelectItem>
                <SelectItem value="suggested">Suggested</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="reconciled">Reconciled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {["Date","Description","Reference","Debit","Credit","Status","Action"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">No transactions found</td></tr>
                ) : filtered.map(t => (
                  <tr key={t.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-2.5 text-sm text-foreground max-w-[200px] truncate">{t.description}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{t.reference || "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-red-400 font-bold">{t.debit > 0 ? fmt(t.debit) : "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-primary font-bold">{t.credit > 0 ? fmt(t.credit) : "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-heading uppercase tracking-wider border ${STATUS_STYLES[t.reconciliation_status] || ""}`}>
                        {t.reconciliation_status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {t.reconciliation_status !== "reconciled" && (
                        <button onClick={() => reconcile(t)} className="text-[9px] font-heading uppercase tracking-wider text-primary hover:text-primary/70">
                          Reconcile
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Add Bank Account</h3>
              <button onClick={() => setShowAddAccount(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              {[["name","Account Name"],["bank_name","Bank Name"],["bsb","BSB"],["account_number","Account Number"]].map(([k,l]) => (
                <div key={k} className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">{l}</label>
                  <Input value={accountForm[k]} onChange={e => setAccountForm(f => ({ ...f, [k]: e.target.value }))} className="rounded-sm" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Opening Balance ($)</label>
                <Input type="number" value={accountForm.opening_balance} onChange={e => setAccountForm(f => ({ ...f, opening_balance: parseFloat(e.target.value) || 0, current_balance: parseFloat(e.target.value) || 0 }))} className="rounded-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddAccount(false)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={saveAccount} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTxn && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Add Transaction</h3>
              <button onClick={() => setShowAddTxn(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Date</label>
                <Input type="date" value={txnForm.date} onChange={e => setTxnForm(f => ({ ...f, date: e.target.value }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Description</label>
                <Input value={txnForm.description} onChange={e => setTxnForm(f => ({ ...f, description: e.target.value }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Reference</label>
                <Input value={txnForm.reference} onChange={e => setTxnForm(f => ({ ...f, reference: e.target.value }))} className="rounded-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Debit ($)</label>
                  <Input type="number" value={txnForm.debit} onChange={e => setTxnForm(f => ({ ...f, debit: parseFloat(e.target.value) || 0 }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Credit ($)</label>
                  <Input type="number" value={txnForm.credit} onChange={e => setTxnForm(f => ({ ...f, credit: parseFloat(e.target.value) || 0 }))} className="rounded-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">GST Treatment</label>
                <Select value={txnForm.gst_treatment} onValueChange={v => setTxnForm(f => ({ ...f, gst_treatment: v }))}>
                  <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_gst">No GST</SelectItem>
                    <SelectItem value="taxable">Taxable (10%)</SelectItem>
                    <SelectItem value="gst_free">GST Free</SelectItem>
                    <SelectItem value="input_taxed">Input Taxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddTxn(false)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={saveTxn} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}