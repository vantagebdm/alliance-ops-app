import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, AlertTriangle, User, Package, Truck, CheckCircle, ArrowRight, Edit3, FileText, ShoppingCart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/ui/StatusBadge";
import EmailThreadView from "./EmailThreadView";
import moment from "moment";

const URGENCY_COLORS = {
  breakdown: "bg-red-500/10 border-red-500/40 text-red-400",
  urgent: "bg-amber-500/10 border-amber-500/40 text-amber-400",
  standard: "bg-gray-500/10 border-gray-500/40 text-gray-400",
};

const STATUSES = ["unread","under_review","waiting_on_customer","pricing_in_progress","sourcing_in_progress","quoted","converted","closed"];

export default function EnquiryDetail({ enquiry, onClose, onUpdated }) {
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.internal_notes || "");
  const [saving, setSaving] = useState(false);
  const [showEmail, setShowEmail] = useState(!!enquiry.email_body);

  const handleStatusChange = async (val) => {
    setStatus(val);
    await base44.entities.Enquiry.update(enquiry.id, { status: val });
    onUpdated && onUpdated();
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await base44.entities.Enquiry.update(enquiry.id, { internal_notes: notes, status });
    setSaving(false);
    onUpdated && onUpdated();
  };

  const urgencyColor = URGENCY_COLORS[enquiry.urgency] || URGENCY_COLORS.standard;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl mx-4">

        {/* Header */}
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-start justify-between rounded-t-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-primary font-bold text-lg">{enquiry.enquiry_number || "ENQ"}</span>
              <StatusBadge status={enquiry.urgency} />
              <StatusBadge status={status} />
            </div>
            <p className="font-heading text-white/50 text-xs uppercase tracking-wider">
              {moment(enquiry.created_date).format("ddd DD MMM YYYY [at] HH:mm")}
              {enquiry.source && <> · via {enquiry.source.replace("_", " ")}</>}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Urgency banner for breakdown */}
        {enquiry.urgency === "breakdown" && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-heading text-red-400 text-xs uppercase tracking-wider font-semibold">
              Breakdown — Machine Down — Priority Response Required
            </span>
          </div>
        )}

        {/* Email Thread (if from Gmail) */}
        {enquiry.email_body && (
          <div className="border-b border-border px-6 pt-4 pb-4">
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 font-heading text-xs uppercase tracking-wider font-semibold"
            >
              <Mail className="w-4 h-4" />
              {showEmail ? "Hide" : "Show"} Email Thread
            </button>
            {showEmail && <div className="mt-4"><EmailThreadView enquiry={enquiry} /></div>}
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Customer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">Customer</span>
            </div>
            <div>
              <div className="font-heading text-base font-bold text-foreground">{enquiry.customer_name}</div>
              {enquiry.company && <div className="text-sm text-muted-foreground">{enquiry.company}</div>}
              {enquiry.customer_phone && <div className="text-sm text-foreground mt-1">{enquiry.customer_phone}</div>}
              {enquiry.customer_email && <div className="text-sm text-muted-foreground">{enquiry.customer_email}</div>}
            </div>
          </div>

          {/* Part Required */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">Part Required</span>
            </div>
            <div>
              <div className="font-body text-sm text-foreground">{enquiry.part_description}</div>
              <div className="mt-2 space-y-1">
                {enquiry.part_number && (
                  <div className="text-xs"><span className="text-muted-foreground">Part #:</span> <span className="font-mono font-semibold text-primary">{enquiry.part_number}</span></div>
                )}
                {enquiry.oem_number && (
                  <div className="text-xs"><span className="text-muted-foreground">OEM #:</span> <span className="font-mono">{enquiry.oem_number}</span></div>
                )}
                <div className="text-xs"><span className="text-muted-foreground">Qty:</span> <span className="font-bold">{enquiry.quantity || 1}</span></div>
              </div>
            </div>
          </div>

          {/* Vehicle / Equipment */}
          {(enquiry.vehicle_make || enquiry.vehicle_model || enquiry.rego || enquiry.serial_number) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-primary" />
                <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">Vehicle / Equipment</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {enquiry.vehicle_make && <div><span className="text-muted-foreground text-xs">Make:</span><div className="font-medium">{enquiry.vehicle_make}</div></div>}
                {enquiry.vehicle_model && <div><span className="text-muted-foreground text-xs">Model:</span><div className="font-medium">{enquiry.vehicle_model}</div></div>}
                {enquiry.vehicle_year && <div><span className="text-muted-foreground text-xs">Year:</span><div className="font-medium">{enquiry.vehicle_year}</div></div>}
                {enquiry.rego && <div><span className="text-muted-foreground text-xs">Rego:</span><div className="font-mono font-bold">{enquiry.rego}</div></div>}
                {enquiry.serial_number && <div className="col-span-2"><span className="text-muted-foreground text-xs">Serial #:</span><div className="font-mono">{enquiry.serial_number}</div></div>}
                {enquiry.fleet_number && <div><span className="text-muted-foreground text-xs">Fleet #:</span><div className="font-mono">{enquiry.fleet_number}</div></div>}
              </div>
            </div>
          )}

          {/* Notes from customer */}
          {(enquiry.notes || enquiry.part_description) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">Description</span>
              </div>
              <div className="bg-muted/50 rounded-sm p-3 text-sm text-foreground/80 border-l-2 border-primary/40">
                {enquiry.notes || enquiry.part_description}
              </div>
            </div>
          )}
        </div>

        {/* Triage Section */}
        <div className="border-t border-border mx-6" />
        <div className="p-6 space-y-4">
          <h4 className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/50">Triage & Action</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1.5 block">Status</label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1.5 block">Assigned To</label>
              <div className="h-9 border border-input bg-transparent rounded-sm px-3 flex items-center text-sm text-muted-foreground">
                {enquiry.assigned_to || "Unassigned"}
              </div>
            </div>
          </div>

          <div>
            <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1.5 block">Internal Notes</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add internal notes, supplier options, pricing..."
              className="rounded-sm"
              rows={4}
            />
           {enquiry.email_body && (
              <p className="text-[10px] text-muted-foreground italic">Email from {enquiry.email_sender_address}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3 rounded-b-sm">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveNotes}
              disabled={saving}
              variant="outline"
              className="rounded-sm font-heading text-xs uppercase tracking-wider"
            >
              {saving ? "Saving..." : "Save Notes"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-sm font-heading text-xs uppercase tracking-wider"
            >
              Close
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold uppercase text-xs tracking-wider rounded-sm"
            >
              <FileText className="w-4 h-4 mr-1" />
              Convert to Quote
            </Button>
            <Button
              className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Create Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}