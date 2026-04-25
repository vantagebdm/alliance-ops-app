import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LayoutDashboard, Tag, Hash, GitMerge, AlertTriangle, Sliders, Download, ClipboardList, Plus, Search, RefreshCw, CheckCircle2, XCircle, Eye } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPartCats, savePartCats, previewAppPartNumber, getPartAuditLog, logPartAudit, resetSequence, getPartHistory, getCrossRefs, saveCrossRef, checkPartDuplicate, DEFAULT_PART_CATS } from "@/lib/numberingEngine";

const TABS = [
  { id: "dashboard",  label: "Dashboard",           icon: LayoutDashboard },
  { id: "categories", label: "Category Prefixes",   icon: Tag },
  { id: "generator",  label: "Part # Generator",    icon: Hash },
  { id: "crossref",   label: "Cross Reference",     icon: GitMerge },
  { id: "duplicates", label: "Duplicate Detection", icon: AlertTriangle },
  { id: "sequence",   label: "Sequence Control",    icon: Sliders },
  { id: "importexport",label: "Import / Export",    icon: Download },
  { id: "audit",      label: "Audit Log",           icon: ClipboardList },
];

const STATUS_STYLES = {
  active:   "bg-green-500/10 text-green-400 border-green-500/20",
  inactive: "bg-[hsl(0,0%,16%)] text-white/30 border-[hsl(0,0%,22%)]",
  archived: "bg-red-500/10 text-red-400 border-red-500/20",
};

const Badge = ({ label, style }) => (
  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-heading uppercase border ${style}`}>{label}</span>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ cats }) {
  const history = getPartHistory();
  const active = cats.filter(c => c.status === "active").length;
  const totalIssued = history.length;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Part Numbering Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Categories",      val: cats.length,  color: "text-white" },
          { label: "Active",          val: active,        color: "text-primary" },
          { label: "Numbers Issued",  val: totalIssued,   color: "text-blue-400" },
          { label: "Cross Refs",      val: getCrossRefs().length, color: "text-yellow-400" },
        ].map(k => (
          <div key={k.label} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
            <p className="text-[10px] font-heading uppercase tracking-widest text-white/30">{k.label}</p>
            <p className={`text-3xl font-heading font-bold mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)]">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Category Prefix Overview</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 divide-x divide-y divide-[hsl(0,0%,14%)]">
          {cats.map(c => (
            <div key={c.id} className="p-3 hover:bg-[hsl(0,0%,12%)]">
              <p className="text-primary font-mono font-bold text-sm">APP-{c.prefix}</p>
              <p className="text-[10px] text-white/40 font-heading uppercase mt-0.5">{c.name}</p>
              <p className="text-[10px] text-white/20 mt-1">Next: {previewAppPartNumber(c)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Category Prefixes ────────────────────────────────────────────────────────
function CategoryPrefixes({ cats, setCats }) {
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState({ id: "", name: "", prefix: "", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts", account: "1300 – Inventory Asset", notes: "" });

  const filtered = cats.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.prefix.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (c) => { setEditId(c.id); setForm({ ...c }); };
  const saveEdit = () => {
    const updated = cats.map(c => c.id === editId ? { ...c, ...form } : c);
    setCats(updated); savePartCats(updated);
    logPartAudit({ action: "Category Prefix Edited", module: "Part Numbering", record: form.name, oldVal: "", newVal: form.prefix, reason: "Admin edit", user: "Admin" });
    setEditId(null);
  };
  const toggleStatus = (id) => {
    const updated = cats.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c);
    setCats(updated); savePartCats(updated);
  };
  const addCat = () => {
    if (!newCat.name || !newCat.prefix || !newCat.id) return;
    const updated = [...cats, { ...newCat }];
    setCats(updated); savePartCats(updated);
    logPartAudit({ action: "Category Prefix Created", module: "Part Numbering", record: newCat.name, oldVal: "", newVal: newCat.prefix, reason: "Admin created", user: "Admin" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Category Prefixes</h2>
        <Button onClick={() => setShowAdd(true)} className="h-8 bg-primary text-black font-heading uppercase text-[10px] tracking-wider rounded-sm px-3">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
        </Button>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search category or prefix..."
          className="pl-9 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
      </div>

      {showAdd && (
        <div className="bg-[hsl(0,0%,11%)] border border-primary/30 rounded-sm p-4 space-y-3">
          <p className="font-heading text-[10px] uppercase text-primary">New Category Prefix</p>
          <div className="grid grid-cols-4 gap-3">
            {[["id","ID"],["name","Category Name"],["prefix","Prefix"],["marginGroup","Margin Group"]].map(([k,l]) => (
              <div key={k}>
                <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">{l}</label>
                <Input value={newCat[k]} onChange={e => setNewCat(x => ({...x,[k]:e.target.value}))} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-8" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={addCat} className="h-7 bg-primary text-black font-heading uppercase text-[10px] rounded-sm px-3">Save</Button>
            <Button onClick={() => setShowAdd(false)} variant="outline" className="h-7 rounded-sm text-[10px] border-[hsl(0,0%,25%)] text-white/40">Cancel</Button>
          </div>
        </div>
      )}

      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-xs min-w-[800px]">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Category","Prefix","Next #","Padding","Preview","Margin Group","Status","Actions"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-[hsl(0,0%,11%)]">
                {editId === c.id ? (
                  <>
                    <td className="px-3 py-2"><Input value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} className="w-28 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7" /></td>
                    <td className="px-3 py-2"><Input value={form.prefix} onChange={e => setForm(f => ({...f,prefix:e.target.value.toUpperCase()}))} className="w-16 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7" /></td>
                    <td className="px-3 py-2"><Input type="number" value={form.next} onChange={e => setForm(f => ({...f,next:Number(e.target.value)}))} className="w-16 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7" /></td>
                    <td className="px-3 py-2"><Input type="number" value={form.padding} onChange={e => setForm(f => ({...f,padding:Number(e.target.value)}))} className="w-16 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7" /></td>
                    <td className="px-3 py-2 text-primary font-mono font-bold text-[11px]">{previewAppPartNumber({...form})}</td>
                    <td className="px-3 py-2"><Input value={form.marginGroup} onChange={e => setForm(f => ({...f,marginGroup:e.target.value}))} className="w-24 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-7" /></td>
                    <td className="px-3 py-2"><Badge label={form.status} style={STATUS_STYLES[form.status]} /></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="px-2 py-1 bg-primary text-black rounded-sm text-[10px] font-heading uppercase">Save</button>
                        <button onClick={() => setEditId(null)} className="px-2 py-1 bg-[hsl(0,0%,14%)] text-white/40 border border-[hsl(0,0%,22%)] rounded-sm text-[10px] font-heading uppercase">Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2.5 text-white font-semibold">{c.name}</td>
                    <td className="px-3 py-2.5 text-primary font-mono font-bold">APP-{c.prefix}</td>
                    <td className="px-3 py-2.5 text-white/60">{c.next}</td>
                    <td className="px-3 py-2.5 text-white/40">{c.padding}</td>
                    <td className="px-3 py-2.5 text-primary font-mono text-[11px] font-bold">{previewAppPartNumber(c)}</td>
                    <td className="px-3 py-2.5 text-white/50">{c.marginGroup}</td>
                    <td className="px-3 py-2.5"><Badge label={c.status} style={STATUS_STYLES[c.status]} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(c)} className="px-2 py-1 bg-[hsl(0,0%,14%)] text-white/50 border border-[hsl(0,0%,22%)] rounded-sm text-[10px] font-heading uppercase hover:text-white">Edit</button>
                        <button onClick={() => toggleStatus(c.id)} className={`px-2 py-1 rounded-sm text-[10px] font-heading uppercase border ${c.status === "active" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                          {c.status === "active" ? "Deactivate" : "Activate"}
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

// ─── Generator ────────────────────────────────────────────────────────────────
function Generator({ cats }) {
  const [catId, setCatId] = useState(cats[0]?.id || "");
  const [oemNumber, setOemNumber] = useState("");
  const [supplierNumber, setSupplierNumber] = useState("");
  const [barcode, setBarcode] = useState("");
  const [partName, setPartName] = useState("");
  const [generated, setGenerated] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [blocked, setBlocked] = useState(false);

  const selectedCat = cats.find(c => c.id === catId);
  const preview = selectedCat ? previewAppPartNumber(selectedCat) : "—";

  const validate = () => {
    const dupeWarnings = checkPartDuplicate({ oemNumber, supplierNumber, barcode });
    setWarnings(dupeWarnings);
    setBlocked(dupeWarnings.some(w => w.level === "block"));
    return dupeWarnings.every(w => w.level !== "block");
  };

  const generate = () => {
    if (!validate()) return;
    if (!catId || !partName) { setWarnings([{ level: "block", field: "Required", message: "Select a category and enter a part name." }]); return; }
    const num = preview;
    // Advance the sequence
    const cats2 = getPartCats();
    const idx = cats2.findIndex(c => c.id === catId);
    if (idx !== -1) {
      cats2[idx] = { ...cats2[idx], next: cats2[idx].next + 1 };
      savePartCats(cats2);
    }
    setGenerated(num);
    logPartAudit({ action: "APP Part Number Generated", module: "Part Numbering", record: num, oldVal: "", newVal: num, reason: `New part: ${partName}`, user: "Admin" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">APP Part Number Generator</h2>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1.5">Part Category <span className="text-red-400">*</span></label>
            <select value={catId} onChange={e => setCatId(e.target.value)} className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-2 py-2">
              {cats.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name} (APP-{c.prefix})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1.5">Part Name <span className="text-red-400">*</span></label>
            <Input value={partName} onChange={e => setPartName(e.target.value)} placeholder="e.g. Oil Filter - Caterpillar D6R" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1.5">Genuine / OEM Number</label>
            <Input value={oemNumber} onChange={e => setOemNumber(e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1.5">Supplier Part Number</label>
            <Input value={supplierNumber} onChange={e => setSupplierNumber(e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1.5">Barcode / SKU</label>
            <Input value={barcode} onChange={e => setBarcode(e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
        </div>

        <div className="p-3 bg-[hsl(0,0%,9%)] border border-[hsl(0,0%,20%)] rounded-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-heading uppercase text-white/30">Next APP Part Number Preview</p>
            <p className="text-2xl font-heading font-bold text-primary mt-1">{preview}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30">Category</p>
            <p className="text-white text-xs font-heading uppercase">{selectedCat?.name || "—"}</p>
          </div>
        </div>

        {warnings.map((w, i) => (
          <div key={i} className={`p-2.5 rounded-sm text-[10px] font-heading uppercase ${w.level === "block" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"}`}>
            {w.level === "block" ? "❌ BLOCKED" : "⚠ WARNING"} — {w.field}: {w.message}
          </div>
        ))}

        {generated && (
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[10px] text-white/40 font-heading uppercase">APP Part Number Assigned</p>
              <p className="text-primary font-mono font-bold text-lg">{generated}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={validate} variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50 font-heading uppercase">Check Duplicates</Button>
          <Button onClick={generate} disabled={blocked} className="bg-primary text-black font-heading font-semibold uppercase text-xs rounded-sm">
            <Hash className="w-3.5 h-3.5 mr-1" /> Generate APP Number
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Cross Reference ──────────────────────────────────────────────────────────
function CrossReference() {
  const [refs, setRefs] = useState([]);
  const [form, setForm] = useState({ appNumber: "", type: "OEM", value: "", supplierName: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { setRefs(getCrossRefs()); }, []);

  const add = () => {
    if (!form.appNumber || !form.value) { setMsg("APP number and reference value required."); return; }
    saveCrossRef(form);
    setRefs(getCrossRefs());
    logPartAudit({ action: "Cross Reference Added", module: "Part Numbering", record: form.appNumber, oldVal: "", newVal: `${form.type}: ${form.value}`, reason: "Admin added", user: "Admin" });
    setMsg("Cross reference saved.");
    setForm({ appNumber: "", type: "OEM", value: "", supplierName: "" });
  };

  const REF_TYPES = ["OEM","Supplier","Manufacturer","Aftermarket","Superseded","Previous","Barcode","SKU"];

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Cross Reference Rules</h2>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Add Cross Reference</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">APP Part Number</label>
            <Input value={form.appNumber} onChange={e => setForm(f => ({...f,appNumber:e.target.value}))} placeholder="APP-ENG0001" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Reference Type</label>
            <select value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))} className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-2 py-2">
              {REF_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Reference Value</label>
            <Input value={form.value} onChange={e => setForm(f => ({...f,value:e.target.value}))} placeholder="e.g. 1R-0750" className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Supplier Name (if Supplier type)</label>
            <Input value={form.supplierName} onChange={e => setForm(f => ({...f,supplierName:e.target.value}))} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
        </div>
        {msg && <p className="text-[10px] text-primary font-heading uppercase">{msg}</p>}
        <Button onClick={add} className="bg-primary text-black font-heading font-semibold uppercase text-xs rounded-sm">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Reference
        </Button>
      </div>

      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["APP Part Number","Reference Type","Reference Value","Supplier","Added"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {refs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No cross references yet.</td></tr>}
            {refs.map(r => (
              <tr key={r.id} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-4 py-2.5 text-primary font-mono font-bold">{r.appNumber}</td>
                <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-sm text-[9px] font-heading uppercase">{r.type}</span></td>
                <td className="px-4 py-2.5 text-white font-mono">{r.value}</td>
                <td className="px-4 py-2.5 text-white/50">{r.supplierName || "—"}</td>
                <td className="px-4 py-2.5 text-white/30 text-[10px]">{new Date(r.createdAt).toLocaleDateString("en-AU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────
function DuplicateDetection() {
  const [checks, setChecks] = useState({ appNumber: "", oemNumber: "", supplierNumber: "", barcode: "", description: "" });
  const [results, setResults] = useState([]);
  const [checked, setChecked] = useState(false);

  const run = () => {
    const warnings = checkPartDuplicate(checks);
    setResults(warnings);
    setChecked(true);
    logPartAudit({ action: "Duplicate Check Run", module: "Part Numbering", record: checks.appNumber || checks.oemNumber, oldVal: "", newVal: "Check performed", reason: "Manual check", user: "Admin" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Duplicate Detection</h2>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Check for Duplicates</h3>
        <div className="grid grid-cols-2 gap-3">
          {[["appNumber","APP Part Number"],["oemNumber","OEM / Genuine Number"],["supplierNumber","Supplier Part Number"],["barcode","Barcode / SKU"],["description","Part Description"]].map(([k,l]) => (
            <div key={k}>
              <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">{l}</label>
              <Input value={checks[k]} onChange={e => setChecks(c => ({...c,[k]:e.target.value}))} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            </div>
          ))}
        </div>
        <Button onClick={run} className="bg-primary text-black font-heading font-semibold uppercase text-xs rounded-sm">
          <Search className="w-3.5 h-3.5 mr-1" /> Run Duplicate Check
        </Button>
      </div>

      {checked && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-primary text-sm font-heading uppercase">No Duplicates Found — All values are unique.</span>
            </div>
          ) : results.map((w, i) => (
            <div key={i} className={`p-3 rounded-sm border ${w.level === "block" ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
              <div className="flex items-center gap-2">
                {w.level === "block" ? <XCircle className="w-4 h-4 text-red-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                <span className={`text-[10px] font-heading uppercase font-bold ${w.level === "block" ? "text-red-400" : "text-yellow-400"}`}>{w.level === "block" ? "BLOCKED" : "WARNING"} — {w.field}</span>
              </div>
              <p className="text-white/60 text-xs mt-1 ml-6">{w.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sequence Control ─────────────────────────────────────────────────────────
function SequenceControl({ cats, setCats }) {
  const [catId, setCatId] = useState("");
  const [newNext, setNewNext] = useState(1);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const doReset = () => {
    if (!catId || !reason) { setMsg("Select a category and provide a reason."); return; }
    resetSequence("part", catId, Number(newNext), "Admin", reason);
    const updated = getPartCats();
    setCats(updated);
    setMsg(`Sequence reset for ${catId} to ${newNext}.`);
    setReason(""); setCatId(""); setNewNext(1);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Sequence Control</h2>
      <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400 font-heading uppercase">⚠ Reducing a sequence below the highest issued number requires Super Admin approval. MFA required for sequence resets.</p>
      </div>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Select Category</label>
            <select value={catId} onChange={e => setCatId(e.target.value)} className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-2 py-2">
              <option value="">— Select —</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name} (APP-{c.prefix})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">New Next Sequence</label>
            <Input type="number" value={newNext} onChange={e => setNewNext(e.target.value)} className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
        </div>
        <div>
          <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">Reason (Required)</label>
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for reset..." className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
        </div>
        {msg && <p className="text-[10px] text-primary font-heading uppercase">{msg}</p>}
        <Button onClick={doReset} className="bg-primary text-black font-heading uppercase text-xs rounded-sm">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Sequence
        </Button>
      </div>
      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Category","Prefix","Next #","Preview","Status"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {cats.map(c => (
              <tr key={c.id} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-4 py-2.5 text-white">{c.name}</td>
                <td className="px-4 py-2.5 text-primary font-mono font-bold">APP-{c.prefix}</td>
                <td className="px-4 py-2.5 text-white/60">{c.next}</td>
                <td className="px-4 py-2.5 text-primary font-mono text-[11px] font-bold">{previewAppPartNumber(c)}</td>
                <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-sm text-[9px] font-heading uppercase border ${STATUS_STYLES[c.status]}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImportExport({ cats }) {
  const exportCSV = () => {
    const headers = ["ID","Category Name","Prefix","Next Sequence","Padding","Status","Margin Group","GST Code"];
    const rows = cats.map(c => [c.id, c.name, `APP-${c.prefix}`, c.next, c.padding, c.status, c.marginGroup, c.gstCode]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "part-category-prefixes.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Import / Export</h2>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <p className="text-[10px] font-heading uppercase text-white/30">Export category prefix list as CSV for backup or review.</p>
        <Button onClick={exportCSV} variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60 hover:text-white font-heading uppercase">
          <Download className="w-3.5 h-3.5 mr-1" /> Export Category Prefix CSV
        </Button>
      </div>
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-3">
        <p className="text-[10px] font-heading uppercase text-white/30">Import category prefixes via Data Management module.</p>
        <Link to="/admin/data-management">
          <Button variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60 hover:text-white font-heading uppercase">
            Go to Data Management →
          </Button>
        </Link>
      </div>
    </div>
  );
}

function AuditLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { setLogs(getPartAuditLog()); }, []);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Part Numbering Audit Log</h2>
        <Button variant="outline" className="h-8 rounded-sm text-[10px] border-[hsl(0,0%,25%)] text-white/50 font-heading uppercase">
          <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
        </Button>
      </div>
      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Date/Time","User","Action","Module","Record","Old","New","Reason"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {logs.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No audit events yet.</td></tr>}
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PartNumbering() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cats, setCats] = useState([]);

  useEffect(() => { setCats(getPartCats()); }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":   return <Dashboard cats={cats} />;
      case "categories":  return <CategoryPrefixes cats={cats} setCats={setCats} />;
      case "generator":   return <Generator cats={cats} />;
      case "crossref":    return <CrossReference />;
      case "duplicates":  return <DuplicateDetection />;
      case "sequence":    return <SequenceControl cats={cats} setCats={setCats} />;
      case "importexport":return <ImportExport cats={cats} />;
      case "audit":       return <AuditLog />;
      default:            return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Part Numbering"
        subtitle="APP internal part number generation, category prefixes and cross-referencing"
        actions={
          <div className="flex items-center gap-2 text-[10px] font-heading uppercase text-white/30">
            <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/60">Part Numbering</span>
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