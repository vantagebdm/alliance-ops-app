import React, { useState } from "react";
import {
  Trash2, RotateCcw, ChevronDown, FileDown,
  UserCheck, Handshake, ScrollText, Package, Send,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { DISTRIBUTION_SUPPLIERS } from "@/lib/distributionData";
import { jsPDF } from "jspdf";

const fmt = (n) => `$${Number(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fieldCls = "h-8 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const lblCls = "block text-[10px] font-heading uppercase tracking-wider text-white/40 mb-1";

const PROPOSAL_TYPES = [
  { id: "retail", label: "Retail" },
  { id: "trade_business", label: "Trade Business" },
  { id: "commercial", label: "Commercial" },
];
const TRADING_TERMS = [
  { id: "cod", label: "COD" },
  { id: "14_days", label: "14 Days" },
  { id: "30_days", label: "30 Days" },
  { id: "30_days_plus", label: "30 Days Plus" },
];
const TC_PRESETS = [
  "50% deposit on order, balance COD on delivery",
  "Full COD required prior to dispatch",
  "Net 30 EOM from invoice date",
  "50% COD, balance 14 days from delivery",
];

export const STANDARD_TERMS = {
  retail: {
    label: "Retail Terms",
    text: "Payment is required in full before goods are released, collected or dispatched.\n\nQuoted prices remain valid for the stated quotation period and are subject to stock availability.\n\nSpecial-order, indent, custom, dangerous-goods and non-stock items may require full payment in advance and are non-cancellable and non-returnable once ordered.\n\nFreight, hot-shot delivery, handling and dangerous-goods charges are additional unless expressly included in writing.",
  },
  trade: {
    label: "Business / Trade Terms",
    text: "Trade pricing is conditional on the customer maintaining an active approved business account and meeting applicable purchasing and payment requirements.\n\nApproved credit accounts are payable within 7 or 14 days from the invoice date, as specified in the account approval.\n\nAlliance Priority Parts may suspend credit facilities, trade pricing, stock reservations or further supply where an account is overdue, exceeds its credit limit or breaches the trading terms.\n\nTrade pricing does not include dedicated or guaranteed stock allocation unless confirmed in writing.",
  },
  commercial: {
    label: "Commercial Terms",
    text: "Commercial pricing is customer-specific and conditional on forecast purchasing volumes, agreed product mix, payment performance, contract term and stockholding requirements.\n\nCommercial pricing is confidential and may not be disclosed, transferred or applied to purchases by related or third-party entities unless approved in writing.\n\nAssigned inventory remains subject to the agreed minimum and maximum stock schedule, forecast demand and replenishment arrangements.\n\nWhere customer-specific stock becomes obsolete, expires, is discontinued or remains unused because the customer's requirements change, the customer may be required to purchase that stock in accordance with the supply agreement.\n\nAlliance Priority Parts may review pricing where supplier costs, exchange rates, freight, fuel, duties, regulatory costs or other material input costs change.",
  },
};

function Section({ idx, open, setOpen, icon: Icon, title, badge, children }) {
  const isOpen = open === idx;
  return (
    <div className="border-b border-[hsl(0,0%,14%)]">
      <button
        onClick={() => setOpen(isOpen ? -1 : idx)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white/5"
      >
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-heading text-xs uppercase tracking-wider text-white/80">{title}</span>
        {badge != null && badge !== "" && <span className="text-[10px] text-primary/70 truncate max-w-[120px]">· {badge}</span>}
        <ChevronDown className={`w-4 h-4 ml-auto text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={active
        ? "px-2.5 py-1 rounded-md text-xs bg-primary text-primary-foreground"
        : "px-2.5 py-1 rounded-md text-xs border border-input text-white/60 hover:text-white"}
    >
      {children}
    </button>
  );
}

export default function ProposalGenerator({ supplierId, items, setItems }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(0);
  const [saving, setSaving] = useState(false);
  const supplier = DISTRIBUTION_SUPPLIERS.find((s) => s.id === supplierId);

  const [qualify, setQualify] = useState({ current_customer: "no", client_name: "", client_company: "", client_number: "", client_email: "" });
  const [trade, setTrade] = useState({ proposal_type: "", trading_terms: "" });
  const [terms, setTerms] = useState({ deposit_required: false, deposit_pct: 50, balance_terms: "", validity_days: 30, conditions_text: "", standard_terms: [] });
  const [meta, setMeta] = useState({ title: "", notes: "" });

  const updateItem = (idx, patch) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  const reset = () => {
    setItems([]);
    setQualify({ current_customer: "no", client_name: "", client_company: "", client_number: "", client_email: "" });
    setTrade({ proposal_type: "", trading_terms: "" });
    setTerms({ deposit_required: false, deposit_pct: 50, balance_terms: "", validity_days: 30, conditions_text: "", standard_terms: [] });
    setMeta({ title: "", notes: "" });
    setOpen(0);
  };

  const buildPayload = (proposal_number) => ({
    proposal_number,
    supplier: supplierId,
    title: meta.title?.trim() || `${supplier?.name} Proposal`,
    customer_name: qualify.client_name.trim(),
    customer_company: qualify.client_company.trim(),
    customer_email: qualify.client_email.trim(),
    current_customer: qualify.current_customer,
    client_number: qualify.client_number.trim(),
    proposal_type: trade.proposal_type,
    trading_terms: trade.trading_terms,
    deposit_required: terms.deposit_required,
    deposit_pct: Number(terms.deposit_pct) || 0,
    balance_terms: terms.balance_terms.trim(),
    validity_days: Number(terms.validity_days) || 30,
    conditions_text: terms.conditions_text.trim(),
    standard_terms: terms.standard_terms,
    items: items.map((it) => ({
      supplier_sku: it.supplier_sku,
      description: it.description,
      pack_size: it.pack_size,
      quantity: Number(it.quantity) || 0,
      unit_price: Number(it.unit_price) || 0,
      total: (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    })),
    subtotal, gst, total,
    status: "draft",
    notes: meta.notes?.trim(),
  });

  const generatePDF = (proposal_number, payload) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 14;

    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("PROPOSAL", 14, y);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(proposal_number, W - 14, y, { align: "right" });
    y += 6;
    doc.text(supplier?.name || "", 14, y);
    doc.text(new Date().toLocaleDateString("en-AU"), W - 14, y, { align: "right" });
    y += 4;
    doc.text(payload.title || "", 14, y);
    y += 4;
    doc.setDrawColor(200); doc.line(14, y, W - 14, y); y += 6;

    const kv = (label, val) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text(label, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize(String(val || "—"), 130), 50, y);
      y += 5;
    };

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Client Details", 14, y); y += 5;
    kv("Name", payload.customer_name);
    kv("Company", payload.customer_company);
    kv("Client No.", payload.client_number);
    kv("Email", payload.customer_email);
    kv("Existing Customer", payload.current_customer === "yes" ? "Yes" : "No");
    y += 3;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Trade Details", 14, y); y += 5;
    kv("Proposal Type", PROPOSAL_TYPES.find((t) => t.id === payload.proposal_type)?.label);
    kv("Trading Terms", TRADING_TERMS.find((t) => t.id === payload.trading_terms)?.label);
    y += 3;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Items", 14, y); y += 5;
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("Description", 14, y);
    doc.text("Qty", 130, y, { align: "right" });
    doc.text("Unit $", 155, y, { align: "right" });
    doc.text("Total", W - 14, y, { align: "right" });
    y += 3;
    doc.setDrawColor(220); doc.line(14, y, W - 14, y); y += 4;
    doc.setFont("helvetica", "normal");
    payload.items.forEach((it) => {
      if (y > 272) { doc.addPage(); y = 14; }
      doc.text(doc.splitTextToSize(`${it.description} (${it.supplier_sku})`, 110), 14, y);
      doc.text(String(it.quantity), 130, y, { align: "right" });
      doc.text(fmt(it.unit_price), 155, y, { align: "right" });
      doc.text(fmt(it.total), W - 14, y, { align: "right" });
      y += 6;
    });
    y += 1;
    doc.setDrawColor(220); doc.line(14, y, W - 14, y); y += 5;
    const tot = (label, val, bold) => {
      doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(9);
      doc.text(label, W - 60, y);
      doc.text(fmt(val), W - 14, y, { align: "right" });
      y += 5;
    };
    tot("Subtotal", payload.subtotal);
    tot("GST (10%)", payload.gst);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("TOTAL", W - 60, y);
    doc.text(fmt(payload.total), W - 14, y, { align: "right" });
    y += 7;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");

    if (y > 250) { doc.addPage(); y = 14; }
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Terms & Conditions", 14, y); y += 5;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    const tcLines = [];
    if (terms.deposit_required) tcLines.push(`${terms.deposit_pct}% deposit required on order.`);
    if (terms.balance_terms) tcLines.push(`Balance: ${terms.balance_terms}.`);
    tcLines.push(`Valid for ${terms.validity_days} days from issue.`);
    if (terms.conditions_text) tcLines.push(terms.conditions_text);
    tcLines.forEach((l) => { doc.text(doc.splitTextToSize("•  " + l, 180), 14, y); y += 5; });

    terms.standard_terms.forEach((key) => {
      const set = STANDARD_TERMS[key];
      if (!set) return;
      if (y > 245) { doc.addPage(); y = 14; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text(set.label, 14, y); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      set.text.split("\n\n").forEach((para) => {
        if (y > 275) { doc.addPage(); y = 14; }
        doc.text(doc.splitTextToSize(para, 180), 14, y);
        y += 5;
      });
      y += 3;
    });

    // NOTE: branded PDF template integration pending — this clean PDF will be slotted into the saved template.
    doc.save(`${proposal_number}.pdf`);
  };

  const handleGenerate = async () => {
    if (!qualify.client_name?.trim()) {
      toast({ title: "Client name required", description: "Complete the Qualify tab first", variant: "destructive" });
      setOpen(0);
      return;
    }
    if (!items.length) {
      toast({ title: "Add at least one product", description: "Use the Items tab", variant: "destructive" });
      setOpen(3);
      return;
    }
    setSaving(true);
    try {
      const existing = await base44.entities.DistributionProposal.list("-created_date", 1000);
      const seq = (existing?.length || 0) + 1;
      const proposal_number = `DP-${String(seq).padStart(4, "0")}`;
      const payload = buildPayload(proposal_number);
      await base44.entities.DistributionProposal.create(payload);
      generatePDF(proposal_number, payload);
      toast({ title: "Proposal generated", description: `${proposal_number} · PDF downloaded` });
      reset();
    } catch (e) {
      toast({ title: "Failed to generate proposal", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,14%)] rounded-md flex flex-col max-h-[calc(100vh-180px)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(0,0%,14%)]">
        <Send className="w-4 h-4 text-primary" />
        <h2 className="font-heading text-sm uppercase tracking-wider text-white/80">Proposal Generator</h2>
        <span className="ml-auto text-[10px] text-white/40">{supplier?.name}</span>
      </div>

      <div className="overflow-auto flex-1">
        {/* TAB 1 — QUALIFY */}
        <Section idx={0} open={open} setOpen={setOpen} icon={UserCheck} title="1 · Qualify" badge={qualify.client_name || ""}>
          <div className="space-y-3 pt-2">
            <div>
              <span className={lblCls}>Current Customer?</span>
              <div className="flex gap-2">
                <Chip active={qualify.current_customer === "yes"} onClick={() => setQualify({ ...qualify, current_customer: "yes" })}>Yes</Chip>
                <Chip active={qualify.current_customer === "no"} onClick={() => setQualify({ ...qualify, current_customer: "no" })}>No</Chip>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={lblCls}>Client Name *</span>
                <input value={qualify.client_name} onChange={(e) => setQualify({ ...qualify, client_name: e.target.value })} className={fieldCls} placeholder="John Smith" />
              </div>
              <div>
                <span className={lblCls}>Client Company</span>
                <input value={qualify.client_company} onChange={(e) => setQualify({ ...qualify, client_company: e.target.value })} className={fieldCls} placeholder="Pty Ltd" />
              </div>
              <div>
                <span className={lblCls}>Client Number</span>
                <input value={qualify.client_number} onChange={(e) => setQualify({ ...qualify, client_number: e.target.value })} className={fieldCls} placeholder="ACC-0001" />
              </div>
              <div>
                <span className={lblCls}>Client Email</span>
                <input value={qualify.client_email} onChange={(e) => setQualify({ ...qualify, client_email: e.target.value })} className={fieldCls} placeholder="name@email.com" />
              </div>
            </div>
          </div>
        </Section>

        {/* TAB 2 — TRADE DETAILS */}
        <Section idx={1} open={open} setOpen={setOpen} icon={Handshake} title="2 · Trade Details" badge={[PROPOSAL_TYPES.find(t=>t.id===trade.proposal_type)?.label, TRADING_TERMS.find(t=>t.id===trade.trading_terms)?.label].filter(Boolean).join(" · ")}>
          <div className="space-y-3 pt-2">
            <div>
              <span className={lblCls}>Proposal Type</span>
              <div className="flex flex-wrap gap-2">
                {PROPOSAL_TYPES.map((t) => (
                  <Chip key={t.id} active={trade.proposal_type === t.id} onClick={() => setTrade({ ...trade, proposal_type: t.id })}>{t.label}</Chip>
                ))}
              </div>
            </div>
            <div>
              <span className={lblCls}>Trading Terms</span>
              <div className="flex flex-wrap gap-2">
                {TRADING_TERMS.map((t) => (
                  <Chip key={t.id} active={trade.trading_terms === t.id} onClick={() => setTrade({ ...trade, trading_terms: t.id })}>{t.label}</Chip>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* TAB 3 — TERMS & CONDITIONS */}
        <Section idx={2} open={open} setOpen={setOpen} icon={ScrollText} title="3 · Terms & Conditions" badge={terms.deposit_required ? `${terms.deposit_pct}% dep` : ""}>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                <input type="checkbox" checked={terms.deposit_required} onChange={(e) => setTerms({ ...terms, deposit_required: e.target.checked })} className="accent-primary" />
                Deposit required
              </label>
              {terms.deposit_required && (
                <div className="flex items-center gap-1">
                  <input type="number" min="0" max="100" value={terms.deposit_pct} onChange={(e) => setTerms({ ...terms, deposit_pct: e.target.value })} className="h-8 w-16 rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 text-sm text-foreground text-right focus:outline-none focus:ring-1 focus:ring-ring" />
                  <span className="text-xs text-white/50">% on order</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={lblCls}>Balance Terms</span>
                <input value={terms.balance_terms} onChange={(e) => setTerms({ ...terms, balance_terms: e.target.value })} className={fieldCls} placeholder="COD on delivery" />
              </div>
              <div>
                <span className={lblCls}>Valid For (days)</span>
                <input type="number" min="1" value={terms.validity_days} onChange={(e) => setTerms({ ...terms, validity_days: e.target.value })} className={fieldCls} />
              </div>
            </div>
            <div>
              <span className={lblCls}>Conditions</span>
              <textarea value={terms.conditions_text} onChange={(e) => setTerms({ ...terms, conditions_text: e.target.value })} rows={3} className="w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Additional conditions..." />
            </div>
            <div>
              <span className={lblCls}>Quick Set</span>
              <div className="flex flex-wrap gap-1.5">
                {TC_PRESETS.map((p) => (
                  <button key={p} onClick={() => setTerms({ ...terms, conditions_text: p })} className="px-2 py-1 rounded-md text-[10px] border border-input text-white/50 hover:text-white hover:border-primary/40">
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className={lblCls}>Standard Terms</span>
              <div className="space-y-2">
                {Object.keys(STANDARD_TERMS).map((key) => {
                  const set = STANDARD_TERMS[key];
                  const active = terms.standard_terms.includes(key);
                  return (
                    <div key={key} className={`rounded-md border ${active ? "border-primary/40 bg-primary/5" : "border-[hsl(0,0%,14%)]"}`}>
                      <button
                        onClick={() => setTerms({ ...terms, standard_terms: active ? terms.standard_terms.filter((k) => k !== key) : [...terms.standard_terms, key] })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left"
                      >
                        <input type="checkbox" checked={active} readOnly className="accent-primary pointer-events-none" />
                        <span className="text-xs font-heading uppercase tracking-wider text-white/80">{set.label}</span>
                        {active && <span className="ml-auto text-[9px] text-primary/70">included in PDF</span>}
                      </button>
                      {active && (
                        <div className="px-3 pb-3 text-[10px] text-white/50 whitespace-pre-line max-h-40 overflow-auto leading-relaxed border-t border-[hsl(0,0%,14%)] pt-2">
                          {set.text}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* TAB 4 — ITEMS */}
        <Section idx={3} open={open} setOpen={setOpen} icon={Package} title="4 · Items" badge={`${items.length} line${items.length === 1 ? "" : "s"}`}>
          <div className="space-y-3 pt-2">
            <input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} className={fieldCls} placeholder="Proposal title (optional)" />

            {items.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-sm">
                No products added yet. Click <span className="text-primary">Add</span> on a product in the catalog.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-1 py-2 font-heading text-[9px] uppercase tracking-wider text-white/40">Item</th>
                    <th className="px-1 py-2 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-14">Qty</th>
                    <th className="px-1 py-2 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-20">Unit $</th>
                    <th className="px-1 py-2 text-right font-heading text-[9px] uppercase tracking-wider text-white/40 w-20">Total</th>
                    <th className="w-7"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-t border-[hsl(0,0%,14%)] align-top">
                      <td className="px-1 py-2">
                        <div className="text-white/90 text-xs">{it.description}</div>
                        <div className="text-white/40 text-[10px] font-mono">{it.supplier_sku} · {it.pack_size}</div>
                        {it.per_unit_cost != null && (
                          <div className="text-primary/70 text-[10px]">Cost: {fmt(it.per_unit_cost)} {it.unit_label} · Pack: {fmt(it.pack_cost)}</div>
                        )}
                        {it.per_unit_cost != null && it.pack_cost != null && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <button onClick={() => updateItem(idx, { pricing_basis: "per_unit", quantity: it.unit_count, unit_price: +(it.per_unit_cost * 1.65).toFixed(2) })} className={it.pricing_basis === "per_unit" ? "px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground" : "px-1.5 py-0.5 rounded text-[9px] border border-input text-white/50 hover:text-white"}>Per Unit {it.unit_label} +65%</button>
                            <button onClick={() => updateItem(idx, { pricing_basis: "quote_total", quantity: 1, unit_price: +(it.pack_cost * 1.30).toFixed(2) })} className={it.pricing_basis === "quote_total" ? "px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground" : "px-1.5 py-0.5 rounded text-[9px] border border-input text-white/50 hover:text-white"}>Quote Total +30%</button>
                            <button onClick={() => updateItem(idx, { pricing_basis: "commercial", quantity: 1, unit_price: +(it.pack_cost * 1.20).toFixed(2) })} className={it.pricing_basis === "commercial" ? "px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground" : "px-1.5 py-0.5 rounded text-[9px] border border-input text-white/50 hover:text-white"}>Commercial +20%</button>
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-2 text-right"><input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(idx, { quantity: e.target.value })} className="h-7 w-12 text-right rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></td>
                      <td className="px-1 py-2 text-right"><input type="number" step="0.01" value={it.unit_price} onChange={(e) => updateItem(idx, { unit_price: e.target.value })} className="h-7 w-16 text-right rounded border border-input bg-[hsl(0,0%,10%)] px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></td>
                      <td className="px-1 py-2 text-right text-white/90 text-xs">{fmt((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</td>
                      <td className="px-1 py-2 text-right"><button onClick={() => removeItem(idx)} className="text-white/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <textarea value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} rows={2} className="w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Notes (optional)" />

            <div className="space-y-1.5 text-sm pt-1">
              <div className="flex justify-between text-white/50"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-white/50"><span>GST (10%)</span><span>{fmt(gst)}</span></div>
              <div className="flex justify-between text-white font-heading text-base pt-1 border-t border-[hsl(0,0%,14%)] mt-1"><span className="uppercase tracking-wider">Total</span><span>{fmt(total)}</span></div>
            </div>
          </div>
        </Section>

        {/* TAB 5 — GENERATE */}
        <Section idx={4} open={open} setOpen={setOpen} icon={FileDown} title="5 · Generate Proposal">
          <div className="space-y-3 pt-2 text-sm">
            <div className="rounded-md border border-[hsl(0,0%,14%)] bg-[hsl(0,0%,10%)] p-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-white/40">Client</span><span className="text-white/80">{qualify.client_name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Company</span><span className="text-white/80">{qualify.client_company || "—"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Existing</span><span className="text-white/80">{qualify.current_customer === "yes" ? "Yes" : "No"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Type</span><span className="text-white/80">{PROPOSAL_TYPES.find(t => t.id === trade.proposal_type)?.label || "—"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Terms</span><span className="text-white/80">{TRADING_TERMS.find(t => t.id === trade.trading_terms)?.label || "—"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Lines</span><span className="text-white/80">{items.length}</span></div>
              <div className="flex justify-between pt-1 border-t border-[hsl(0,0%,14%)]"><span className="text-white/40">Total (inc GST)</span><span className="text-primary font-heading">{fmt(total)}</span></div>
            </div>
            <p className="text-[11px] text-white/40">Generates the proposal record and downloads a PDF. The branded template will be slotted in once you save it.</p>
            <div className="flex gap-2">
              <button onClick={handleGenerate} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                <FileDown className="w-4 h-4" /> {saving ? "Generating..." : "Generate Proposal"}
              </button>
              <button onClick={reset} disabled={!items.length && !qualify.client_name} className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-input text-white/60 text-sm hover:bg-white/5 disabled:opacity-50">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}