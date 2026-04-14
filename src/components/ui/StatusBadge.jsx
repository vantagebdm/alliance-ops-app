const STATUS_STYLES = {
  // Green
  active: "bg-green-500/10 text-green-400 border border-green-500/30",
  complete: "bg-green-500/10 text-green-400 border border-green-500/30",
  completed: "bg-green-500/10 text-green-400 border border-green-500/30",
  paid: "bg-green-500/10 text-green-400 border border-green-500/30",
  delivered: "bg-green-500/10 text-green-400 border border-green-500/30",
  accepted: "bg-green-500/10 text-green-400 border border-green-500/30",
  received: "bg-green-500/10 text-green-400 border border-green-500/30",
  confirmed: "bg-green-500/10 text-green-400 border border-green-500/30",
  converted: "bg-green-500/10 text-green-400 border border-green-500/30",
  // Amber
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  under_review: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  waiting_on_customer: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  pricing_in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  sourcing_in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  processing: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  draft: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  partial: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  normal: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
  // Blue
  sent: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  quoted: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  ready: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  packed: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  picked: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  dispatched: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  in_transit: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  ready_to_pick: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  collected: "bg-green-500/10 text-green-400 border border-green-500/30",
  partial: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  // Red
  urgent: "bg-red-500/10 text-red-400 border border-red-500/30",
  breakdown: "bg-red-600/15 text-red-400 border border-red-500/40 animate-pulse",
  overdue: "bg-red-500/10 text-red-400 border border-red-500/30",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/30",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/30",
  expired: "bg-red-500/10 text-red-400 border border-red-500/30",
  out_of_stock: "bg-red-500/10 text-red-400 border border-red-500/30",
  problem: "bg-red-500/10 text-red-400 border border-red-500/30",
  // Grey
  new: "bg-sky-500/10 text-sky-400 border border-sky-500/30",
  closed: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
  inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
  on_order: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
  discontinued: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const style = STATUS_STYLES[status] || "bg-gray-500/10 text-gray-400 border border-gray-500/30";
  const label = status.replace(/_/g, " ").toUpperCase();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-heading font-semibold tracking-wider rounded-sm ${style}`}>
      {label}
    </span>
  );
}