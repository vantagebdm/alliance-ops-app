import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Edit3, Truck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/ui/StatusBadge";
import moment from "moment";

const STATUSES = ["pending","confirmed","processing","ready","dispatched","delivered","cancelled"];

export default function SalesOrderDetail({ order, onClose, onUpdated, onEdit, onCreateInvoice }) {
  const [status, setStatus] = useState(order.status);

  const handleStatusChange = async (val) => {
    setStatus(val);
    await base44.entities.SalesOrder.update(order.id, { status: val });
    onUpdated && onUpdated();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl mx-4">
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-start justify-between rounded-t-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-primary font-bold text-lg">{order.order_number}</span>
              <StatusBadge status={order.priority} />
              <StatusBadge status={status} />
            </div>
            <p className="font-heading text-white/50 text-xs uppercase tracking-wider">
              {order.customer_name}{order.company ? ` · ${order.company}` : ""} · {moment(order.created_date).format("DD MMM YYYY")}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white mt-1"><X className="w-5 h-5" /></button>
        </div>

        {order.priority === "breakdown" && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-2 flex items-center gap-2">
            <span className="font-heading text-red-400 text-xs uppercase tracking-wider font-semibold">
              ⚡ Breakdown Order — Priority Dispatch Required
            </span>
          </div>
        )}

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Customer</div>
              <div className="font-semibold">{order.customer_name}</div>
              {order.company && <div className="text-muted-foreground">{order.company}</div>}
            </div>
            <div>
              <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Delivery</div>
              <div className="font-semibold capitalize">{(order.delivery_method || "").replace(/_/g, " ")}</div>
              {order.delivery_address && <div className="text-muted-foreground text-xs mt-0.5">{order.delivery_address}</div>}
            </div>
            <div>
              <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Created</div>
              <div>{moment(order.created_date).format("DD MMM YYYY")}</div>
            </div>
            <div>
              <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 mb-1">Status</div>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="rounded-sm h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border border-border rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2.5">
              <span className="font-heading text-xs font-semibold text-white uppercase tracking-wider">Line Items</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[hsl(0,0%,96%)] border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Part #</th>
                  <th className="text-left px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Description</th>
                  <th className="text-right px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Qty</th>
                  <th className="text-right px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Unit</th>
                  <th className="text-right px-4 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((line, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{line.part_number || "—"}</td>
                    <td className="px-4 py-3">{line.description}</td>
                    <td className="px-4 py-3 text-right">{line.quantity}</td>
                    <td className="px-4 py-3 text-right">${(line.unit_price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold">${(line.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 flex justify-end border-t border-border bg-muted/30">
              <div className="w-56 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-heading text-[10px] uppercase tracking-wider">Subtotal</span>
                  <span>${(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-heading text-[10px] uppercase tracking-wider">GST</span>
                  <span>${(order.gst || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                  <span className="font-heading uppercase tracking-wider">Total</span>
                  <span className="text-primary">${(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-muted/50 rounded-sm p-3 text-sm text-foreground/70 border-l-2 border-primary/40">
              {order.notes}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Close</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit} className="rounded-sm font-heading text-xs uppercase tracking-wider">
              <Edit3 className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              onClick={() => onCreateInvoice?.(order)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
              <FileText className="w-4 h-4 mr-1" /> Create Invoice
            </Button>
            <Button className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <Truck className="w-4 h-4 mr-1" /> Dispatch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}