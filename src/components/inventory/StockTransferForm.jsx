import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Trash2, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateDocNumber } from "@/hooks/useDocNumber";

const TRANSFER_TYPES = [
  { value: "warehouse_to_warehouse", label: "Warehouse to Warehouse" },
  { value: "bin_to_bin", label: "Bin to Bin" },
  { value: "warehouse_to_workshop", label: "Warehouse to Workshop" },
  { value: "warehouse_to_customer_reserve", label: "Warehouse to Customer Reserve" },
  { value: "quarantine_to_available", label: "Quarantine to Available" },
  { value: "available_to_damaged", label: "Available to Damaged" },
  { value: "other", label: "Other" },
];

const WAREHOUSES = ["Main Warehouse", "Karratha", "Port Hedland", "Newman", "Workshop", "Yard"];

export default function StockTransferForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    transfer_type: "bin_to_bin",
    from_warehouse: "Main Warehouse",
    from_bin: "",
    to_warehouse: "Main Warehouse",
    to_bin: "",
    transfer_date: new Date().toISOString().split("T")[0],
    requested_by: "",
    approved_by: "",
    notes: "",
    status: "draft",
    lines: [],
  });
  const [saving, setSaving] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [showPartDrop, setShowPartDrop] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setForm(f => ({ ...f, requested_by: u?.full_name || u?.email || "" }));
    });
  }, []);

  useEffect(() => {
    if (partSearch.length < 2) { setPartSuggestions([]); return; }
    const timer = setTimeout(async () => {
      const parts = await base44.entities.Part.list("-created_date", 200);
      const q = partSearch.toLowerCase();
      setPartSuggestions(parts.filter(p =>
        p.part_number?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q)
      ).slice(0, 8));
      setShowPartDrop(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [partSearch]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addLine = (part) => {
    setPartSearch("");
    setShowPartDrop(false);
    if (form.lines.find(l => l.part_id === part.id)) return;
    setForm(f => ({
      ...f,
      lines: [...f.lines, {
        _id: `${part.id}_${Date.now()}`,
        part_id: part.id,
        part_number: part.part_number,
        description: part.name,
        available_qty: part.stock_quantity || 0,
        transfer_qty: 1,
        unit_cost: part.unit_cost || 0,
        notes: "",
      }]
    }));
  };

  const updateLine = (idx, k, v) => {
    setForm(f => ({
      ...f,
      lines: f.lines.map((l, i) => i === idx ? { ...l, [k]: v } : l)
    }));
  };

  const removeLine = (idx) => {
    setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (post = false) => {
    if (form.lines.length === 0) return;
    setSaving(true);
    const trNum = await generateDocNumber("stock_transfer");

    await base44.entities.StockTransfer.create({
      ...form,
      transfer_number: trNum,
      status: post ? "completed" : "approved",
    });

    if (post) {
      for (const line of form.lines) {
        const movNumOut = await generateDocNumber("stock_movement");
        const movNumIn = await generateDocNumber("stock_movement");
        await base44.entities.StockMovement.create({
          movement_number: movNumOut,
          movement_date: new Date().toISOString(),
          part_id: line.part_id,
          part_number: line.part_number,
          part_description: line.description,
          movement_type: "transfer_out",
          qty_in: 0,
          qty_out: line.transfer_qty,
          unit_cost: line.unit_cost,
          value_impact: -(line.transfer_qty * line.unit_cost),
          from_warehouse: form.from_warehouse,
          from_bin: form.from_bin,
          source_reference: trNum,
          source_type: "stock_transfer",
          notes: `Transfer out — ${trNum}`,
        });
        await base44.entities.StockMovement.create({
          movement_number: movNumIn,
          movement_date: new Date().toISOString(),
          part_id: line.part_id,
          part_number: line.part_number,
          part_description: line.description,
          movement_type: "transfer_in",
          qty_in: line.transfer_qty,
          qty_out: 0,
          unit_cost: line.unit_cost,
          value_impact: line.transfer_qty * line.unit_cost,
          to_warehouse: form.to_warehouse,
          to_bin: form.to_bin,
          source_reference: trNum,
          source_type: "stock_transfer",
          notes: `Transfer in — ${trNum}`,
        });
      }
      await base44.entities.Notification.create({
        type: "stock_adjustment",
        category: "inventory",
        priority: "normal",
        title: `Transfer Completed — ${trNum}`,
        description: `${form.lines.length} line(s) transferred from ${form.from_warehouse} to ${form.to_warehouse}`,
        entity_type: "StockTransfer",
        entity_ref: trNum,
      });
    }
    setSaving(false);
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[hsl(0,0%,10%)] w-full max-w-3xl rounded-sm shadow-2xl flex flex-col max-h-[92vh]">
        <div className="bg-secondary px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-white">Stock Transfer</h2>
            <p className="text-white/50 text-xs mt-0.5">Move stock between locations</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Transfer Type</label>
              <Select value={form.transfer_type} onValueChange={v => set("transfer_type", v)}>
                <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{TRANSFER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Transfer Date</label>
              <Input type="date" value={form.transfer_date} onChange={e => set("transfer_date", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Requested By</label>
              <Input value={form.requested_by} onChange={e => set("requested_by", e.target.value)} className="rounded-sm" />
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-5 gap-3 items-center">
            <div className="col-span-2 bg-red-500/10 border border-red-500/30 rounded-sm p-3 space-y-2">
              <div className="text-xs font-heading font-bold uppercase tracking-wider text-red-400">From</div>
              <Select value={form.from_warehouse} onValueChange={v => set("from_warehouse", v)}>
                <SelectTrigger className="rounded-sm h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{WAREHOUSES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={form.from_bin} onChange={e => set("from_bin", e.target.value)} placeholder="Bin / Location" className="rounded-sm h-8 text-xs" />
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="col-span-2 bg-green-500/10 border border-green-500/30 rounded-sm p-3 space-y-2">
              <div className="text-xs font-heading font-bold uppercase tracking-wider text-green-400">To</div>
              <Select value={form.to_warehouse} onValueChange={v => set("to_warehouse", v)}>
                <SelectTrigger className="rounded-sm h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{WAREHOUSES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={form.to_bin} onChange={e => set("to_bin", e.target.value)} placeholder="Bin / Location" className="rounded-sm h-8 text-xs" />
            </div>
          </div>

          {/* Part Search */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Add Parts</label>
            <div className="relative">
              <input
                value={partSearch}
                onChange={e => { setPartSearch(e.target.value); setShowPartDrop(true); }}
                placeholder="Search and add parts to transfer..."
                className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {showPartDrop && partSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-[hsl(0,0%,12%)] border border-border rounded-sm shadow-lg z-50 max-h-40 overflow-y-auto mt-0.5">
                  {partSuggestions.map(p => (
                    <button key={p.id} type="button" onClick={() => addLine(p)}
                      className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm transition-colors flex items-center gap-3">
                      <span className="font-mono font-bold text-primary text-xs">{p.part_number}</span>
                      <span className="text-muted-foreground text-xs flex-1">{p.name}</span>
                      <span className="text-xs text-muted-foreground">Stock: {p.stock_quantity || 0}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lines */}
          {form.lines.length > 0 && (
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Part #</th>
                    <th className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Available</th>
                    <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider w-24">Transfer Qty</th>
                    <th className="px-3 py-2 text-center font-heading text-[10px] uppercase tracking-wider">Unit Cost</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.lines.map((line, idx) => (
                    <tr key={line._id} className="border-t border-border/50">
                      <td className="px-3 py-1.5 font-mono text-xs font-bold text-primary">{line.part_number}</td>
                      <td className="px-3 py-1.5 text-xs text-muted-foreground max-w-[160px] truncate">{line.description}</td>
                      <td className="px-3 py-1.5 text-center text-sm font-bold">{line.available_qty}</td>
                      <td className="px-3 py-1.5">
                        <input type="number" value={line.transfer_qty} min={1} max={line.available_qty}
                          onChange={e => updateLine(idx, "transfer_qty", Math.min(line.available_qty, parseInt(e.target.value) || 0))}
                          className="w-20 text-center font-bold border-b-2 border-primary bg-transparent focus:outline-none text-sm" />
                      </td>
                      <td className="px-3 py-1.5 text-center text-xs text-muted-foreground">${line.unit_cost.toFixed(2)}</td>
                      <td className="px-3 py-1.5">
                        <button onClick={() => removeLine(idx)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              className="flex w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px]"
              placeholder="Transfer notes..." />
          </div>
        </div>

        <div className="border-t border-border px-5 py-3 flex justify-between items-center flex-shrink-0 bg-muted/20">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider font-heading">Cancel</button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleSubmit(false)} disabled={saving || form.lines.length === 0} className="rounded-sm font-heading text-xs uppercase tracking-wider">
              Save Draft
            </Button>
            <Button size="sm" onClick={() => handleSubmit(true)} disabled={saving || form.lines.length === 0}
              className="bg-primary text-black rounded-sm font-heading text-xs uppercase tracking-wider hover:bg-primary/90">
              <CheckCircle className="w-4 h-4 mr-1" />{saving ? "Processing..." : "Complete Transfer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}