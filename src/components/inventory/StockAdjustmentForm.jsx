import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Save, CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateDocNumber } from "@/hooks/useDocNumber";

const ADJUSTMENT_TYPES = [
  { value: "adjustment_in", label: "Adjustment In" },
  { value: "adjustment_out", label: "Adjustment Out" },
  { value: "stock_correction", label: "Stock Correction" },
  { value: "damaged_writedown", label: "Damaged Stock Write-down" },
  { value: "found_stock", label: "Found Stock" },
  { value: "lost_missing", label: "Lost / Missing Stock" },
  { value: "internal_use", label: "Internal Use / Workshop Use" },
  { value: "quarantine_move", label: "Quarantine Move" },
  { value: "return_to_available", label: "Return to Available" },
  { value: "opening_balance", label: "Manual Opening Balance" },
  { value: "other", label: "Other" },
];

const REASON_CODES = [
  { value: "count_variance", label: "Count Variance" },
  { value: "damage", label: "Damage" },
  { value: "theft_loss", label: "Theft / Loss" },
  { value: "mispick_correction", label: "Mis-pick Correction" },
  { value: "supplier_short_shipment", label: "Supplier Short Shipment Correction" },
  { value: "initial_load", label: "Initial Load" },
  { value: "workshop_consumption", label: "Workshop Consumption" },
  { value: "warranty_stock_hold", label: "Warranty Stock Hold" },
  { value: "obsolete_writeoff", label: "Obsolete Stock Write-off" },
  { value: "admin_correction", label: "Admin Correction" },
  { value: "other", label: "Other" },
];

const WAREHOUSES = ["Main Warehouse", "Karratha", "Port Hedland", "Newman", "Workshop", "Yard"];

export default function StockAdjustmentForm({ onClose, onSaved, prefillPart = null, prefillWarehouse = null }) {
  const [form, setForm] = useState({
    adjustment_date: new Date().toISOString().split("T")[0],
    part_number: prefillPart?.part_number || "",
    part_description: prefillPart?.name || "",
    part_id: prefillPart?.id || "",
    warehouse: prefillWarehouse || "Main Warehouse",
    bin: "",
    adjustment_type: "",
    reason_code: "",
    qty_before: 0,
    adjustment_qty: 0,
    qty_after: 0,
    unit_cost: prefillPart?.unit_cost || 0,
    value_impact: 0,
    notes: "",
    other_reason: "",
    performed_by: "",
    approved_by: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);
  const [partSearch, setPartSearch] = useState(prefillPart?.part_number || "");
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [showPartDrop, setShowPartDrop] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, performed_by: u?.full_name || u?.email || "" }));
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

  const selectPart = async (part) => {
    setPartSearch(part.part_number);
    setShowPartDrop(false);
    const qtyBefore = part.stock_quantity || 0;
    setForm(f => ({
      ...f,
      part_id: part.id,
      part_number: part.part_number,
      part_description: part.name,
      unit_cost: part.unit_cost || 0,
      qty_before: qtyBefore,
    }));
    // Check for inventory balance record
    const balances = await base44.entities.InventoryBalance.filter({ part_id: part.id, warehouse: form.warehouse });
    if (balances.length > 0) setCurrentBalance(balances[0]);
  };

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === "adjustment_qty" || k === "adjustment_type" || k === "qty_before") {
      const adj = parseFloat(k === "adjustment_qty" ? v : next.adjustment_qty) || 0;
      const before = parseFloat(k === "qty_before" ? v : next.qty_before) || 0;
      const type = k === "adjustment_type" ? v : next.adjustment_type;
      const isOut = ["adjustment_out", "damaged_writedown", "lost_missing", "internal_use", "quarantine_move"].includes(type);
      const after = isOut ? before - Math.abs(adj) : before + Math.abs(adj);
      next.qty_after = Math.max(0, after);
      next.value_impact = (after - before) * (next.unit_cost || 0);
    }
    return next;
  });

  const handleSave = async (postNow = false) => {
    if (!form.part_number || !form.adjustment_type || !form.reason_code) return;
    setSaving(true);
    const adjNum = await generateDocNumber("stock_adjustment");
    const movNum = await generateDocNumber("stock_movement");

    const adj = await base44.entities.StockAdjustment.create({
      ...form,
      adjustment_number: adjNum,
      status: postNow ? "posted" : "draft",
    });

    // Create stock movement record
    const isOut = ["adjustment_out", "damaged_writedown", "lost_missing", "internal_use"].includes(form.adjustment_type);
    await base44.entities.StockMovement.create({
      movement_number: movNum,
      movement_date: new Date().toISOString(),
      part_id: form.part_id,
      part_number: form.part_number,
      part_description: form.part_description,
      movement_type: "stock_adjustment",
      qty_in: isOut ? 0 : Math.abs(form.adjustment_qty),
      qty_out: isOut ? Math.abs(form.adjustment_qty) : 0,
      unit_cost: form.unit_cost,
      value_impact: form.value_impact,
      to_warehouse: form.warehouse,
      to_bin: form.bin,
      source_reference: adjNum,
      source_type: "stock_adjustment",
      performed_by: form.performed_by,
      notes: form.notes,
    });

    if (postNow && form.part_id) {
      // Update part stock quantity
      const part = await base44.entities.Part.filter({ id: form.part_id });
      if (part.length > 0) {
        await base44.entities.Part.update(form.part_id, {
          stock_quantity: form.qty_after,
        });
      }
      // Notification for large adjustment
      if (Math.abs(form.adjustment_qty) >= 10 || Math.abs(form.value_impact) >= 500) {
        await base44.entities.Notification.create({
          type: "stock_adjustment",
          category: "inventory",
          priority: "important",
          title: `Stock Adjustment Posted — ${form.part_number}`,
          description: `${form.adjustment_type.replace(/_/g, " ")} of ${form.adjustment_qty} units (${adjNum})`,
          entity_type: "StockAdjustment",
          entity_id: adj.id,
          entity_ref: adjNum,
        });
      }
    }

    setSaving(false);
    onSaved?.();
  };

  const qtyAfterColor = form.qty_after < 0 ? "text-red-500" : form.qty_after === 0 ? "text-amber-500" : "text-primary";

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[hsl(0,0%,10%)] w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-secondary px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-white">Stock Adjustment</h2>
            <p className="text-white/50 text-xs mt-0.5">Record inventory quantity change</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Part Selection */}
          <div className="bg-muted/40 border border-border rounded-sm p-4 space-y-3">
            <h3 className="font-heading text-xs uppercase tracking-wider text-foreground/50 font-semibold">Part & Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Part Number *</label>
                <input
                  value={partSearch}
                  onChange={e => { setPartSearch(e.target.value); setShowPartDrop(true); }}
                  placeholder="Search part number..."
                  className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {showPartDrop && partSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-[hsl(0,0%,12%)] border border-border rounded-sm shadow-lg z-50 max-h-40 overflow-y-auto mt-0.5">
                    {partSuggestions.map(p => (
                      <button key={p.id} type="button" onClick={() => selectPart(p)}
                        className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm transition-colors">
                        <span className="font-mono font-bold text-primary text-xs">{p.part_number}</span>
                        <span className="ml-2 text-muted-foreground text-xs">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
                <Input value={form.part_description} readOnly className="bg-muted/30 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Warehouse *</label>
                <Select value={form.warehouse} onValueChange={v => set("warehouse", v)}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{WAREHOUSES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Bin / Location</label>
                <Input value={form.bin} onChange={e => set("bin", e.target.value)} placeholder="e.g. A3-12" className="rounded-sm" />
              </div>
            </div>

            {/* Current Stock Balances */}
            {form.part_number && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { label: "On Hand", value: form.qty_before, color: "text-foreground" },
                  { label: "Quarantine", value: currentBalance?.quarantine || 0, color: "text-amber-500" },
                  { label: "Damaged", value: currentBalance?.damaged || 0, color: "text-red-500" },
                  { label: "Allocated", value: currentBalance?.allocated || 0, color: "text-blue-500" },
                ].map(b => (
                  <div key={b.label} className="bg-secondary/5 border border-border rounded-sm p-2 text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{b.label}</div>
                    <div className={`font-heading font-bold text-lg ${b.color}`}>{b.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adjustment Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Adjustment Type *</label>
              <Select value={form.adjustment_type} onValueChange={v => set("adjustment_type", v)}>
                <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>{ADJUSTMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Reason Code *</label>
              <Select value={form.reason_code} onValueChange={v => set("reason_code", v)}>
                <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent>{REASON_CODES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Adjustment Date</label>
              <Input type="date" value={form.adjustment_date} onChange={e => set("adjustment_date", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Unit Cost ($)</label>
              <Input type="number" value={form.unit_cost} onChange={e => set("unit_cost", parseFloat(e.target.value) || 0)} className="rounded-sm" />
            </div>
          </div>

          {/* Qty Fields */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-sm border border-border p-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Qty Before</label>
              <div className="font-heading text-2xl font-bold text-foreground">{form.qty_before}</div>
            </div>
            <div className="bg-[hsl(0,0%,13%)] rounded-sm border-2 border-primary p-3">
              <label className="text-xs font-medium text-primary uppercase tracking-wider block mb-1">Adjustment Qty *</label>
              <Input
                type="number"
                value={form.adjustment_qty}
                onChange={e => set("adjustment_qty", parseFloat(e.target.value) || 0)}
                className="border-0 p-0 h-8 font-heading text-2xl font-bold focus-visible:ring-0 bg-transparent"
              />
            </div>
            <div className="bg-muted/30 rounded-sm border border-border p-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Qty After</label>
              <div className={`font-heading text-2xl font-bold ${qtyAfterColor}`}>{form.qty_after}</div>
            </div>
          </div>

          {/* Value Impact */}
          <div className="bg-secondary/5 border border-border rounded-sm p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Value Impact</span>
            <span className={`font-heading text-lg font-bold ${form.value_impact < 0 ? "text-red-500" : "text-primary"}`}>
              {form.value_impact < 0 ? "-" : "+"}${Math.abs(form.value_impact).toFixed(2)}
            </span>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Performed By</label>
              <Input value={form.performed_by} onChange={e => set("performed_by", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Approved By</label>
              <Input value={form.approved_by} onChange={e => set("approved_by", e.target.value)} className="rounded-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                className="flex w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[70px]"
                placeholder="Additional notes..." />
            </div>
            {form.reason_code === "other" && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Other Reason *</label>
                <Input value={form.other_reason} onChange={e => set("other_reason", e.target.value)} placeholder="Describe reason..." className="rounded-sm" />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 flex justify-between items-center flex-shrink-0 bg-muted/20">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider font-heading">Cancel</button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving} className="rounded-sm font-heading text-xs uppercase tracking-wider">
              <Save className="w-4 h-4 mr-1" /> Save Draft
            </Button>
            <Button size="sm" onClick={() => handleSave(true)} disabled={saving || !form.part_number || !form.adjustment_type || !form.reason_code}
              className="bg-primary text-black rounded-sm font-heading text-xs uppercase tracking-wider hover:bg-primary/90">
              <CheckCircle className="w-4 h-4 mr-1" />
              {saving ? "Posting..." : "Post Adjustment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}