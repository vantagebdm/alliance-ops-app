import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import moment from "moment";
import { generateAndUploadInvoicePDF } from "@/lib/invoicePdf";

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"];
const PAYMENT_METHODS = ["bank_transfer", "credit_card", "cash", "cheque"];

export default function InvoiceEditForm({ invoice, onClose, onSaved }) {
  const [data, setData] = useState(invoice);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Invoice.update(invoice.id, data);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-sm border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between sticky top-0 bg-[hsl(0,0%,10%)] border-b border-border px-6 py-4">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider">Edit Invoice {data.invoice_number}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Invoice Number
              </label>
              <Input
                value={data.invoice_number || ""}
                readOnly
                disabled
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Locked — number cannot be changed after creation</p>
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Status
              </label>
              <Select value={data.status || "draft"} onValueChange={(v) => setData({ ...data, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Customer Name
              </label>
              <Input
                value={data.customer_name || ""}
                onChange={(e) => setData({ ...data, customer_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Company
              </label>
              <Input
                value={data.company || ""}
                onChange={(e) => setData({ ...data, company: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Due Date
              </label>
              <Input
                type="date"
                value={data.due_date ? moment(data.due_date).format("YYYY-MM-DD") : ""}
                onChange={(e) => setData({ ...data, due_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Paid Date
              </label>
              <Input
                type="date"
                value={data.paid_date ? moment(data.paid_date).format("YYYY-MM-DD") : ""}
                onChange={(e) => setData({ ...data, paid_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Subtotal
              </label>
              <Input
                type="number"
                step="0.01"
                value={data.subtotal || 0}
                onChange={(e) => setData({ ...data, subtotal: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                GST
              </label>
              <Input
                type="number"
                step="0.01"
                value={data.gst || 0}
                onChange={(e) => setData({ ...data, gst: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Total
              </label>
              <Input
                type="number"
                step="0.01"
                value={data.total || 0}
                onChange={(e) => setData({ ...data, total: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
                Payment Method
              </label>
              <Select value={data.payment_method || "bank_transfer"} onValueChange={(v) => setData({ ...data, payment_method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.replace("_", " ").charAt(0).toUpperCase() + m.replace("_", " ").slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
              Notes
            </label>
            <Textarea
              value={data.notes || ""}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              className="h-24"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-[hsl(0,0%,10%)] border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-black">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}