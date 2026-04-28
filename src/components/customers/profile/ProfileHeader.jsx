import { useState } from "react";
import { Edit, FileText, Receipt, ShoppingCart, Upload, FileSearch, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import moment from "moment";
import { base44 } from "@/api/base44Client";

const ACCOUNT_STATUS_LABELS = {
  cash_sale: "Cash Sale", credit_pending: "Credit Pending", under_review: "Under Review",
  active_credit: "Active Credit", on_hold: "On Hold", declined: "Declined",
};
const ACCOUNT_STATUS_COLORS = {
  cash_sale: "text-gray-400 bg-gray-500/10 border border-gray-500/20",
  credit_pending: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
  under_review: "text-blue-400 bg-blue-500/10 border border-blue-500/20",
  active_credit: "text-green-400 bg-green-500/10 border border-green-500/20",
  on_hold: "text-red-400 bg-red-500/10 border border-red-500/20",
  declined: "text-red-600 bg-red-900/20 border border-red-700/30",
};
const TIER_COLORS = {
  retail: "text-gray-400", trade: "text-blue-400", fleet: "text-purple-400",
  workshop: "text-amber-400", contract: "text-green-400", custom: "text-pink-400",
};

const quickActions = [
  { icon: ShoppingCart, label: "New Order" },
  { icon: FileText, label: "New Quote" },
  { icon: Receipt, label: "New Invoice" },
  { icon: Upload, label: "Upload Doc" },
  { icon: FileSearch, label: "Credit App" },
];

export default function ProfileHeader({ customer, onEdit, onClose, onUpdated, onAction }) {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deactivateNotes, setDeactivateNotes] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  const acctColor = ACCOUNT_STATUS_COLORS[customer.account_status] || ACCOUNT_STATUS_COLORS.cash_sale;
  const tierColor = TIER_COLORS[customer.pricing_tier] || "text-gray-400";
  const isOnHold = customer.account_status === "on_hold";
  const isInactive = customer.status === "inactive";

  const toggleHold = async () => {
    const newStatus = isOnHold ? "active_credit" : "on_hold";
    await base44.entities.Customer.update(customer.id, { account_status: newStatus });
    onUpdated?.({ ...customer, account_status: newStatus });
  };

  const handleDeactivate = async () => {
    if (!deactivateReason) {
      alert("Please select a deactivation reason");
      return;
    }
    setDeactivating(true);
    try {
      await base44.entities.Customer.update(customer.id, {
        status: "inactive",
        internal_notes: `[DEACTIVATED ${moment().format("DD/MM/YYYY HH:mm")}]\nReason: ${deactivateReason}\nNotes: ${deactivateNotes}\n\n${customer.internal_notes || ""}`,
      });
      onUpdated?.({ ...customer, status: "inactive" });
      setShowDeactivateModal(false);
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="bg-[hsl(0,0%,6%)] px-6 py-5 rounded-t-sm">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-heading text-xl font-bold text-white uppercase tracking-widest leading-tight">
              {customer.name}
            </h2>
            <StatusBadge status={customer.status || "active"} />
            <span className={`text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm ${acctColor}`}>
              {ACCOUNT_STATUS_LABELS[customer.account_status] || customer.account_status}
            </span>
            {customer.created_by_method === "pdf_extraction" && (
              <span className="text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <FileSearch className="w-3 h-3" /> PDF Extracted
              </span>
            )}
          </div>
          {customer.trading_name && customer.trading_name !== customer.name && (
            <p className="text-white/50 text-xs font-heading uppercase tracking-wider mt-1">
              Trading as: {customer.trading_name}
            </p>
          )}
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            {customer.customer_type && (
              <span className="text-xs text-white/40 font-heading uppercase tracking-wider">
                {customer.customer_type.replace(/_/g, " ")}
              </span>
            )}
            {customer.pricing_tier && (
              <span className={`text-xs font-heading uppercase tracking-wider ${tierColor}`}>
                {customer.pricing_tier} pricing
              </span>
            )}
            {customer.payment_terms && (
              <span className="text-xs text-white/40">
                {customer.payment_terms.replace(/_/g, " ")} terms
              </span>
            )}
            {customer.service_region && (
              <span className="text-xs text-white/40 font-heading uppercase tracking-wider">
                {customer.service_region.replace(/_/g, " ")}
              </span>
            )}
            {customer.account_manager && (
              <span className="text-xs text-white/40">Mgr: {customer.account_manager}</span>
            )}
            <span className="text-xs text-white/30">
              Since {moment(customer.created_date).format("DD/MM/YYYY")}
            </span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isInactive && (
            <Button size="sm" variant="outline" onClick={() => setShowDeactivateModal(true)}
              className="border-red-600/60 text-red-400 hover:bg-red-500/10 rounded-sm font-heading text-xs uppercase tracking-wider">
              <XCircle className="w-3 h-3 mr-1" /> Deactivate
            </Button>
          )}
          {!isInactive && (
            <Button size="sm" variant="outline" onClick={toggleHold}
              className={`rounded-sm font-heading text-xs uppercase tracking-wider ${
                isOnHold
                  ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                  : "border-red-500/40 text-red-400 hover:bg-red-500/10"
              }`}>
              {isOnHold
                ? <><PlayCircle className="w-3 h-3 mr-1" /> Remove Hold</>
                : <><PauseCircle className="w-3 h-3 mr-1" /> Put On Hold</>
              }
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onEdit}
            className="border-white/20 text-white hover:bg-white/10 rounded-sm font-heading text-xs uppercase tracking-wider">
            <Edit className="w-3 h-3 mr-1" /> Edit
          </Button>
          <button onClick={onClose} className="text-white/40 hover:text-white ml-1">
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>

      {/* Quick action strip */}
      {!isInactive && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          {quickActions.map(({ icon: Icon, label }) => {
            const actionMap = {
              "New Order": "new-order",
              "New Quote": "new-quote",
              "New Invoice": "new-invoice",
              "Upload Doc": "upload-doc",
              "Credit App": "credit-app"
            };
            return (
              <button key={label}
                onClick={() => onAction?.(actionMap[label])}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-heading uppercase tracking-wider text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-sm transition-colors bg-white/0 hover:bg-white/5">
                <Icon className="w-3 h-3" /> {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-sm shadow-2xl max-w-md w-full">
            <div className="bg-red-950/80 px-6 py-4 flex items-center gap-3 rounded-t-sm">
              <XCircle className="w-5 h-5 text-red-400" />
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Deactivate Customer</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/70">This will deactivate the customer account and archive all associated records.</p>
              <div>
                <label className="block text-xs font-heading uppercase tracking-wider text-foreground/50 mb-2">Deactivation Reason *</label>
                <select value={deactivateReason} onChange={(e) => setDeactivateReason(e.target.value)}
                  className="w-full h-9 px-3 border border-input rounded-sm text-sm bg-[hsl(0,0%,10%)] text-foreground">
                  <option value="">Select a reason...</option>
                  <option value="No longer in business">No longer in business</option>
                  <option value="Bankruptcy">Bankruptcy</option>
                  <option value="Payment default">Payment default</option>
                  <option value="Fraud/dispute">Fraud/dispute</option>
                  <option value="Duplicate account">Duplicate account</option>
                  <option value="Customer request">Customer request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-heading uppercase tracking-wider text-foreground/50 mb-2">Additional Notes</label>
                <textarea value={deactivateNotes} onChange={(e) => setDeactivateNotes(e.target.value)}
                  placeholder="Optional record keeping notes..."
                  className="w-full h-20 px-3 py-2 border border-input rounded-sm text-sm resize-none bg-[hsl(0,0%,10%)] text-foreground" />
              </div>
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-sm px-3 py-2">
                Deactivation will be logged with timestamp and stored in customer notes for record keeping.
              </p>
            </div>
            <div className="px-6 py-4 bg-foreground/5 border-t border-border flex gap-2 justify-end rounded-b-sm">
              <Button variant="outline" onClick={() => setShowDeactivateModal(false)} size="sm">Cancel</Button>
              <Button onClick={handleDeactivate} disabled={deactivating || !deactivateReason} size="sm"
                className="bg-red-600 hover:bg-red-700 text-white">
                {deactivating ? "Deactivating..." : "Deactivate"}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
      );
      }