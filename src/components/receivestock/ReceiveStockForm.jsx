import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { generateDocNumber } from "@/hooks/useDocNumber";
import { X, ChevronLeft, ChevronRight, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReceiptTypeSelector from "./ReceiptTypeSelector";
import POSelector from "./POSelector";
import ReceiptHeader from "./ReceiptHeader";
import ReceiptLines from "./ReceiptLines";
import ManualReceiptLines from "./ManualReceiptLines";
import InvoiceMatching from "./InvoiceMatching";
import VariancesPanel from "./VariancesPanel";
import ReceiptAttachments from "./ReceiptAttachments";

const STEPS_PO = [
  { id: "type", label: "Type" },
  { id: "po", label: "Select PO" },
  { id: "header", label: "Header" },
  { id: "lines", label: "Lines" },
  { id: "invoice", label: "Invoice Match" },
  { id: "variances", label: "Variances" },
  { id: "attachments", label: "Attachments" },
];

const STEPS_MANUAL = [
  { id: "type", label: "Type" },
  { id: "header", label: "Header" },
  { id: "lines", label: "Lines" },
  { id: "invoice", label: "Invoice Match" },
  { id: "attachments", label: "Attachments" },
];

const defaultForm = () => ({
  receipt_date: new Date().toISOString().slice(0, 10),
  supplier_name: "",
  received_by: "",
  checked_by: "",
  supplier_invoice_number: "",
  supplier_invoice_total: 0,
  packing_slip_number: "",
  freight_reference: "",
  warehouse: "",
  notes: "",
  manual_receipt_reason: "",
  lines: [],
  variances: [],
  attachments: [],
});

export default function ReceiveStockForm({ onClose, onSaved, initialPO }) {
  const [receiptType, setReceiptType] = useState(initialPO ? "po_receipt" : "");
  const [stepIdx, setStepIdx] = useState(initialPO ? 2 : 0);
  const [form, setForm] = useState({
    ...defaultForm(),
    purchase_order_id: initialPO?.id || "",
    po_number: initialPO?.po_number || "",
    supplier_name: initialPO?.supplier_name || "",
    supplier_id: initialPO?.supplier_id || "",
    lines: buildLinesFromPO(initialPO),
  });
  const [selectedPO, setSelectedPO] = useState(initialPO || null);
  const [saving, setSaving] = useState(false);
  const [grNumber, setGrNumber] = useState("");

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const steps = receiptType === "po_receipt" ? STEPS_PO : STEPS_MANUAL;
  const currentStep = steps[stepIdx];

  function buildLinesFromPO(po) {
    if (!po?.items?.length) return [];
    return po.items.map(item => ({
      _id: Math.random().toString(36).slice(2),
      part_number: item.part_number || "",
      description: item.description || "",
      supplier_part_number: "",
      ordered_qty: item.quantity || 0,
      previously_received_qty: 0,
      outstanding_qty: item.quantity || 0,
      qty_received_now: 0,
      unit_cost: item.unit_cost || 0,
      freight_allocated: 0,
      surcharge_allocated: 0,
      landed_cost: item.unit_cost || 0,
      discount: 0,
      warehouse: "",
      bin: "",
      condition: "good",
      destination: "available_stock",
      line_status: "open",
      notes: "",
      selected: true,
    }));
  }

  const handlePOSelect = (po) => {
    if (!po) {
      setSelectedPO(null);
      setForm(f => ({ ...f, purchase_order_id: "", po_number: "", supplier_name: "", supplier_id: "", lines: [] }));
      return;
    }
    setSelectedPO(po);
    setForm(f => ({
      ...f,
      purchase_order_id: po.id,
      po_number: po.po_number,
      supplier_name: po.supplier_name,
      supplier_id: po.supplier_id || "",
      lines: buildLinesFromPO(po),
    }));
  };

  const receiptTotal = (form.lines || []).reduce((sum, l) => {
    return sum + ((l.unit_cost || 0) + (l.freight_allocated || 0)) * (l.qty_received_now || 0);
  }, 0);

  const canPost = () => {
    if (!form.supplier_name) return false;
    if (!form.receipt_date) return false;
    if (receiptType === "manual" && !form.manual_receipt_reason) return false;
    const hasQty = form.lines.some(l => (l.qty_received_now || 0) > 0);
    return hasQty;
  };

  const postReceipt = async (status = "posted") => {
    setSaving(true);
    const gr = grNumber || await generateDocNumber("goods_receipt");
    setGrNumber(gr);

    // Update PO line quantities if linked
    if (form.purchase_order_id && selectedPO) {
      const updatedItems = (selectedPO.items || []).map(item => {
        const matchingLine = form.lines.find(l => l.part_number === item.part_number);
        if (!matchingLine) return item;
        const newReceived = (item.received_qty || 0) + (matchingLine.qty_received_now || 0);
        const outstanding = (item.quantity || 0) - newReceived;
        return { ...item, received_qty: newReceived, outstanding_qty: outstanding };
      });
      const allReceived = updatedItems.every(i => (i.outstanding_qty || 0) <= 0);
      await base44.entities.PurchaseOrder.update(form.purchase_order_id, {
        items: updatedItems,
        status: allReceived ? "received" : "partial",
      });
    }

    // Update part stock levels for each line
    for (const line of form.lines) {
      if ((line.qty_received_now || 0) <= 0) continue;
      if (line.condition === "good" && line.destination === "available_stock") {
        const parts = await base44.entities.Part.filter({ part_number: line.part_number });
        if (parts.length > 0) {
          const part = parts[0];
          await base44.entities.Part.update(part.id, {
            stock_quantity: (part.stock_quantity || 0) + (line.qty_received_now || 0),
            unit_cost: line.unit_cost || part.unit_cost,
            landed_cost: line.landed_cost || part.landed_cost,
            location: line.warehouse || part.location,
            bin: line.bin || part.bin,
          });
        }
      }
    }

    const grData = {
      ...form,
      gr_number: gr,
      receipt_type: receiptType,
      status,
      receipt_total: receiptTotal,
      activity_log: [
        {
          timestamp: new Date().toISOString(),
          user: "Current User",
          action: status === "posted" ? "Receipt Posted" : "Draft Saved",
          detail: `GR ${gr} ${status === "posted" ? "posted" : "saved as draft"} — ${form.lines.filter(l => l.qty_received_now > 0).length} lines received`,
        },
      ],
    };

    const saved = await base44.entities.GoodsReceipt.create(grData);
    setSaving(false);
    onSaved?.(saved);
  };

  const handleTypeSelect = (type) => {
    setReceiptType(type);
    setStepIdx(1);
    if (type !== "po_receipt") {
      setSelectedPO(null);
      setForm(f => ({ ...f, lines: [], purchase_order_id: "", po_number: "" }));
    }
  };

  const renderStep = () => {
    if (!currentStep) return null;
    switch (currentStep.id) {
      case "type":
        return <ReceiptTypeSelector value={receiptType} onChange={handleTypeSelect} />;
      case "po":
        return (
          <div>
            <POSelector selectedPO={selectedPO} onSelect={handlePOSelect} />
            {selectedPO && (
              <div className="px-6 pb-4">
                <div className="bg-muted/20 border border-border rounded-sm p-4">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider mb-2">PO Lines Preview</h3>
                  <div className="text-sm text-muted-foreground">{form.lines.length} line(s) loaded — proceed to Lines step to set quantities.</div>
                </div>
              </div>
            )}
          </div>
        );
      case "header":
        return <ReceiptHeader form={form} update={update} grNumber={grNumber} receiptType={receiptType} />;
      case "lines":
        return receiptType === "manual"
          ? <ManualReceiptLines lines={form.lines} onChange={v => update("lines", v)} form={form} update={update} />
          : <ReceiptLines lines={form.lines} onChange={v => update("lines", v)} defaultWarehouse={form.warehouse} />;
      case "invoice":
        return <InvoiceMatching form={form} update={update} receiptTotal={receiptTotal} />;
      case "variances":
        return <VariancesPanel variances={form.variances || []} onChange={v => update("variances", v)} lines={form.lines} />;
      case "attachments":
        return <ReceiptAttachments attachments={form.attachments || []} onChange={v => update("attachments", v)} />;
      default:
        return null;
    }
  };

  const isLastStep = stepIdx === steps.length - 1;
  const isFirstStep = stepIdx === 0;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-sm shadow-2xl flex flex-col mx-4" style={{ minHeight: "min(94vh, 950px)" }}>

        {/* Header */}
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-center justify-between rounded-t-sm flex-shrink-0">
          <div>
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Receive Stock</h2>
            <p className="text-white/40 text-[10px] font-heading uppercase tracking-wider mt-0.5">
              {grNumber ? grNumber : "Goods Receipt"} · Step {stepIdx + 1} of {steps.length} — {currentStep?.label}
            </p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step nav */}
        <div className="bg-[hsl(0,0%,11%)] px-4 py-2 flex gap-1 overflow-x-auto flex-shrink-0">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => receiptType ? setStepIdx(i) : null}
              disabled={!receiptType && i > 0}
              className={`flex-shrink-0 px-3 py-1.5 text-[9px] font-heading uppercase tracking-wider rounded-sm transition-colors ${
                stepIdx === i
                  ? "bg-primary text-black font-bold"
                  : i < stepIdx
                  ? "text-white/70 hover:text-white hover:bg-white/5"
                  : "text-white/30 cursor-default"
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/10 border-t border-border flex items-center justify-between flex-shrink-0">
          <Button
            type="button" variant="outline" size="sm"
            disabled={isFirstStep}
            onClick={() => setStepIdx(s => s - 1)}
            className="rounded-sm font-heading text-[10px] uppercase tracking-wider"
          >
            <ChevronLeft className="w-3 h-3 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button" variant="outline" size="sm"
              onClick={() => postReceipt("draft")}
              disabled={saving || !form.supplier_name}
              className="rounded-sm font-heading text-[10px] uppercase tracking-wider"
            >
              <Save className="w-3 h-3 mr-1" /> {saving ? "Saving..." : "Save Draft"}
            </Button>

            {isLastStep ? (
              <Button
                type="button" size="sm"
                onClick={() => postReceipt("posted")}
                disabled={saving || !canPost()}
                className="bg-primary text-black font-heading font-bold uppercase text-[10px] tracking-wider hover:bg-primary/90 rounded-sm"
              >
                <Check className="w-3 h-3 mr-1" /> {saving ? "Posting..." : "Post Receipt"}
              </Button>
            ) : (
              <Button
                type="button" size="sm"
                onClick={() => setStepIdx(s => s + 1)}
                disabled={currentStep?.id === "type" && !receiptType}
                className="bg-primary text-black font-heading font-bold uppercase text-[10px] tracking-wider hover:bg-primary/90 rounded-sm"
              >
                Next <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}