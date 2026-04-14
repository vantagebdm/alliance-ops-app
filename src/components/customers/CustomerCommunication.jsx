import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Send, ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/ui/StatusBadge";
import moment from "moment";

export default function CustomerCommunication({ customer }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    loadEnquiries();
  }, [customer]);

  const loadEnquiries = async () => {
    setLoading(true);
    // Find enquiries linked to this customer by email or name
    const all = await base44.entities.Enquiry.list("-created_date", 200);
    const linked = all.filter(e =>
      (customer.email && (e.customer_email === customer.email || e.email_sender_address === customer.email)) ||
      (e.customer_name === customer.name)
    );
    setEnquiries(linked);
    setLoading(false);
  };

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-4">
      {/* Compose Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {enquiries.length} communication thread{enquiries.length !== 1 ? "s" : ""} found
        </p>
        <Button size="sm" onClick={() => setComposing(true)}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Plus className="w-3 h-3 mr-1" /> New Email
        </Button>
      </div>

      {/* Compose Form */}
      {composing && (
        <ComposeEmail
          to={customer.email}
          customerName={customer.name}
          onClose={() => setComposing(false)}
        />
      )}

      {/* Thread List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No email communications found for this customer.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enquiries.map(enq => (
            <div key={enq.id} className="border border-border rounded-sm overflow-hidden">
              {/* Thread Header */}
              <button
                onClick={() => toggle(enq.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left">
                <Mail className={`w-4 h-4 shrink-0 ${enq.email_body ? "text-blue-400" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-primary font-bold">{enq.enquiry_number || "—"}</span>
                    <span className="text-sm font-medium truncate">{enq.email_subject || enq.part_description || "No subject"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{moment(enq.created_date).format("DD/MM/YY HH:mm")}</span>
                    <StatusBadge status={enq.status} />
                    {enq.is_unread && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-sm font-semibold">UNREAD</span>}
                  </div>
                </div>
                {expanded[enq.id] ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Expanded Email Body */}
              {expanded[enq.id] && (
                <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/10 space-y-3">
                  {enq.email_sender_address && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">From:</span> {enq.email_sender_name || enq.email_sender_address} &lt;{enq.email_sender_address}&gt;
                    </p>
                  )}
                  {enq.email_body ? (
                    <div className="text-sm whitespace-pre-wrap bg-card border border-border rounded-sm p-3 max-h-48 overflow-y-auto">
                      {enq.email_body}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      {enq.part_description || "No message body"}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {enq.vehicle_make && <span><b>Vehicle:</b> {[enq.vehicle_make, enq.vehicle_model, enq.vehicle_year].filter(Boolean).join(" ")}</span>}
                    {enq.part_number && <span><b>Part #:</b> {enq.part_number}</span>}
                  </div>
                  {/* Quick Reply */}
                  {customer.email && (
                    <div className="pt-1">
                      <Button size="sm" variant="outline" onClick={() => setComposing(true)}
                        className="rounded-sm font-heading text-xs uppercase tracking-wider">
                        <Send className="w-3 h-3 mr-1" /> Reply
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComposeEmail({ to, customerName, onClose }) {
  const [form, setForm] = useState({ to: to || "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!form.to || !form.subject || !form.body) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: form.to,
      subject: form.subject,
      body: form.body,
      from_name: "Alliance Priority Parts",
    });
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="border border-primary/40 rounded-sm bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-primary">New Email</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>
      <div>
        <label className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">To</label>
        <Input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
          placeholder="customer@example.com" className="rounded-sm text-sm" />
      </div>
      <div>
        <label className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Subject</label>
        <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          placeholder="Subject..." className="rounded-sm text-sm" />
      </div>
      <div>
        <label className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Message</label>
        <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          placeholder="Type your message..." className="rounded-sm text-sm" rows={5} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
        <Button size="sm" onClick={send} disabled={sending || sent || !form.to || !form.subject || !form.body}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          {sent ? "Sent ✓" : sending ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Sending...</> : <><Send className="w-3 h-3 mr-1" /> Send</>}
        </Button>
      </div>
    </div>
  );
}