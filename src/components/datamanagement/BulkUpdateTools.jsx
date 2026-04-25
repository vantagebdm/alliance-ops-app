import { useState } from "react";
import { Edit3, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const BULK_ACTIONS = [
  { group: "Parts & Inventory", sensitive: false, actions: [
    "Parts Category", "Parts Status", "GST Code", "Reorder Level", "Bin Location", "Warehouse Location",
  ]},
  { group: "Pricing (Requires Approval)", sensitive: true, actions: [
    "Cost Price", "Sell Price", "Margin Percentage",
  ]},
  { group: "Suppliers & Customers", sensitive: false, actions: [
    "Supplier Terms", "Customer Terms", "Customer Credit Limit",
  ]},
  { group: "Status Updates", sensitive: false, actions: [
    "Product Status", "Inventory Status", "Supplier Status", "Customer Status",
  ]},
  { group: "Admin Only (Super Admin)", sensitive: true, actions: [
    "User Status", "Role Assignment",
  ]},
];

const DEMO_PARTS = [
  { id: 1, pn: "APP-ENG0042", name: "Oil Filter — Cat 3406",         cat: "engine",   cost: 18.50, sell: 39.95, status: "active" },
  { id: 2, pn: "APP-FLT0012", name: "Air Filter — Komatsu PC200",    cat: "filters",  cost: 22.00, sell: 47.50, status: "active" },
  { id: 3, pn: "APP-BRK0008", name: "Brake Pad Set — Volvo FH",      cat: "brakes",   cost: 85.00, sell: 168.00, status: "active"},
  { id: 4, pn: "APP-ENG0018", name: "Injector — Cummins ISX",        cat: "engine",   cost: 340.00, sell: 680.00, status: "active"},
  { id: 5, pn: "APP-HYD0006", name: "Hydraulic Seal Kit",            cat: "hydraulic",cost: 45.00, sell: 92.00, status: "inactive"},
];

export default function BulkUpdateTools() {
  const [selectedAction, setSelectedAction] = useState("");
  const [newValue, setNewValue] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [step, setStep] = useState(0); // 0=select 1=preview 2=done
  const [applying, setApplying] = useState(false);

  const sensitiveAction = BULK_ACTIONS.flatMap(g => g.sensitive ? g.actions : []).includes(selectedAction);

  const toggleRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedRows(prev => prev.length === DEMO_PARTS.length ? [] : DEMO_PARTS.map(p => p.id));

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => { setApplying(false); setStep(2); }, 1200);
  };

  const reset = () => { setStep(0); setSelectedRows([]); setNewValue(""); setSelectedAction(""); };

  return (
    <div className="space-y-4 max-w-5xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Bulk Update Tools</h2>

      {step === 0 && (
        <>
          {/* Action selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-4">
              <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Select Bulk Action</p>
              {BULK_ACTIONS.map(group => (
                <div key={group.group}>
                  <p className="text-[9px] font-heading uppercase tracking-widest text-white/20 mb-2 flex items-center gap-1.5">
                    {group.sensitive && <ShieldAlert className="w-3 h-3 text-yellow-400" />}
                    {group.group}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.actions.map(a => (
                      <button key={a} onClick={() => setSelectedAction(a)}
                        className={`px-2.5 py-1.5 rounded-sm text-[10px] font-heading uppercase tracking-wider border transition-all ${
                          selectedAction === a
                            ? "bg-primary/10 border-primary text-primary"
                            : group.sensitive
                              ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-400/60 hover:text-yellow-400 hover:border-yellow-500/40"
                              : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/50 hover:text-white hover:border-white/30"
                        }`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-4">
              <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">New Value</p>
              {selectedAction ? (
                <>
                  <div>
                    <label className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-2 block">Set {selectedAction} To:</label>
                    <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder={`Enter new ${selectedAction.toLowerCase()} value`}
                      className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
                  </div>
                  {sensitiveAction && (
                    <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
                      <div className="flex items-center gap-2 text-yellow-400 text-[10px] font-heading uppercase">
                        <AlertTriangle className="w-4 h-4" /> Approval Required
                      </div>
                      <p className="text-[10px] text-yellow-400/60 mt-1">This bulk update requires approval before execution. An approval request will be created.</p>
                    </div>
                  )}
                  <p className="text-[10px] text-white/30">{selectedRows.length} record(s) selected</p>
                  <Button onClick={() => selectedRows.length && newValue && setStep(1)}
                    disabled={!selectedRows.length || !newValue}
                    className="w-full bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
                    Preview Changes →
                  </Button>
                </>
              ) : (
                <p className="text-[10px] text-white/20 font-heading uppercase">Select an action to continue</p>
              )}
            </div>
          </div>

          {/* Record selection table */}
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)] flex items-center justify-between">
              <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Select Records — {selectedRows.length}/{DEMO_PARTS.length} selected</p>
              <button onClick={toggleAll} className="text-[10px] font-heading uppercase text-primary hover:underline">
                {selectedRows.length === DEMO_PARTS.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                <th className="px-4 py-2.5 w-8" />
                {["Part Number","Name","Category","Cost","Sell","Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {DEMO_PARTS.map(p => (
                  <tr key={p.id} onClick={() => toggleRow(p.id)}
                    className={`cursor-pointer hover:bg-[hsl(0,0%,11%)] ${selectedRows.includes(p.id) ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-2.5">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedRows.includes(p.id) ? "bg-primary border-primary" : "border-[hsl(0,0%,35%)]"}`}>
                        {selectedRows.includes(p.id) && <div className="w-2 h-2 bg-black rounded-sm" />}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-primary font-mono text-[11px]">{p.pn}</td>
                    <td className="px-4 py-2.5 text-white">{p.name}</td>
                    <td className="px-4 py-2.5 text-white/50">{p.cat}</td>
                    <td className="px-4 py-2.5 text-white/50">${p.cost}</td>
                    <td className="px-4 py-2.5 text-white/50">${p.sell}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${p.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[hsl(0,0%,16%)] text-white/30 border-[hsl(0,0%,22%)]"}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {step === 1 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Preview Changes — {selectedAction}</h3>
          <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
            <p className="text-[10px] text-yellow-400 font-heading uppercase">⚠ This will update {selectedRows.length} records. This action will be logged in Data Audit Log.</p>
          </div>
          <div className="space-y-1 text-sm">
            {[["Action", selectedAction], ["New Value", newValue], ["Records", `${selectedRows.length} selected`], ["Approval Required", sensitiveAction ? "Yes" : "No"]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-[hsl(0,0%,15%)]">
                <span className="text-[10px] font-heading uppercase tracking-wider text-white/30">{k}</span>
                <span className="text-xs text-white">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">← Back</Button>
            <Button onClick={handleApply} disabled={applying} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              {applying ? "Applying..." : "Apply Bulk Update"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <h3 className="font-heading text-lg uppercase tracking-wider text-primary">Bulk Update Complete</h3>
          <p className="text-white/50 text-sm">{selectedRows.length} records updated · Logged in Data Audit Log</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">Rollback Update</Button>
            <Button onClick={reset} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">New Bulk Update</Button>
          </div>
        </div>
      )}
    </div>
  );
}