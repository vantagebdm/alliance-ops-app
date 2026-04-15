import StockAdjustmentForm from "@/components/inventory/StockAdjustmentForm";

export default function QuickAdjustmentForm({ onClose, onSaved, contextData = {} }) {
  return (
    <StockAdjustmentForm
      onClose={onClose}
      onSaved={onSaved}
      prefillPart={contextData?.part || null}
      prefillWarehouse={contextData?.warehouse || null}
    />
  );
}