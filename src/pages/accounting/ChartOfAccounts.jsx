import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_ACCOUNTS = [
  { code: "1000", name: "Business Cheque Account", type: "asset", category: "Bank Accounts", gst_treatment: "no_gst" },
  { code: "1100", name: "Accounts Receivable", type: "asset", category: "Current Assets", gst_treatment: "no_gst" },
  { code: "1200", name: "Inventory Asset", type: "asset", category: "Current Assets", gst_treatment: "no_gst" },
  { code: "1300", name: "Prepayments", type: "asset", category: "Current Assets", gst_treatment: "no_gst" },
  { code: "2000", name: "Accounts Payable", type: "liability", category: "Current Liabilities", gst_treatment: "no_gst" },
  { code: "2100", name: "GST Payable", type: "liability", category: "Current Liabilities", gst_treatment: "no_gst" },
  { code: "2200", name: "PAYG Withholding Payable", type: "liability", category: "Payroll Liabilities", gst_treatment: "no_gst" },
  { code: "2300", name: "Superannuation Payable", type: "liability", category: "Payroll Liabilities", gst_treatment: "no_gst" },
  { code: "2400", name: "Payroll Liabilities", type: "liability", category: "Payroll Liabilities", gst_treatment: "no_gst" },
  { code: "4000", name: "Parts Sales", type: "income", category: "Sales Income", gst_treatment: "taxable" },
  { code: "4100", name: "Freight Income", type: "income", category: "Sales Income", gst_treatment: "taxable" },
  { code: "4200", name: "Service / Hire Income", type: "income", category: "Sales Income", gst_treatment: "taxable" },
  { code: "5000", name: "Parts Purchases", type: "cogs", category: "Cost of Goods Sold", gst_treatment: "taxable" },
  { code: "5100", name: "Freight Inwards", type: "cogs", category: "Cost of Goods Sold", gst_treatment: "taxable" },
  { code: "5200", name: "Stock Adjustments", type: "cogs", category: "Cost of Goods Sold", gst_treatment: "taxable" },
  { code: "6000", name: "Wages & Salaries", type: "expense", category: "Operating Expenses", gst_treatment: "gst_free" },
  { code: "6100", name: "Superannuation Expense", type: "expense", category: "Operating Expenses", gst_treatment: "gst_free" },
  { code: "6200", name: "Rent", type: "expense", category: "Operating Expenses", gst_treatment: "taxable" },
  { code: "6300", name: "Insurance", type: "expense", category: "Operating Expenses", gst_treatment: "taxable" },
  { code: "6400", name: "Fuel", type: "expense", category: "Operating Expenses", gst_treatment: "taxable" },
  { code: "6500", name: "Repairs & Maintenance", type: "expense", category: "Operating Expenses", gst_treatment: "taxable" },
  { code: "6600", name: "Motor Vehicle Expenses", type: "expense", category: "Operating Expenses", gst_treatment: "taxable" },
  { code: "6700", name: "Software Subscriptions", type: "expense", category: "Operating Expenses", gst_treatment: "taxable" },
  { code: "6800", name: "Bank Fees & Charges", type: "expense", category: "Operating Expenses", gst_treatment: "input_taxed" },
  { code: "6900", name: "Depreciation", type: "expense", category: "Operating Expenses", gst_treatment: "no_gst" },
  { code: "7000", name: "Other Expenses", type: "expense", category: "Other Expenses", gst_treatment: "taxable" },
  { code: "9000", name: "Retained Earnings", type: "equity", category: "Equity", gst_treatment: "no_gst" },
];

const TYPE_COLORS = {
  asset: "text-blue-400", liability: "text-red-400", income: "text-primary",
  cogs: "text-amber-400", expense: "text-orange-400", equity: "text-purple-400"
};

const BLANK = { code: "", name: "", type: "expense", category: "", gst_treatment: "taxable", description: "", is_active: true };

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const list = await base44.entities.ChartOfAccount.list("code");
    setAccounts(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const seed = async () => {
    setSaving(true);
    await base44.entities.ChartOfAccount.bulkCreate(DEFAULT_ACCOUNTS.map(a => ({ ...a, is_active: true, is_system: true, opening_balance: 0, current_balance: 0 })));
    await load();
    setSaving(false);
  };

  const save = async () => {
    setSaving(true);
    if (editing === "new") await base44.entities.ChartOfAccount.create(form);
    else await base44.entities.ChartOfAccount.update(editing, form);
    setEditing(null);
    setForm(BLANK);
    await load();
    setSaving(false);
  };

  const toggle = async (acc) => {
    await base44.entities.ChartOfAccount.update(acc.id, { is_active: !acc.is_active });
    await load();
  };

  const filtered = accounts.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search);
    const matchType = filterType === "all" || a.type === filterType;
    return matchSearch && matchType;
  });

  const grouped = filtered.reduce((g, a) => {
    const key = a.category || a.type;
    if (!g[key]) g[key] = [];
    g[key].push(a);
    return g;
  }, {});

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">Chart of Accounts</h2>
          <p className="text-xs text-muted-foreground">{accounts.length} accounts configured</p>
        </div>
        <div className="flex gap-2">
          {accounts.length === 0 && (
            <Button variant="outline" size="sm" onClick={seed} disabled={saving} className="rounded-sm font-heading text-xs uppercase tracking-wider">
              Load Default Accounts
            </Button>
          )}
          <Button size="sm" onClick={() => { setEditing("new"); setForm(BLANK); }} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Account
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts..." className="pl-9 rounded-sm" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 rounded-sm text-xs font-heading uppercase tracking-wider">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="asset">Assets</SelectItem>
            <SelectItem value="liability">Liabilities</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="cogs">Cost of Goods</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground/50 font-heading uppercase tracking-wider text-xs">
          No accounts yet. Click "Load Default Accounts" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, accs]) => (
            <div key={cat} className="border border-border rounded-sm overflow-hidden">
              <div className="bg-[hsl(0,0%,9%)] px-4 py-2 border-b border-[hsl(0,0%,18%)]">
                <span className="font-heading text-[9px] uppercase tracking-widest text-white/30">{cat}</span>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {accs.map(a => (
                    <tr key={a.id} className={`${!a.is_active ? "opacity-40" : ""}`}>
                      <td className="px-4 py-2.5 w-20 font-mono text-xs text-white/40">{a.code}</td>
                       <td className="px-4 py-2.5 font-medium text-white">{a.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-heading text-[9px] uppercase tracking-wider ${TYPE_COLORS[a.type] || ""}`}>{a.type}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-white/40">{a.gst_treatment?.replace(/_/g," ")}</td>
                       <td className="px-4 py-2.5 text-right font-heading text-xs font-bold text-white">
                        ${(a.current_balance || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggle(a)} className="text-white/30 hover:text-white">
                            {a.is_active ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-red-400" />}
                          </button>
                          <button onClick={() => { setEditing(a.id); setForm(a); }} className="text-white/30 hover:text-white ml-1">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-lg p-6 space-y-4">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider">{editing === "new" ? "Add Account" : "Edit Account"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Code</label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Type</label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["asset","liability","income","cogs","expense","equity"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Account Name</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Category</label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">GST Treatment</label>
                <Select value={form.gst_treatment} onValueChange={v => setForm(f => ({ ...f, gst_treatment: v }))}>
                  <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taxable">Taxable (10%)</SelectItem>
                    <SelectItem value="gst_free">GST Free</SelectItem>
                    <SelectItem value="out_of_scope">Out of Scope</SelectItem>
                    <SelectItem value="input_taxed">Input Taxed</SelectItem>
                    <SelectItem value="no_gst">No GST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(null); setForm(BLANK); }} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={save} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}