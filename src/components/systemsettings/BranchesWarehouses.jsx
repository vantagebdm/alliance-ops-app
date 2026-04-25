import { useState } from "react";
import { Plus, Pencil, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INIT_BRANCHES = [
  { id: 1, name: "Karratha", code: "KAR", address: "14 Industrial Dr, Karratha WA 6714", phone: "(08) 9144 1234", email: "kar@allianceparts.com.au", manager: "Admin User", status: "active" },
  { id: 2, name: "Dampier", code: "DAM", address: "5 Maitland Rd, Dampier WA 6713", phone: "(08) 9144 2345", email: "dam@allianceparts.com.au", manager: "Sarah A", status: "active" },
];
const INIT_WAREHOUSES = [
  { id: 1, name: "Main Store", code: "KAR-01", branch: "Karratha", address: "14 Industrial Dr", bin_format: "A-01-01", recv: "RECV-BAY", dispatch: "DISPATCH-BAY", status: "active", is_default: true },
  { id: 2, name: "Dampier Store", code: "DAM-01", branch: "Dampier", address: "5 Maitland Rd", bin_format: "A-01-01", recv: "RECV-BAY", dispatch: "DISPATCH-BAY", status: "active", is_default: false },
];

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[hsl(0,0%,16%)] text-white/30 border-[hsl(0,0%,22%)]"}`}>{status}</span>
);

const emptyBranch = { name: "", code: "", address: "", phone: "", email: "", manager: "", status: "active" };
const emptyWarehouse = { name: "", code: "", branch: "", address: "", bin_format: "A-01-01", recv: "", dispatch: "", status: "active", is_default: false };

export default function BranchesWarehouses() {
  const [branches, setBranches] = useState(INIT_BRANCHES);
  const [warehouses, setWarehouses] = useState(INIT_WAREHOUSES);
  const [editBranch, setEditBranch] = useState(null);
  const [editWarehouse, setEditWarehouse] = useState(null);
  const [bForm, setBForm] = useState(emptyBranch);
  const [wForm, setWForm] = useState(emptyWarehouse);

  const saveBranch = () => {
    if (!bForm.name || !bForm.code) return;
    if (editBranch === "new") { setBranches(b => [...b, { ...bForm, id: Date.now() }]); }
    else { setBranches(b => b.map(x => x.id === editBranch ? { ...x, ...bForm } : x)); }
    setEditBranch(null);
  };
  const saveWarehouse = () => {
    if (!wForm.name || !wForm.code) return;
    if (editWarehouse === "new") { setWarehouses(w => [...w, { ...wForm, id: Date.now() }]); }
    else { setWarehouses(w => w.map(x => x.id === editWarehouse ? { ...x, ...wForm } : x)); }
    setEditWarehouse(null);
  };
  const toggleBranchStatus = (id) => setBranches(b => b.map(x => x.id === id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x));
  const toggleWarehouseStatus = (id) => setWarehouses(w => w.map(x => x.id === id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x));
  const setDefaultWarehouse = (id) => setWarehouses(w => w.map(x => ({ ...x, is_default: x.id === id })));

  return (
    <div className="space-y-6 max-w-5xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Branches & Warehouses</h2>

      <div className="p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400 font-heading uppercase">⚠ Deactivating a branch or warehouse with existing transactions requires Super Admin approval.</p>
      </div>

      {/* Branches */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)] flex items-center justify-between">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Branches ({branches.length})</p>
          <Button onClick={() => { setBForm(emptyBranch); setEditBranch("new"); }} className="h-7 bg-primary text-black font-heading uppercase text-[10px] tracking-wider rounded-sm px-3">
            <Plus className="w-3 h-3 mr-1" /> Add Branch
          </Button>
        </div>
        {editBranch && (
          <div className="p-4 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,10%)] space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[["name","Branch Name"],["code","Branch Code"],["phone","Phone"],["email","Email"],["manager","Manager"],["address","Address"]].map(([k,l]) => (
                <div key={k}>
                  <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">{l}</label>
                  <Input value={bForm[k]} onChange={e => setBForm(f => ({...f,[k]:e.target.value}))}
                    className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-8" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveBranch} className="h-7 bg-primary text-black font-heading uppercase text-[10px] rounded-sm px-3">Save</Button>
              <Button onClick={() => setEditBranch(null)} variant="outline" className="h-7 rounded-sm text-[10px] border-[hsl(0,0%,25%)] text-white/40">Cancel</Button>
            </div>
          </div>
        )}
        <table className="w-full text-xs">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Branch","Code","Address","Phone","Manager","Status","Actions"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {branches.map(b => (
              <tr key={b.id} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-4 py-2.5 text-white font-semibold">{b.name}</td>
                <td className="px-4 py-2.5 text-primary font-mono text-[10px]">{b.code}</td>
                <td className="px-4 py-2.5 text-white/50">{b.address}</td>
                <td className="px-4 py-2.5 text-white/50">{b.phone}</td>
                <td className="px-4 py-2.5 text-white/50">{b.manager}</td>
                <td className="px-4 py-2.5"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <button onClick={() => { setBForm(b); setEditBranch(b.id); }} className="px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-[hsl(0,0%,14%)] text-white/50 border border-[hsl(0,0%,22%)] hover:text-white"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => toggleBranchStatus(b.id)} className={`px-2 py-1 rounded-sm text-[10px] font-heading uppercase border ${b.status === "active" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                      {b.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Warehouses */}
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)] flex items-center justify-between">
          <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Warehouses ({warehouses.length})</p>
          <Button onClick={() => { setWForm(emptyWarehouse); setEditWarehouse("new"); }} className="h-7 bg-primary text-black font-heading uppercase text-[10px] tracking-wider rounded-sm px-3">
            <Plus className="w-3 h-3 mr-1" /> Add Warehouse
          </Button>
        </div>
        {editWarehouse && (
          <div className="p-4 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,10%)] space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[["name","Warehouse Name"],["code","Code"],["branch","Branch"],["address","Address"],["bin_format","Bin Format"],["recv","Default Receiving"],["dispatch","Default Dispatch"]].map(([k,l]) => (
                <div key={k}>
                  <label className="text-[9px] font-heading uppercase text-white/30 block mb-1">{l}</label>
                  <Input value={wForm[k]} onChange={e => setWForm(f => ({...f,[k]:e.target.value}))}
                    className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs h-8" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveWarehouse} className="h-7 bg-primary text-black font-heading uppercase text-[10px] rounded-sm px-3">Save</Button>
              <Button onClick={() => setEditWarehouse(null)} variant="outline" className="h-7 rounded-sm text-[10px] border-[hsl(0,0%,25%)] text-white/40">Cancel</Button>
            </div>
          </div>
        )}
        <table className="w-full text-xs">
          <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
            {["Warehouse","Code","Branch","Bin Format","Status","Default","Actions"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {warehouses.map(w => (
              <tr key={w.id} className="hover:bg-[hsl(0,0%,11%)]">
                <td className="px-4 py-2.5 text-white font-semibold">{w.name}</td>
                <td className="px-4 py-2.5 text-primary font-mono text-[10px]">{w.code}</td>
                <td className="px-4 py-2.5 text-white/50">{w.branch}</td>
                <td className="px-4 py-2.5 text-white/40 font-mono">{w.bin_format}</td>
                <td className="px-4 py-2.5"><StatusBadge status={w.status} /></td>
                <td className="px-4 py-2.5">
                  {w.is_default
                    ? <span className="flex items-center gap-1 text-[10px] text-primary font-heading uppercase"><CheckCircle2 className="w-3 h-3" /> Default</span>
                    : <button onClick={() => setDefaultWarehouse(w.id)} className="text-[10px] text-white/30 hover:text-primary font-heading uppercase">Set Default</button>
                  }
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <button onClick={() => { setWForm(w); setEditWarehouse(w.id); }} className="px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-[hsl(0,0%,14%)] text-white/50 border border-[hsl(0,0%,22%)] hover:text-white"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => toggleWarehouseStatus(w.id)} className={`px-2 py-1 rounded-sm text-[10px] font-heading uppercase border ${w.status === "active" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                      {w.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}