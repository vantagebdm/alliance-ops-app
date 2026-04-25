import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LayoutDashboard, FileText, Tag, Hash, GitBranch, Calendar, Pencil, ClipboardList, Plus, Search, Download, RefreshCw, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDocRules, saveDocRules, previewDocNumber, getDocAuditLog, logDocAudit, resetSequence, getDocHistory, isDocNumberUsed, DEFAULT_DOC_RULES } from "@/lib/numberingEngine";

const TABS = [
  { id: "dashboard",  label: "Dashboard",         icon: LayoutDashboard },
  { id: "rules",      label: "Document Rules",     icon: FileText },
  { id: "prefix",     label: "Prefix Management",  icon: Tag },
  { id: "sequence",   label: "Sequence Control",   icon: Hash },
  { id: "branch",     label: "Branch Rules",       icon: GitBranch },
  { id: "fy",         label: "Financial Year",     icon: Calendar },
  { id: "overrides",  label: "Manual Overrides",   icon: Pencil },
  { id: "audit",      label: "Audit Log",          icon: ClipboardList },
];

const STATUS_STYLES = {
  active:    "bg-green-500/10 text-green-400 border-green-500/20",
  inactive:  "bg-[hsl(0,0%,16%)] text-white/30 border-[hsl(0,0%,22%)]",
  locked:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  system:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const Badge = ({ label, style }) => (
  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-heading uppercase border ${style}`}>{label}</span>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ rules }) {
  const history = getDocHistory();
  const active = rules.filter(r => r.status === "active").length;
  const locked = rules.filter(r => r.locked).length;
  const totalGenerated = history.length;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Document Numbering Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Rules",      val: rules.length,    color: "text-white" },
          { label: "Active Rules",     val: active,          color: "text-primary" },
          { label: "Locked Rules",     val: locked,          color: "text-yellow-400" },
          { label: "Numbers Issued",   val: totalGenerated,  color: "text-blue-400" },
        ].map(k => (
          <div key={k.label} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
            <p className="text-[10px] font-heading uppercase tracking-widest text-white/30">{k.label}</p>
            <p className={`text-3xl font-heading font-bold mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">All Numbering Rules — Preview</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
              {["Document Type","Prefix","Next Number","Preview","Reset","Status"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {rules.slice(0, 12).map(r => (
                <tr key={r.id} className="hover:bg-[hsl(0,0%,11%)]">
                  <td className="px-4 py-2.5 text-white">{r.type}</td>
                  <td className="px-4 py-2.5 text-primary font-mono font-bold">{r.prefix}</td>
                  <td className="px-4 py-2.5 text-white/60">{r.next}</td>
                  <td className="px-4 py-2.5 text-primary font-mono text-[11px]">{previewDocNumber(r)}</td>
                  <td className="px-4 py-2.5 text-white/40">{r.reset}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <Badge label={r.status} style={STATUS_STYLES[r.status] || STATUS_STYLES.active} />
                      {r.locked && <Badge label="Locked" style={STATUS_STYLES.locked} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Document Rules ───────────────────────────────────────────────────────────
function DocumentRules({ rules, setRules }) {
  const [search, setSearch] = useState("");
  const [editRule, setEditRule] = useState(null);
  const [form, setForm] = useState({});
  const [previewNum, setPreviewNum] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ id: "", type: "", prefix: "", next: 1, padding: 5, sep: "Hyphen", suffix: "", reset: "Never", manualOk: false, approvalReq: true, status: "active", locked: false });

  const filtered = rules.filter(r => !search || r.type.toLowerCase().includes(search.toLowerCase()) || r.prefix.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (r) => { setEditRule(r.id); setForm({ ...r }); setPreviewNum(previewDocNumber(r)); };
  const handleFormChange = (k, v) => {
    const updated = { ...form, [k]: v };
    setForm(updated);
    try { setPreviewNum(previewDocNumber(updated)); } catch {}
  };
  const saveEdit = () => {
    if (!form.prefix) return;
    const updated = rules.map(r => r.id === editRule ? { ...r, ...form } : r);
    setRules(updated);
    saveDocRules(updated);
    logDocAudit({ action: "Rule Edited", module: "Document Numbering", record: form.type, oldVal: "", newVal: form.prefix, reason: "Admin edit", user: "Admin" });
    setEditRule(null);
  };
  const toggleStatus = (id) => {
    const updated = rules.map(r => r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r);
    setRules(updated); saveDocRules(updated);
  };
  const addRule = () => {
    if (!newRule.type || !newRule.prefix || !newRule.id) return;
    const updated = [...rules, { ...newRule, id: newRule.id || newRule.prefix.toLowerCase() }];
    setRules(updated); saveDocRules(updated);
    logDocAudit({ action: "Rule Created", module: "Document Numbering", record: newRule.type, oldVal: "", newVal: newRule.prefix, reason: "Admin created", user: "Admin" });
    setShowAdd(false);
  };

  const SEP_OPTS = ["None","Hyphen","Slash","Dot"];
  const RESET_OPTS = ["Never","Daily","Monthly","Quarterly","Financial Year","Calendar Year"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Document Rules</h2>
        <Button onClick={() => setShowAdd(true)} className="h-8 bg-primary text-black font-heading uppercase text-[10px] tracking-wider rounded-sm px-3">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule
        </Button>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search document type or prefix..."
          className="pl-9 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
      </div>

      {showAdd && (
        <div className="bg-[hsl(0,0%,11%)] border border-primary/30 rounded-sm p-4 space-y-3">
          <p className="font-heading text-[10px] uppercase text-primary">New Document Numbering Rule</p>
          <div className="grid grid-cols-3 gap-3">
            {[["id","Rule ID (unique)"],["type","Document Type"],["prefix","Prefix"]].map(([k,l]) => (
              <div key={k}>
                <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">{l}</label>
                <Input value={newRule[k]} onChange={e => setNewRule(x => ({...x,[k]:e.target.value}))} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-8" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={addRule} className="h-7 bg-primary text-black font-heading uppercase text-[10px] rounded-sm px-3">Save</Button>
            <Button onClick={() => setShowAdd(false)} variant="outline" className="h-7 rounded-sm text-[10px] border-[hsl(0,0%,25%)] text-white/40">Cancel</Button>
          </div>
        </div>
      )}

      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Document Type","Prefix","Next #","Padding","Separator","Reset","Preview","Status","Actions"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-[hsl(0,0%,11%)]">
                {editRule === r.id ? (
                  <>
                    <td className="px-3 py-2 text-white font-semibold">{r.type}</td>
                    <td className="px-3 py-2"><Input value={form.prefix} onChange={e => handleFormChange("prefix", e.target.value)} className="w-20 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7" /></td>
                    <td className="px-3 py-2"><Input type="number" value={form.next} onChange={e => handleFormChange("next", Number(e.target.value))} className="w-20 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7" /></td>
                    <td className="px-3 py-2"><Input type="number" value={form.padding} onChange={e => handleFormChange("padding", Number(e.target.value))} className="w-16 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7" /></td>
                    <td className="px-3 py-2">
                      <select value={form.sep} onChange={e => handleFormChange("sep", e.target.value)} className="bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7 px-1">
                        {SEP_OPTS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select value={form.reset} onChange={e => handleFormChange("reset", e.target.value)} className="bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7 px-1">
                        {RESET_OPTS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-primary font-mono font-bold text-[11px]">{previewNum}</td>
                    <td className="px-3 py-2"><Badge label={form.status} style={STATUS_STYLES[form.status] || STATUS_STYLES.active} /></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="px-2 py-1 bg-primary text-black rounded-sm text-[10px] font-heading uppercase">Save</button>
                        <button onClick={() => setEditRule(null)} className="px-2 py-1 bg-[hsl(0,0%,14%)] text-white/40 border border-[hsl(0,0%,22%)] rounded-sm text-[10px] font-heading uppercase">Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2.5 text-white font-semibold">{r.type}</td>
                    <td className="px-3 py-2.5 text-primary font-mono font-bold">{r.prefix}</td>
                    <td className="px-3 py-2.5 text-white/60">{r.next}</td>
                    <td className="px-3 py-2.5 text-white/40">{r.padding}</td>
                    <td className="px-3 py-2.5 text-white/40">{r.sep}</td>
                    <td className="px-3 py-2.5 text-white/40">{r.reset}</td>
                    <td className="px-3 py-2.5 text-primary font-mono text-[11px] font-bold">{previewDocNumber(r)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        <Badge label={r.status} style={STATUS_STYLES[r.status] || STATUS_STYLES.active} />
                        {r.locked && <Badge label="Locked" style={STATUS_STYLES.locked} />}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {!r.locked && <button onClick={() => startEdit(r)} className="px-2 py-1 bg-[hsl(0,0%,14%)] text-white/50 border border-[hsl(0,0%,22%)] rounded-sm text-[10px] font-heading uppercase hover:text-white">Edit</button>}
                        {r.locked && <Lock className="w-4 h-4 text-yellow-400 mt-0.5" />}
                        <button onClick={() => toggleStatus(r.id)} className={`px-2 py-1 rounded-sm text-[10px] font-heading uppercase border ${r.status === "active" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                          {r.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sequence Control ─────────────────────────────────────────────────────────
function SequenceControl({ rules, setRules }) {
  const [resetId, setResetId] = useState("");
  const [newNext, setNewNext] = useState(1);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const doReset = () => {
    if (!resetId || !reason) { setMsg("Select a rule and provide a reason."); return; }
    resetSequence("doc", resetId, Number(newNext), "Admin", reason);
    const updated = getDocRules();
    setRules(updated);
    setMsg(`Sequence reset for ${resetId} to ${newNext}.`);
    setReason(""); setResetId(""); setNewNext(1);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Sequence Control</h2>
      <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400 font-heading uppercase">⚠ Reducing a sequence below the highest issued number requires Super Admin approval. All resets are recorded in the Audit Log.</p>
      </div>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Reset Sequence (Super Admin)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Select Rule</label>
            <select value={resetId} onChange={e => setResetId(e.target.value)} className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-2 py-2">
              <option value="">— Select —</option>
              {rules.map(r => <option key={r.id} value={r.id}>{r.type} ({r.prefix})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">New Next Sequence</label>
            <Input type="number" value={newNext} onChange={e => setNewNext(e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
        </div>
        <div>
          <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Reason (Required)</label>
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide reason for reset..." className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
        </div>
        {msg && <p className="text-[10px] text-primary font-heading uppercase">{msg}</p>}
        <Button onClick={doReset} className="bg-primary text-black font-heading uppercase text-xs rounded-sm">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Sequence
        </Button>
      </div>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Current Sequences</p>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Document Type","Prefix","Next #","Reset","Preview"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {rules.map(r => (
              <tr key={r.id} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-4 py-2.5 text-white">{r.type}</td>
                <td className="px-4 py-2.5 text-primary font-mono font-bold">{r.prefix}</td>
                <td className="px-4 py-2.5 text-white/60">{r.next}</td>
                <td className="px-4 py-2.5 text-white/40">{r.reset}</td>
                <td className="px-4 py-2.5 text-primary font-mono text-[11px] font-bold">{previewDocNumber(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
function AuditLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { setLogs(getDocAuditLog()); }, []);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Document Numbering Audit Log</h2>
        <Button variant="outline" className="h-8 rounded-sm text-[10px] border-[hsl(0,0%,25%)] text-white/50 font-heading uppercase">
          <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
        </Button>
      </div>
      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Date/Time","User","Action","Module","Record","Old Value","New Value","Reason"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {logs.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No audit events yet.</td></tr>
            )}
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-3 py-2.5 text-white/40 font-mono text-[10px] whitespace-nowrap">{l.dt}</td>
                <td className="px-3 py-2.5 text-white">{l.user}</td>
                <td className="px-3 py-2.5"><span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-sm text-[9px] font-heading uppercase">{l.action}</span></td>
                <td className="px-3 py-2.5 text-white/40">{l.module}</td>
                <td className="px-3 py-2.5 text-primary font-mono">{l.record}</td>
                <td className="px-3 py-2.5 text-white/40">{l.oldVal || "—"}</td>
                <td className="px-3 py-2.5 text-white/70">{l.newVal}</td>
                <td className="px-3 py-2.5 text-white/40">{l.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Simple placeholder tabs ──────────────────────────────────────────────────
function PrefixManagement({ rules }) {
  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Prefix Management</h2>
      <div className="p-3 bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm space-y-2">
        {rules.map(r => (
          <div key={r.id} className="flex items-center justify-between py-2 border-b border-[hsl(0,0%,14%)] last:border-0">
            <div>
              <span className="text-primary font-mono font-bold text-sm mr-3">{r.prefix}</span>
              <span className="text-white/60 text-xs">{r.type}</span>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded-sm text-[9px] font-heading uppercase border ${STATUS_STYLES[r.status]}`}>{r.status}</span>
              {r.locked && <span className="px-2 py-0.5 rounded-sm text-[9px] font-heading uppercase border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Locked</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BranchRules() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Branch / Warehouse Rules</h2>
      <div className="p-4 bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm space-y-3">
        {[["Karratha (KAR)","Include branch code in document numbers","Enabled"],["Dampier (DAM)","Include branch code in document numbers","Enabled"]].map(([b,d,s]) => (
          <div key={b} className="flex justify-between items-center py-2 border-b border-[hsl(0,0%,14%)] last:border-0">
            <div>
              <p className="text-xs font-heading uppercase text-white">{b}</p>
              <p className="text-[10px] text-white/30">{d}</p>
            </div>
            <span className="px-2 py-0.5 rounded-sm text-[9px] font-heading uppercase border bg-green-500/10 text-green-400 border-green-500/20">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinancialYearRules({ rules }) {
  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Financial Year Rules</h2>
      <div className="p-4 bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm">
        <p className="text-[10px] text-white/30 mb-3 font-heading uppercase">Rules that reset on Financial Year</p>
        {rules.filter(r => r.reset === "Financial Year").map(r => (
          <div key={r.id} className="flex justify-between py-2 border-b border-[hsl(0,0%,14%)] last:border-0">
            <span className="text-white text-xs">{r.type}</span>
            <span className="text-primary font-mono text-xs">{r.prefix}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManualOverrides({ rules }) {
  const [targetId, setTargetId] = useState("");
  const [overrideNum, setOverrideNum] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState("");

  const check = () => {
    if (!targetId || !overrideNum || !reason) { setResult("All fields required."); return; }
    const used = isDocNumberUsed(overrideNum);
    if (used) { setResult(`❌ BLOCKED: ${overrideNum} is already in use.`); return; }
    const rule = rules.find(r => r.id === targetId);
    if (rule && !rule.manualOk) { setResult(`❌ BLOCKED: Manual override not permitted for ${rule.type}. Super Admin approval required.`); return; }
    setResult(`✓ Override validated: ${overrideNum} is available and logged.`);
    logDocAudit({ action: "Manual Override", module: "Document Numbering", record: overrideNum, oldVal: "", newVal: overrideNum, reason, user: "Admin", approvalReq: true });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Manual Overrides</h2>
      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-sm">
        <p className="text-[10px] text-red-400 font-heading uppercase">⚠ Manual overrides are restricted and require permission, reason, duplicate check, and audit logging. Locked documents cannot be overridden.</p>
      </div>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <div>
          <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Document Type</label>
          <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-2 py-2">
            <option value="">— Select —</option>
            {rules.map(r => <option key={r.id} value={r.id}>{r.type} ({r.prefix})</option>)}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Override Number</label>
          <Input value={overrideNum} onChange={e => setOverrideNum(e.target.value)} placeholder="e.g. INV-99999" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
        </div>
        <div>
          <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Reason (Required)</label>
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for override..." className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
        </div>
        {result && <p className={`text-[11px] font-heading uppercase ${result.startsWith("✓") ? "text-primary" : "text-red-400"}`}>{result}</p>}
        <Button onClick={check} className="bg-primary text-black font-heading uppercase text-xs rounded-sm">Validate & Log Override</Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DocumentNumbering() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [rules, setRules] = useState([]);

  useEffect(() => { setRules(getDocRules()); }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":  return <Dashboard rules={rules} />;
      case "rules":      return <DocumentRules rules={rules} setRules={setRules} />;
      case "prefix":     return <PrefixManagement rules={rules} />;
      case "sequence":   return <SequenceControl rules={rules} setRules={setRules} />;
      case "branch":     return <BranchRules />;
      case "fy":         return <FinancialYearRules rules={rules} />;
      case "overrides":  return <ManualOverrides rules={rules} />;
      case "audit":      return <AuditLog />;
      default:           return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Document Numbering"
        subtitle="Auto-sequencing control centre for all ERP document types"
        actions={
          <div className="flex items-center gap-2 text-[10px] font-heading uppercase text-white/30">
            <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/60">Document Numbering</span>
          </div>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-52 flex-shrink-0 bg-[hsl(0,0%,7%)] border-r border-[hsl(0,0%,14%)] overflow-y-auto">
          <div className="py-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all group ${active ? "bg-primary/10 border-r-2 border-primary text-primary" : "text-white/40 hover:text-white/70 hover:bg-[hsl(0,0%,10%)]"}`}>
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-primary" : "text-white/25 group-hover:text-white/50"}`} />
                  <span className="text-[10px] font-heading uppercase tracking-wider">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-[hsl(0,0%,9%)] p-6">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}