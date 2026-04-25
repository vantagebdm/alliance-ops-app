import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Users, DollarSign, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fmt = (n) => `$${(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
const TABS = ["Employees", "Pay Runs"];

const BLANK_EMP = { first_name: "", last_name: "", email: "", phone: "", employment_type: "full_time", pay_basis: "hourly", pay_rate: 0, super_rate: 11.5, super_fund: "", start_date: "", status: "active" };
const BLANK_RUN = { pay_period_start: "", pay_period_end: "", pay_date: "", status: "draft", lines: [], total_gross: 0, total_payg: 0, total_super: 0, total_net: 0 };

export default function Payroll() {
  const [tab, setTab] = useState("Employees");
  const [employees, setEmployees] = useState([]);
  const [payRuns, setPayRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [showRunForm, setShowRunForm] = useState(false);
  const [empForm, setEmpForm] = useState(BLANK_EMP);
  const [runForm, setRunForm] = useState(BLANK_RUN);
  const [runLines, setRunLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    const [emps, runs] = await Promise.all([
      base44.entities.Employee.list("last_name"),
      base44.entities.PayRun.list("-pay_date"),
    ]);
    setEmployees(emps); setPayRuns(runs); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveEmployee = async () => {
    setSaving(true);
    await base44.entities.Employee.create(empForm);
    setShowEmpForm(false); setEmpForm(BLANK_EMP);
    await load(); setSaving(false);
  };

  const startPayRun = () => {
    const lines = employees.filter(e => e.status === "active").map(e => ({
      employee_id: e.id,
      employee_name: `${e.first_name} ${e.last_name}`,
      ordinary_hours: e.pay_basis === "salary" ? 0 : 76,
      overtime_hours: 0,
      pay_rate: e.pay_rate,
      gross_pay: e.pay_basis === "salary" ? (e.pay_rate / 26) : (e.pay_rate * 76),
      allowances: 0,
      deductions: 0,
      payg_withheld: 0,
      super_amount: 0,
      net_pay: 0,
    }));
    setRunLines(lines.map(l => recalc(l, employees)));
    setShowRunForm(true);
    setRunForm(BLANK_RUN);
  };

  const recalc = (line, emps) => {
    const emp = emps.find(e => e.id === line.employee_id);
    const superRate = (emp?.super_rate || 11.5) / 100;
    const gross = line.pay_basis === "salary" ? line.gross_pay : ((line.ordinary_hours || 0) * (line.pay_rate || 0)) + ((line.overtime_hours || 0) * (line.pay_rate || 0) * 1.5) + (line.allowances || 0);
    const super_amount = gross * superRate;
    const payg = gross * 0.19; // simplified placeholder
    const net_pay = gross - payg - (line.deductions || 0);
    return { ...line, gross_pay: gross, super_amount, payg_withheld: payg, net_pay };
  };

  const savePayRun = async () => {
    setSaving(true);
    const total_gross = runLines.reduce((s, l) => s + l.gross_pay, 0);
    const total_payg = runLines.reduce((s, l) => s + l.payg_withheld, 0);
    const total_super = runLines.reduce((s, l) => s + l.super_amount, 0);
    const total_net = runLines.reduce((s, l) => s + l.net_pay, 0);
    await base44.entities.PayRun.create({ ...runForm, lines: runLines, total_gross, total_payg, total_super, total_net });
    setShowRunForm(false);
    await load(); setSaving(false);
  };

  const filtered = employees.filter(e => !search || `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-wider">Payroll</h2>
          <p className="text-xs text-muted-foreground">{employees.filter(e => e.status === "active").length} active employees</p>
        </div>
        <div className="flex gap-2">
          {tab === "Employees" && (
            <Button size="sm" onClick={() => { setShowEmpForm(true); setEmpForm(BLANK_EMP); }} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Employee
            </Button>
          )}
          {tab === "Pay Runs" && (
            <Button size="sm" onClick={startPayRun} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
              <Plus className="w-4 h-4 mr-1" /> New Pay Run
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 font-heading text-xs uppercase tracking-wider border-b-2 transition-all ${tab === t ? "border-primary text-primary" : "border-transparent text-white/40 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div> : (
        <>
          {tab === "Employees" && (
            <>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="pl-9 rounded-sm" />
              </div>
              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[hsl(0,0%,9%)] border-b border-[hsl(0,0%,18%)]">
                      {["Name","Type","Pay Basis","Pay Rate","Super Rate","Super Fund","Status"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-white/30 text-xs">No employees found</td></tr>
                      ) : filtered.map(e => (
                        <tr key={e.id} className="hover:bg-[hsl(0,0%,14%)]">
                          <td className="px-4 py-2.5 font-medium text-white">{e.first_name} {e.last_name}</td>
                          <td className="px-4 py-2.5 text-xs text-white/40">{e.employment_type?.replace(/_/g," ")}</td>
                          <td className="px-4 py-2.5 text-xs text-white/40">{e.pay_basis}</td>
                          <td className="px-4 py-2.5 text-xs font-bold text-white">{fmt(e.pay_rate)}</td>
                          <td className="px-4 py-2.5 text-xs text-white/40">{e.super_rate}%</td>
                          <td className="px-4 py-2.5 text-xs text-white/40">{e.super_fund || "—"}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-heading uppercase tracking-wider border ${e.status === "active" ? "bg-green-500/10 text-primary border-green-500/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>{e.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "Pay Runs" && (
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(0,0%,9%)] border-b border-[hsl(0,0%,18%)]">
                     {["Pay Run #","Pay Period","Pay Date","Employees","Gross Pay","PAYG","Super","Net Pay","Status"].map(h => (
                       <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                     ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payRuns.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-white/30 text-xs">No pay runs yet</td></tr>
                  ) : payRuns.map(r => (
                    <tr key={r.id} className="hover:bg-[hsl(0,0%,14%)]">
                      <td className="px-4 py-2.5 font-mono text-xs text-white/40">{r.pay_run_number || "—"}</td>
                      <td className="px-4 py-2.5 text-xs text-white/40">{r.pay_period_start} – {r.pay_period_end}</td>
                      <td className="px-4 py-2.5 text-xs text-white/40">{r.pay_date}</td>
                      <td className="px-4 py-2.5 text-xs text-white/40">{(r.lines || []).length}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-white">{fmt(r.total_gross)}</td>
                      <td className="px-4 py-2.5 text-xs text-amber-400">{fmt(r.total_payg)}</td>
                      <td className="px-4 py-2.5 text-xs text-blue-400">{fmt(r.total_super)}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-primary">{fmt(r.total_net)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-heading uppercase tracking-wider border ${r.status === "posted" ? "bg-green-500/10 text-primary border-green-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add Employee Modal */}
      {showEmpForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-3 flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Add Employee</h3>
              <button onClick={() => setShowEmpForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {[["first_name","First Name"],["last_name","Last Name"],["email","Email"],["phone","Phone"]].map(([k,l]) => (
                <div key={k} className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">{l}</label>
                  <Input value={empForm[k]} onChange={e => setEmpForm(f => ({ ...f, [k]: e.target.value }))} className="rounded-sm" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Employment Type</label>
                <Select value={empForm.employment_type} onValueChange={v => setEmpForm(f => ({ ...f, employment_type: v }))}>
                  <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Pay Basis</label>
                <Select value={empForm.pay_basis} onValueChange={v => setEmpForm(f => ({ ...f, pay_basis: v }))}>
                  <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="salary">Salary (Annual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Pay Rate ($)</label>
                <Input type="number" value={empForm.pay_rate} onChange={e => setEmpForm(f => ({ ...f, pay_rate: parseFloat(e.target.value) || 0 }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Super Rate (%)</label>
                <Input type="number" value={empForm.super_rate} onChange={e => setEmpForm(f => ({ ...f, super_rate: parseFloat(e.target.value) || 11.5 }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Super Fund</label>
                <Input value={empForm.super_fund} onChange={e => setEmpForm(f => ({ ...f, super_fund: e.target.value }))} className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Start Date</label>
                <Input type="date" value={empForm.start_date} onChange={e => setEmpForm(f => ({ ...f, start_date: e.target.value }))} className="rounded-sm" />
              </div>
            </div>
            <div className="border-t border-border px-6 py-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEmpForm(false)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={saveEmployee} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">Save Employee</Button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Run Modal */}
      {showRunForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-3 flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">New Pay Run</h3>
              <button onClick={() => setShowRunForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Period Start</label>
                  <Input type="date" value={runForm.pay_period_start} onChange={e => setRunForm(f => ({ ...f, pay_period_start: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Period End</label>
                  <Input type="date" value={runForm.pay_period_end} onChange={e => setRunForm(f => ({ ...f, pay_period_end: e.target.value }))} className="rounded-sm" />
                </div>
                <div className="space-y-1">
                  <label className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Pay Date</label>
                  <Input type="date" value={runForm.pay_date} onChange={e => setRunForm(f => ({ ...f, pay_date: e.target.value }))} className="rounded-sm" />
                </div>
              </div>

              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[hsl(0,0%,9%)] border-b border-[hsl(0,0%,18%)]">
                      {["Employee","Ord Hours","OT Hours","Rate","Gross","PAYG","Super","Net"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {runLines.map((line, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-xs font-medium text-white">{line.employee_name}</td>
                        <td className="px-3 py-2"><Input type="number" value={line.ordinary_hours} onChange={e => setRunLines(ls => { const n = [...ls]; n[i] = recalc({...n[i], ordinary_hours: parseFloat(e.target.value)||0}, employees); return n; })} className="rounded-sm text-xs w-16 h-7" /></td>
                        <td className="px-3 py-2"><Input type="number" value={line.overtime_hours} onChange={e => setRunLines(ls => { const n = [...ls]; n[i] = recalc({...n[i], overtime_hours: parseFloat(e.target.value)||0}, employees); return n; })} className="rounded-sm text-xs w-16 h-7" /></td>
                        <td className="px-3 py-2 text-xs text-white/40">{fmt(line.pay_rate)}</td>
                        <td className="px-3 py-2 text-xs font-bold text-foreground">{fmt(line.gross_pay)}</td>
                        <td className="px-3 py-2 text-xs text-amber-400">{fmt(line.payg_withheld)}</td>
                        <td className="px-3 py-2 text-xs text-blue-400">{fmt(line.super_amount)}</td>
                        <td className="px-3 py-2 text-xs font-bold text-primary">{fmt(line.net_pay)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[hsl(0,0%,9%)] border-t border-[hsl(0,0%,18%)]">
                       <td colSpan={4} className="px-3 py-2 font-heading text-[9px] uppercase tracking-wider text-white/30">TOTALS</td>
                      <td className="px-3 py-2 text-xs font-bold text-foreground">{fmt(runLines.reduce((s,l)=>s+l.gross_pay,0))}</td>
                      <td className="px-3 py-2 text-xs font-bold text-amber-400">{fmt(runLines.reduce((s,l)=>s+l.payg_withheld,0))}</td>
                      <td className="px-3 py-2 text-xs font-bold text-blue-400">{fmt(runLines.reduce((s,l)=>s+l.super_amount,0))}</td>
                      <td className="px-3 py-2 text-xs font-bold text-primary">{fmt(runLines.reduce((s,l)=>s+l.net_pay,0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="border-t border-border px-6 py-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRunForm(false)} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button size="sm" onClick={savePayRun} disabled={saving} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">Save Pay Run</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}