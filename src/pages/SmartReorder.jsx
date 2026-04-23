import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { generateDocNumber } from "@/hooks/useDocNumber";
import { AlertTriangle, Package, Plus, FileDown, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import ReorderSupplierGroup from "@/components/purchasing/ReorderSupplierGroup";
import ReorderPDFModal from "@/components/purchasing/ReorderPDFModal";

export default function SmartReorder() {
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLines, setSelectedLines] = useState({}); // { partId: { include, qty, unit_cost, supplier_name } }
  const [pdfTarget, setPdfTarget] = useState(null); // { supplier_name, lines }
  const [saving, setSaving] = useState(null); // supplier_name being saved
  const [savedPOs, setSavedPOs] = useState({}); // { supplier_name: po_number }

  const load = async () => {
    setLoading(true);
    const [allParts, allSuppliers] = await Promise.all([
      base44.entities.Part.list("-created_date", 500),
      base44.entities.Supplier.list("name", 200),
    ]);
    setParts(allParts);
    setSuppliers(allSuppliers);

    // Auto-select all low-stock parts
    const initial = {};
    allParts.forEach(p => {
      const qty = p.stock_quantity || 0;
      const min = p.min_stock_level || 0;
      if (qty <= min && (p.preferred_supplier || p.supplier_name)) {
        initial[p.id] = {
          include: true,
          qty: p.reorder_qty || Math.max(1, min - qty),
          unit_cost: p.unit_cost || 0,
          supplier_name: p.preferred_supplier || p.supplier_name || "",
        };
      }
    });
    setSelectedLines(initial);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group low-stock parts by preferred supplier
  const lowStockParts = parts.filter(p => {
    const qty = p.stock_quantity || 0;
    const min = p.min_stock_level || 0;
    return qty <= min;
  });

  // Group by supplier
  const bySupplier = {};
  lowStockParts.forEach(p => {
    const sup = p.preferred_supplier || p.supplier_name || "— No Supplier Assigned —";
    if (!bySupplier[sup]) bySupplier[sup] = [];
    bySupplier[sup].push(p);
  });

  const updateLine = (partId, changes) => {
    setSelectedLines(prev => ({
      ...prev,
      [partId]: { ...prev[partId], ...changes }
    }));
  };

  const getSupplierLines = (supplierName) => {
    return (bySupplier[supplierName] || [])
      .filter(p => selectedLines[p.id]?.include)
      .map(p => ({
        part_number: p.part_number,
        app_part_number: p.app_part_number,
        description: p.name,
        quantity: selectedLines[p.id]?.qty || 1,
        unit_cost: selectedLines[p.id]?.unit_cost || p.unit_cost || 0,
        get total() { return this.quantity * this.unit_cost; }
      }));
  };

  const createPO = async (supplierName) => {
    const lines = getSupplierLines(supplierName);
    if (!lines.length) return;
    setSaving(supplierName);
    const po_number = await generateDocNumber("purchase_order", "parts");
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const po = await base44.entities.PurchaseOrder.create({
      po_number,
      supplier_name: supplierName,
      status: "draft",
      po_type: "parts",
      items: lines.map(l => ({ part_number: l.part_number, description: l.description, quantity: l.quantity, unit_cost: l.unit_cost, total: l.total })),
      subtotal,
      gst: subtotal * 0.1,
      total: subtotal * 1.1,
      notes: "Auto-generated from Smart Reorder — low stock replenishment.",
    });
    setSavedPOs(prev => ({ ...prev, [supplierName]: po.id }));
    setSaving(null);
  };

  const supplierNames = Object.keys(bySupplier).sort();

  return (
    <div>
      <PageHeader
        title="Smart Reorder"
        subtitle="Auto-populated low stock purchase orders by supplier"
        actions={
          <Button onClick={load} variant="outline" className="rounded-sm font-heading text-xs uppercase tracking-wider">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : lowStockParts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-heading uppercase tracking-wider text-sm">All stock levels are healthy</p>
            <p className="text-xs mt-1">No parts are at or below minimum stock levels.</p>
          </div>
        ) : (
          <>
            {/* Summary banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-amber-700 font-heading text-xs uppercase tracking-wider font-semibold">
                {lowStockParts.length} parts at or below minimum stock · {supplierNames.length} supplier{supplierNames.length !== 1 ? "s" : ""} to order from
              </span>
            </div>

            {supplierNames.map(supplierName => (
              <ReorderSupplierGroup
                key={supplierName}
                supplierName={supplierName}
                parts={bySupplier[supplierName]}
                selectedLines={selectedLines}
                onUpdateLine={updateLine}
                onCreatePO={() => createPO(supplierName)}
                onExportPDF={() => setPdfTarget({ supplier_name: supplierName, lines: getSupplierLines(supplierName) })}
                saving={saving === supplierName}
                savedPOId={savedPOs[supplierName]}
              />
            ))}
          </>
        )}
      </div>

      {pdfTarget && (
        <ReorderPDFModal
          supplier_name={pdfTarget.supplier_name}
          lines={pdfTarget.lines}
          onClose={() => setPdfTarget(null)}
        />
      )}
    </div>
  );
}