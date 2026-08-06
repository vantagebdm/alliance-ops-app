import React, { useState, useEffect } from "react";
import {
  Trash2, RotateCcw, ChevronDown, FileDown,
  UserCheck, Building2, ScrollText, Package, Send,
  UserPlus, Mail, Phone, ShieldCheck, Eye,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { DISTRIBUTION_SUPPLIERS } from "@/lib/distributionData";
import { STANDARD_TERMS } from "@/lib/proposalTerms";
import { generateProposalPDF } from "@/lib/documentPdf";

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

function Chip({ active, onClick, children, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={disabled
        ? "px-2.5 py-1 rounded-md text-xs border border-input text-white/20 cursor-not-allowed"
        : active
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
  const [customerStatus, setCustomerStatus] = useState(null);
  const supplier = DISTRIBUTION_SUPPLIERS.find((s) => s.id === supplierId);

  const [qualify, setQualify] = useState({ current_customer: "no", client_name: "", client_company: "", client_number: "", client_email: "" });
  const [contact, setContact] = useState({ company_name: "", best_contact: "", phone: "", email: "" });
  const [terms, setTerms] = useState({ proposal_type: "", trading_terms: "", deposit_required: false, deposit_pct: 50, balance_terms: "", validity_days: 30, conditions_text: "", standard_terms: [] });
  const [meta, setMeta] = useState({ title: "", notes: "" });

  const updateItem = (idx, patch) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  const commercialSelectable = qualify.current_customer === "yes" && customerStatus?.active === true;
  const commercialAllowed = terms.proposal_type === "commercial";
  const contactComplete = !!(contact.company_name.trim() && contact.best_contact.trim() && contact.phone.trim() && contact.email.trim());
  const canGenerate = !!(qualify.client_name.trim() && contactComplete && items.length > 0);

  // Verify existing customer when marked current + email provided
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (qualify.current_customer !== "yes" || !qualify.client_email.trim()) { setCustomerStatus(null); return; }
      try {
        const res = await base44.entities.Customer.filter({ email: qualify.client_email.trim() });
        const c = res && res[0];
        if (cancelled) return;
        if (c) {
          const active = c.status === "active" && !["on_hold", "declined"].includes(c.account_status);
          const thirty = /30/.test(c.payment_terms || "");
          setCustomerStatus({ active, thirty });
          setTerms((prev) => ({ ...prev, trading_terms: prev.trading_terms || (thirty ? "30_days" : "14_days") }));
        } else {
          setCustomerStatus({ active: false, thirty: false });
        }
      } catch { setCustomerStatus(null); }
    };
    run();
    return () => { cancelled = true; };
  }, [qualify.current_customer, qualify.client_email]);

  const reset = () => {
    setItems([]);
    setQualify({ current_customer: "no", client_name: "", client_company: "", client_number: "", client_email: "" });
    setContact({ company_name: "", best_contact: "", phone: "", email: "" });
    setTerms({ proposal_type: "", trading_terms: "", deposit_required: false, deposit_pct: 50, balance_terms: "", validity_days: 30, conditions_text: "", standard_terms: [] });
    setMeta({ title: "", notes: "" });
    setCustomerStatus(null);
    setOpen(0);
  };

  const handleAddCustomer = async () => {
    if (!qualify.client_name.trim() || !qualify.client_email.trim()) {
      toast({ title: "Client name & email required", variant: "destructive" });
      return;
    }
    try {
      const c = await base44.entities.Customer.create({
        name: qualify.client_name.trim(),
        company: qualify.client_company.trim(),
        email: qualify.client_email.trim(),
        status: "active",
        account_status: "cash_sale",
        customer_type: "company",
      });
      setQualify((q) => ({ ...q, current_customer: "yes", client_number: String(c.id).slice(-6).toUpperCase() }));
      toast({ title: "Customer added", description: c.name });
    } catch (e) {
      toast({ title: "Failed to add customer", description: e?.message, variant: "destructive" });
    }
  };

  const handleSendTradingApp = async () => {
    if (!qualify.client_name.trim() || !qualify.client_email.trim()) {
      toast({ title: "Client name & email required", variant: "destructive" });
      return;
    }
    try {
      await base44.entities.Customer.create({
        name: qualify.client_name.trim(),
        company: qualify.client_company.trim(),
        email: qualify.client_email.trim(),
        status: "active",
        account_status: "credit_pending",
        customer_type: "company",
      });
      toast({ title: "Trading application sent", description: "Awaiting approval" });
    } catch (e) {
      toast({ title: "Failed to send application", description: e?.message, variant: "destructive" });
    }
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
    trade_company: contact.company_name.trim(),
    best_contact: contact.best_contact.trim(),
    best_contact_phone: contact.phone.trim(),
    best_contact_email: contact.email.trim(),
    proposal_type: terms.proposal_type,
    trading_terms: terms.trading_terms,
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

  const previewSample = () => {
    const sample = {
      proposal_number: "DP-SAMPLE",
      customer_name: "John Smith",
      customer_company: "Smith Pty Ltd",
      trade_company: "Smith Trading Co",
      client_number: "ACC-0001",
      customer_email: "name@email.com",
      current_customer: "yes",
      best_contact: "Jane Doe",
      best_contact_phone: "0412 345 678",
      best_contact_email: "contact@email.com",
      proposal_type: "commercial",
      trading_terms: "30_days",
      deposit_required: true,
      deposit_pct: 50,
      balance_terms: "COD on delivery",
      validity_days: 30,
      conditions_text: "Pricing subject to supplier confirmation at time of order.",
      standard_terms: ["retail", "commercial"],
      items: [
        { description: "Total Quartz 9000 5W-30 5L", quantity: 4, unit_price: 62.40, total: 249.60 },
        { description: "Total Rubia TIR 8900 20L", quantity: 1, unit_price: 312.00, total: 312.00 },
        { description: "Total Ceran XM 450G (box of 14)", quantity: 1, unit_price: 189.20, total: 189.20 },
      ],
      subtotal: 750.80,
      gst: 75.08,
      total: 825.88,
    };
    const doc = generateProposalPDF(sample);
    window.open(doc.output("bloburl"), "_blank");
    toast({ title: "Sample A4 proposal opened", description: "Preview of the generated PDF layout" });
  };

  const handleGenerate = async () => {
    if (!qualify.client_name.trim()) {
      toast({ title: "Client name required", description: "Complete the Qualify tab", variant: "destructive" });
      setOpen(0); return;
    }
    if (!contactComplete) {
      toast({ title: "Contact details required", description: "Company, best contact, phone & email", variant: "destructive" });
      setOpen(1); return;
    }
    if (terms.proposal_type === "commercial" && !commercialSelectable) {
      toast({ title: "Commercial not available", description: "Client must be current & active", variant: "destructive" });
      setOpen(2); return;
    }
    if (!items.length) {
      toast({ title: "Add at least one product", variant: "destructive" });
      setOpen(3); return;
    }
    setSaving(true);
    try {
      const existing = await base44.entities.DistributionProposal.list("-created_date", 1000);
      const seq = (existing?.length || 0) + 1;
      const proposal_number = `DP-${String(seq).padStart(4, "0")}`;
      const payload = buildPayload(proposal_number);
      await base44.entities.DistributionProposal.create(payload);
      const doc = generateProposalPDF(payload);
      window.open(doc.output("bloburl"), "_blank");
      toast({ title: "Proposal generated", description: `${proposal_number} · PDF opened for review` });
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
              <div className="flex flex-wrap items-center gap-2">
                <Chip active={qualify.current_customer === "yes"} onClick={() => setQualify({ ...qualify, current_customer: "yes" })}>Yes</Chip>
                <Chip active={qualify.current_customer === "no"} onClick={() => setQualify({ ...qualify, current_customer: "no" })}>No</Chip>
                {qualify.current_customer === "no" ? (
                  <div className="flex gap-1.5 ml-auto">
                    <button onClick={handleAddCustomer} className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[10px] border border-primary/40 text-primary hover:bg-primary/10">
                      <UserPlus className="w-3 h-3" /> Add Customer
                    </button>
                    <button onClick={handleSendTradingApp} className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[10px] border border-input text-white/60 hover:text-white hover:border-primary/40">
                      <Mail className="w-3 h-3" /> Send Trading App
                    </button>
                  </div>
                ) : (
                  customerStatus && (
                    <span className={`ml-auto inline-flex items-center gap-1 text-[10px] ${customerStatus.active ? "text-primary" : "text-amber-400"}`}>
                      <ShieldCheck className="w-3 h-3" /> {customerStatus.active ? "Active account" : "Not active"}
                    </span>
                  )
                )}
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

        {/* TAB 2 — CONTACT DETAILS */}
        <Section idx={1} open={open} setOpen={setOpen} icon={Building2} title="2 · Contact Details" badge={contactComplete ? "complete" : "required"}>
          <div className="space-y-3 pt-2">
            <p className="text-[10px] text-white/40">Required before a proposal can be generated.</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={lblCls}>Company Name *</span>
                <input value={contact.company_name} onChange={(e) => setContact({ ...contact, company_name: e.target.value })} className={fieldCls} placeholder="Company Pty Ltd" />
              </div>
              <div>
                <span className={lblCls}>Best Contact *</span>
                <input value={contact.best_contact} onChange={(e) => setContact({ ...contact, best_contact: e.target.value })} className={fieldCls} placeholder="Contact name" />
              </div>
              <div>
                <span className={lblCls}>Phone Number *</span>
                <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={fieldCls} placeholder="04xx xxx xxx" />
              </div>
              <div>
                <span className={lblCls}>Best Email *</span>
                <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={fieldCls} placeholder="contact@email.com" />
              </div>
            </div>
          </div>
        </Section>

        {/* TAB 3 — TERMS & CONDITIONS */}
        <Section idx={2} open={open} setOpen={setOpen} icon={ScrollText} title="3 · Terms & Conditions" badge={[PROPOSAL_TYPES.find(t=>t.id===terms.proposal_type)?.label, TRADING_TERMS.find(t=>t.id===terms.trading_terms)?.label].filter(Boolean).join(" · ")}>
          <div className="space-y-3 pt-2">
            <div>
              <span className={lblCls}>Proposal Type</span>
              <div className="flex flex-wrap gap-2">
                {PROPOSAL_TYPES.map((t) => (
                  <Chip
                    key={t.id}
                    active={terms.proposal_type === t.id}
                    disabled={t.id === "commercial" && !commercialSelectable}
                    title={t.id === "commercial" && !commercialSelectable ? "Client must be a current, active customer" : ""}
                    onClick={() => setTerms({ ...terms, proposal_type: t.id })}
                  >
                    {t.label}{t.id === "commercial" && !commercialSelectable ? " 🔒" : ""}
                  </Chip>
                ))}
              </div>
              {!commercialSelectable && <p className="text-[10px] text-amber-400/70 mt-1">Commercial requires a current, active customer account.</p>}
            </div>
            <div>
              <span className={lblCls}>Trading Terms {customerStatus?.thirty && <span className="text-primary/60">(client on 30 days)</span>}</span>
              <div className="flex flex-wrap gap-2">
                {TRADING_TERMS.map((t) => (
                  <Chip key={t.id} active={terms.trading_terms === t.id} onClick={() => setTerms({ ...terms, trading_terms: t.id })}>{t.label}</Chip>
                ))}
              </div>
              <p className="text-[10px] text-white/30 mt-1">Standard is 14 days unless the client is already set to 30 days.</p>
            </div>

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
                        {active && <span className="ml-auto text-[9px] text-primary/70">in PDF</span>}
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

            {!commercialAllowed && (
              <p className="text-[10px] text-amber-400/70">Commercial pricing is locked — select a Commercial proposal type in Tab 3 to enable it.</p>
            )}

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
                            <button
                              onClick={commercialAllowed ? () => updateItem(idx, { pricing_basis: "commercial", quantity: 1, unit_price: +(it.pack_cost * 1.20).toFixed(2) }) : undefined}
                              disabled={!commercialAllowed}
                              title={commercialAllowed ? "" : "Select Commercial proposal type in Tab 3"}
                              className={it.pricing_basis === "commercial" ? "px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground" : commercialAllowed ? "px-1.5 py-0.5 rounded text-[9px] border border-input text-white/50 hover:text-white" : "px-1.5 py-0.5 rounded text-[9px] border border-input text-white/20 cursor-not-allowed"}
                            >
                              Commercial +20%
                            </button>
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
              <div className="flex justify-between"><span className="text-white/40">Contact</span><span className="text-white/80">{contact.best_contact || "—"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Phone</span><span className="text-white/80">{contact.phone || "—"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Type</span><span className="text-white/80">{PROPOSAL_TYPES.find(t => t.id === terms.proposal_type)?.label || "—"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Terms</span><span className="text-white/80">{TRADING_TERMS.find(t => t.id === terms.trading_terms)?.label || "—"}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Lines</span><span className="text-white/80">{items.length}</span></div>
              <div className="flex justify-between pt-1 border-t border-[hsl(0,0%,14%)]"><span className="text-white/40">Total (inc GST)</span><span className="text-primary font-heading">{fmt(total)}</span></div>
              {!canGenerate && <div className="text-[10px] text-amber-400/70 pt-1">Complete client name, contact details & add items to generate.</div>}
            </div>
            <p className="text-[11px] text-white/40">Generates a quote-style proposal PDF (no part numbers) with all terms, info, items & quantities, and opens it for review. The branded proposal-pack template will be slotted in once you add it.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleGenerate} disabled={saving || !canGenerate} className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                <FileDown className="w-4 h-4" /> {saving ? "Generating..." : "Generate Proposal"}
              </button>
              <button onClick={previewSample} className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-input text-white/70 text-sm hover:bg-white/5">
                <Eye className="w-4 h-4" /> Sample
              </button>
              <button onClick={reset} disabled={!items.length && !qualify.client_name && !contact.company_name} className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-input text-white/60 text-sm hover:bg-white/5 disabled:opacity-50">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}