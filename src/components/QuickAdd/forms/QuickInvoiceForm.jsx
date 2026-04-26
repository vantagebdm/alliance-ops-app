import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Trash2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Autocomplete from "@/components/ui/Autocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { generateDocNumber, previewDocNumber } from "@/hooks/useDocNumber";
import { generateAndUploadInvoicePDF, buildInvoiceEmailBody } from "@/lib/invoicePdf";
import { format } from "date-fns";

const today = format(new Date(), "yyyy-MM-dd");
const newLine = () => ({ part_number: "", description: "", quantity: 1, unit_price: 0, discount: 0, gst: true, total: 0 });
const newChargeLine = (type) => ({ part_number: "", description: type, quantity: 1, unit_price: 0, discount: 0, gst: true, total: 0, _charge: type });

const INVOICE_SOURCES = [
  { value: "manual", label: "Manual Invoice" },
  { value: "sales_order", label: "From Sales Order" },
  { value: "dispatch", label: "From Dispatch" },
  { value: "counter_sale", label: "Counter Sale Invoice" },
  { value: "account_charge", label: "Account Charge Invoice" },
];

const PAYMENT_TERMS = ["due_on_receipt", "7_days", "14_days", "21_days", "30_days", "30_days_eom", "custom"];
const PAYMENT_TERMS_LABELS = {
  due_on_receipt: "Due on Receipt",
  "7_days": "7 Days",
  "14_days": "14 Days",
  "21_days": "21 Days",
  "30_days": "30 Days",
  "30_days_eom": "30 Days EOM",
  custom: "Custom",
};

const PAYMENT_TYPES = ["account", "cash", "eft", "card", "bank_transfer"];
const PAYMENT_TYPE_LABELS = {
  account: "Account", cash: "Cash", eft: "EFT", card: "Card", bank_transfer: "Bank Transfer",
};

const SECTION_LABELS = ["SOURCE", "CUSTOMER & BILLING", "INVOICE DETAILS", "LINE ITEMS", "CHARGES & TOTALS", "PAYMENT", "INTERNAL CONTROLS"];

function SectionHeader({ num, label, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 py-2 px-1 hover:bg-muted/20 transition-colors"
    >
      <div className="w-6 h-6 bg-primary flex items-center justify-center rounded-sm flex-shrink-0">
        <span className="font-heading font-bold text-black text-xs">{num}</span>
      </div>
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider flex-1 text-left">{label}</h3>
      {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="font-heading text-[11px] uppercase tracking-wider text-foreground/50 mb-1 block">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export default function QuickInvoiceForm({ onClose, onSaved, prefillCustomer }) {
  const [source, setSource] = useState("");
  const [form, setForm] = useState({
    customer_name: prefillCustomer?.name || "",
    billing_contact: prefillCustomer?.accounts_contact_name || "",
    billing_email: prefillCustomer?.email || "",
    billing_address: prefillCustomer?.billing_address_1 || "",
    delivery_address: prefillCustomer?.physical_address_1 || "",
    customer_po_number: "",
    job_number: "",
    account_status: prefillCustomer?.account_status || "",
    payment_terms: prefillCustomer?.payment_terms || "30_days_eom",
    pricing_tier: prefillCustomer?.pricing_tier || "standard",
    invoice_number: "",
    invoice_date: today,
    due_date: (() => { const d = new Date(today); d.setMonth(d.getMonth() + 1); d.setDate(0); d.setDate(d.getDate() + 30); return format(d, "yyyy-MM-dd"); })(),
    reference: "",
    sales_order_reference: "",
    dispatch_reference: "",
    internal_notes: "",
    customer_notes: "",
    items: [newLine()],
    payment_type: "account",
    payment_status: "unpaid",
    approved_by: "",
    linked_account: prefillCustomer?.id || "",
    status: "draft",
    company: prefillCustomer?.company || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveAction, setSaveAction] = useState("draft");
  const [openSections, setOpenSections] = useState([0, 1, 2, 3, 4, 5]);
  const [linkedOrder, setLinkedOrder] = useState(null);
  const [linkedDispatch, setLinkedDispatch] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [dispatchSearch, setDispatchSearch] = useState("");
  const [orderResults, setOrderResults] = useState([]);
  const [dispatchResults, setDispatchResults] = useState([]);
  const [accountWarning, setAccountWarning] = useState(null);

  // Pre-populate invoice number with the next prefix on mount
  useEffect(() => {
    previewDocNumber("invoice").then(num => {
      if (num) u("invoice_number", num);
    });
  }, []);

  const customerAC = useAutocomplete("Customer", "name");
  const companyAC = useAutocomplete("Customer", "company");
  const partAC = useAutocomplete("Part", "part_number", ["app_part_number", "name", "supplier_sku", "oem_number"]);

  const calcDueDate = (invoiceDate, paymentTerms) => {
    if (!invoiceDate || !paymentTerms) return "";
    const date = new Date(invoiceDate);
    if (paymentTerms === "7_days") { date.setDate(date.getDate() + 7); return format(date, "yyyy-MM-dd"); }
    if (paymentTerms === "14_days") { date.setDate(date.getDate() + 14); return format(date, "yyyy-MM-dd"); }
    if (paymentTerms === "21_days") { date.setDate(date.getDate() + 21); return format(date, "yyyy-MM-dd"); }
    if (paymentTerms === "30_days") { date.setDate(date.getDate() + 30); return format(date, "yyyy-MM-dd"); }
    if (paymentTerms === "30_days_eom") { date.setMonth(date.getMonth() + 1); date.setDate(0); date.setDate(date.getDate() + 30); return format(date, "yyyy-MM-dd"); }
    if (paymentTerms === "due_on_receipt") return invoiceDate;
    return "";
  };

  const u = (k, v) => setForm(f => {
    const updated = { ...f, [k]: v };
    if (k === "invoice_date" || k === "payment_terms") {
      const due = calcDueDate(
        k === "invoice_date" ? v : f.invoice_date,
        k === "payment_terms" ? v : f.payment_terms
      );
      if (due) updated.due_date = due;
    }
    return updated;
  });

  const fillCustomer = (item) => {
    setForm(f => ({
      ...f,
      customer_name: item.name || f.customer_name,
      company: item.company || f.company,
      billing_email: item.email || f.billing_email,
      linked_account: item.id || f.linked_account,
      account_status: item.status || f.account_status,
    }));
    if (item.status === "inactive") setAccountWarning("⚠ This customer account is inactive.");
    else setAccountWarning(null);
  };

  // Search sales orders
  useEffect(() => {
    if (source !== "sales_order" || orderSearch.length < 2) { setOrderResults([]); return; }
    base44.entities.SalesOrder.filter({ order_number: { $contains: orderSearch } }, "-created_date", 10)
      .then(setOrderResults).catch(() => setOrderResults([]));
  }, [orderSearch, source]);

  // Search dispatches
  useEffect(() => {
    if (source !== "dispatch" || dispatchSearch.length < 2) { setDispatchResults([]); return; }
    base44.entities.Dispatch.filter({ dispatch_number: { $contains: dispatchSearch } }, "-created_date", 10)
      .then(setDispatchResults).catch(() => setDispatchResults([]));
  }, [dispatchSearch, source]);

  const loadFromOrder = (order) => {
    setLinkedOrder(order);
    setForm(f => ({
      ...f,
      customer_name: order.customer_name || "",
      company: order.company || "",
      sales_order_reference: order.order_number || "",
      payment_terms: order.payment_terms || f.payment_terms,
      items: (order.items || []).map(i => ({
        part_number: i.part_number || "",
        description: i.description || "",
        quantity: i.quantity || 1,
        unit_price: i.unit_price || 0,
        discount: 0,
        gst: true,
        total: (i.quantity || 1) * (i.unit_price || 0),
      })),
    }));
    recalc((order.items || []).map(i => ({ ...i, discount: 0, gst: true, total: (i.quantity || 1) * (i.unit_price || 0) })));
  };

  const loadFromDispatch = (dispatch) => {
    setLinkedDispatch(dispatch);
    setForm(f => ({
      ...f,
      customer_name: dispatch.customer_name || "",
      dispatch_reference: dispatch.dispatch_number || "",
      delivery_address: dispatch.delivery_address || "",
      items: (dispatch.items || []).map(i => ({
        part_number: i.part_number || "",
        description: i.description || "",
        quantity: i.dispatch_qty || i.ordered_qty || 1,
        unit_price: 0,
        discount: 0,
        gst: true,
        total: 0,
      })),
    }));
  };

  const recalc = (items) => {
    setForm(f => {
      const subtotal = items.reduce((s, l) => s + (Number(l.total) || 0), 0);
      return { ...f, items, subtotal, gst: subtotal * 0.1, total: subtotal * 1.1 };
    });
  };

  const updateLine = (i, k, v) => {
    const items = form.items.map((line, idx) => {
      if (idx !== i) return line;
      const updated = { ...line, [k]: v };
      if (["quantity", "unit_price", "discount"].includes(k)) {
        const qty = Number(updated.quantity) || 0;
        const price = Number(updated.unit_price) || 0;
        const disc = Number(updated.discount) || 0;
        updated.total = qty * price * (1 - disc / 100);
      }
      return updated;
    });
    recalc(items);
  };

  const addLine = () => recalc([...form.items, newLine()]);
  const addCharge = (type) => recalc([...form.items, newChargeLine(type)]);
  const removeLine = (i) => recalc(form.items.filter((_, idx) => idx !== i));

  const subtotal = form.items.reduce((s, l) => s + (Number(l.total) || 0), 0);
  const gstAmount = form.items.filter(l => l.gst).reduce((s, l) => s + (Number(l.total) || 0) * 0.1, 0);
  const totalAmount = subtotal + gstAmount;

  const toggleSection = (i) => setOpenSections(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);

  const validate = () => {
    if (!source) return "Please select an invoice source.";
    if (!form.customer_name) return "Customer name is required.";
    if (!form.invoice_date) return "Invoice date is required.";
    if (!form.payment_terms) return "Payment terms are required.";
    if (!form.items.length || form.items.every(l => !l.description && !l.part_number)) return "At least one line item is required.";
    if (totalAmount <= 0) return "Invoice total must be greater than $0.";
    if (saveAction === "email" && !form.billing_email) return "Billing email is required when emailing an invoice.";
    return null;
  };

  const save = async (action) => {
    setSaveAction(action);
    const err = validate();
    if (err) { alert(err); return; }
    setSaving(true);
    try {
      const status = action === "draft" ? "draft" : action === "paid" ? "paid" : "sent";
      const invoiceNumber = form.invoice_number || await generateDocNumber("invoice");
      const data = {
        ...form,
        invoice_number: invoiceNumber,
        status,
        subtotal,
        gst: gstAmount,
        total: totalAmount,
        items: form.items,
        invoice_source: source,
      };
      if (prefillCustomer?.id) data.customer_id = prefillCustomer.id;
      await base44.entities.Invoice.create(data);

      // Send email with PDF when action is "email"
      if (action === "email" && form.billing_email) {
        const invoiceData = { ...data, invoice_number: invoiceNumber, subtotal, gst: gstAmount, total: totalAmount };
        const pdfUrl = await generateAndUploadInvoicePDF(invoiceData, base44);
        const emailBody = buildInvoiceEmailBody(invoiceData, pdfUrl);
        await base44.integrations.Core.SendEmail({
          to: form.billing_email,
          subject: `Invoice ${invoiceNumber} — ${form.customer_name}`,
          body: emailBody,
        });
      }

      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-[hsl(0,0%,10%)] w-full max-w-6xl rounded-sm shadow-2xl mx-4 flex flex-col">

        {/* Header */}
        <div className="bg-[hsl(0,0%,6%)] px-6 py-4 flex items-center justify-between rounded-t-sm sticky top-0 z-10">
          <div>
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Create Invoice</h2>
            <p className="text-white/40 text-xs font-body mt-0.5">{form.invoice_number || "Auto-generated on save"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-heading font-semibold tracking-wider rounded-sm uppercase">Draft</span>
            <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 space-y-1 flex-1">

          {/* SECTION 1 — SOURCE */}
          <div className="border border-border rounded-sm overflow-hidden mb-3">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2">
              <SectionHeader num={1} label="Invoice Source" open={openSections.includes(0)} onToggle={() => toggleSection(0)} />
            </div>
            {openSections.includes(0) && (
              <div className="p-4 space-y-4">
                <div>
                  <FieldLabel required>Invoice Source</FieldLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INVOICE_SOURCES.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => { setSource(s.value); setLinkedOrder(null); setLinkedDispatch(null); }}
                        className={`px-3 py-2 text-xs font-heading font-semibold uppercase tracking-wider rounded-sm border transition-colors ${
                          source === s.value
                            ? "bg-primary text-black border-primary"
                            : "bg-[hsl(0,0%,14%)] text-white/70 border-[hsl(0,0%,22%)] hover:border-primary/50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sales Order lookup */}
                {source === "sales_order" && (
                  <div>
                    <FieldLabel>Search Sales Order</FieldLabel>
                    <Input
                      placeholder="Type order number..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      className="rounded-sm mb-2"
                    />
                    {orderResults.length > 0 && (
                      <div className="border border-border rounded-sm overflow-hidden">
                        {orderResults.map(o => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => { loadFromOrder(o); setOrderResults([]); setOrderSearch(o.order_number); }}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-primary/5 border-b border-border/50 last:border-0 text-left"
                          >
                            <span className="font-mono text-sm font-semibold text-primary">{o.order_number}</span>
                            <span className="text-xs text-muted-foreground">{o.customer_name}</span>
                            <span className="text-xs font-semibold">${(o.total || 0).toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {linkedOrder && (
                      <div className="mt-2 bg-primary/5 border border-primary/20 rounded-sm px-3 py-2 text-xs">
                        ✓ Linked to <strong>{linkedOrder.order_number}</strong> — {linkedOrder.customer_name}
                      </div>
                    )}
                  </div>
                )}

                {/* Dispatch lookup */}
                {source === "dispatch" && (
                  <div>
                    <FieldLabel>Search Dispatch</FieldLabel>
                    <Input
                      placeholder="Type dispatch number..."
                      value={dispatchSearch}
                      onChange={e => setDispatchSearch(e.target.value)}
                      className="rounded-sm mb-2"
                    />
                    {dispatchResults.length > 0 && (
                      <div className="border border-border rounded-sm overflow-hidden">
                        {dispatchResults.map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => { loadFromDispatch(d); setDispatchResults([]); setDispatchSearch(d.dispatch_number); }}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-primary/5 border-b border-border/50 last:border-0 text-left"
                          >
                            <span className="font-mono text-sm font-semibold text-primary">{d.dispatch_number}</span>
                            <span className="text-xs text-muted-foreground">{d.customer_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {linkedDispatch && (
                      <div className="mt-2 bg-primary/5 border border-primary/20 rounded-sm px-3 py-2 text-xs">
                        ✓ Linked to <strong>{linkedDispatch.dispatch_number}</strong> — {linkedDispatch.customer_name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2 — CUSTOMER */}
          <div className="border border-border rounded-sm overflow-hidden mb-3">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2">
              <SectionHeader num={2} label="Customer & Billing Details" open={openSections.includes(1)} onToggle={() => toggleSection(1)} />
            </div>
            {openSections.includes(1) && (
              <div className="p-4 space-y-3">
                {accountWarning && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-sm px-3 py-2 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {accountWarning}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Customer Name</FieldLabel>
                    <Autocomplete
                      value={form.customer_name}
                      suggestions={customerAC.suggestions}
                      open={customerAC.open}
                      loading={customerAC.loading}
                      onInputChange={(val) => { u("customer_name", val); customerAC.handleInputChange(val); }}
                      onSelect={(item) => { fillCustomer(item); customerAC.handleSelectSuggestion(item); }}
                      onShowAll={customerAC.handleShowAll}
                      placeholder="Search customer..."
                      className="rounded-sm"
                    />
                  </div>
                  <div>
                    <FieldLabel>Company</FieldLabel>
                    <Autocomplete
                      value={form.company}
                      suggestions={companyAC.suggestions}
                      open={companyAC.open}
                      loading={companyAC.loading}
                      onInputChange={(val) => { u("company", val); companyAC.handleInputChange(val); }}
                      onSelect={(item) => { fillCustomer(item); companyAC.handleSelectSuggestion(item); }}
                      onShowAll={companyAC.handleShowAll}
                      placeholder="Search company..."
                      className="rounded-sm"
                    />
                  </div>
                  <div>
                    <FieldLabel>Billing Contact</FieldLabel>
                    <Input value={form.billing_contact} onChange={e => u("billing_contact", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>Billing Email</FieldLabel>
                    <Input type="email" value={form.billing_email} onChange={e => u("billing_email", e.target.value)} className="rounded-sm" />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Billing Address</FieldLabel>
                    <Input value={form.billing_address} onChange={e => u("billing_address", e.target.value)} className="rounded-sm" />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Delivery Address</FieldLabel>
                    <Input value={form.delivery_address} onChange={e => u("delivery_address", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>Customer PO Number</FieldLabel>
                    <Input value={form.customer_po_number} onChange={e => u("customer_po_number", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>Job Number</FieldLabel>
                    <Input value={form.job_number} onChange={e => u("job_number", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>Pricing Tier</FieldLabel>
                    <Select value={form.pricing_tier} onValueChange={v => u("pricing_tier", v)}>
                      <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="trade">Trade</SelectItem>
                        <SelectItem value="fleet">Fleet</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="cost">Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FieldLabel required>Payment Terms</FieldLabel>
                    <Select value={form.payment_terms} onValueChange={v => u("payment_terms", v)}>
                      <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{PAYMENT_TERMS_LABELS[t]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3 — INVOICE DETAILS */}
          <div className="border border-border rounded-sm overflow-hidden mb-3">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2">
              <SectionHeader num={3} label="Invoice Details" open={openSections.includes(2)} onToggle={() => toggleSection(2)} />
            </div>
            {openSections.includes(2) && (
              <div className="p-4 grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Invoice Number</FieldLabel>
                  <Input value={form.invoice_number} onChange={e => u("invoice_number", e.target.value)} className="rounded-sm font-mono" />
                </div>
                <div>
                  <FieldLabel>Reference</FieldLabel>
                  <Input value={form.reference} onChange={e => u("reference", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel required>Invoice Date</FieldLabel>
                  <Input type="date" value={form.invoice_date} onChange={e => u("invoice_date", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel>Due Date</FieldLabel>
                  <Input type="date" value={form.due_date} onChange={e => u("due_date", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel>Sales Order Reference</FieldLabel>
                  <Input value={form.sales_order_reference} onChange={e => u("sales_order_reference", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel>Dispatch Reference</FieldLabel>
                  <Input value={form.dispatch_reference} onChange={e => u("dispatch_reference", e.target.value)} className="rounded-sm" />
                </div>
                <div className="col-span-2">
                  <FieldLabel>Customer Notes</FieldLabel>
                  <Textarea value={form.customer_notes} onChange={e => u("customer_notes", e.target.value)} rows={2} className="rounded-sm text-sm" placeholder="Visible to customer..." />
                </div>
                <div className="col-span-2">
                  <FieldLabel>Internal Notes</FieldLabel>
                  <Textarea value={form.internal_notes} onChange={e => u("internal_notes", e.target.value)} rows={2} className="rounded-sm text-sm" placeholder="Internal only..." />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4 — LINE ITEMS */}
          <div className="border border-border rounded-sm overflow-hidden mb-3">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2">
              <SectionHeader num={4} label="Line Items" open={openSections.includes(3)} onToggle={() => toggleSection(3)} />
            </div>
            {openSections.includes(3) && (
              <div className="p-4">
                <div className="space-y-2">
                    {/* Header row */}
                    <div className="grid gap-2 px-1 text-[10px] font-heading uppercase tracking-wider text-foreground/40" style={{ gridTemplateColumns: "1fr 2fr 60px 90px 60px 40px 80px 32px" }}>
                      <span>Part #</span>
                      <span>Description</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Unit Price</span>
                      <span className="text-right">Disc%</span>
                      <span className="text-center">GST</span>
                      <span className="text-right">Total</span>
                      <span />
                    </div>

                    {form.items.map((line, i) => (
                      <div key={i} className={`grid gap-2 items-center p-2 rounded-sm border ${line._charge ? "bg-blue-500/10 border-blue-500/30" : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,20%)]"}`} style={{ gridTemplateColumns: "1fr 2fr 60px 90px 60px 40px 80px 32px" }}>
                        {/* Part # */}
                        <div>
                          {line._charge ? (
                            <span className="text-[10px] font-heading text-blue-400 uppercase tracking-wider">{line._charge}</span>
                          ) : (
                            <Autocomplete
                              value={line.part_number}
                              suggestions={partAC.suggestions}
                              open={partAC.open}
                              loading={partAC.loading}
                              onInputChange={(val) => { updateLine(i, "part_number", val); partAC.handleInputChange(val); }}
                              onSelect={(item) => {
                                const items = form.items.map((l, idx) => idx === i ? { ...l, part_number: item.part_number, description: item.name, unit_price: item.sell_price || 0, total: (l.quantity || 1) * (item.sell_price || 0) } : l);
                                recalc(items);
                                partAC.handleSelectSuggestion(item);
                              }}
                              placeholder="SKU"
                              className="rounded-sm text-sm"
                            />
                          )}
                        </div>
                        {/* Description */}
                        <input value={line.description} onChange={e => updateLine(i, "description", e.target.value)}
                          placeholder="Description" className="h-9 w-full px-3 border border-[hsl(0,0%,22%)] bg-[hsl(0,0%,10%)] text-white rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                          {/* Qty */}
                          <input type="number" min="0" step="0.01" value={line.quantity} onChange={e => updateLine(i, "quantity", Number(e.target.value))}
                           className="h-9 w-full px-2 border border-[hsl(0,0%,22%)] bg-[hsl(0,0%,10%)] text-white rounded-sm text-sm text-right focus:outline-none focus:ring-1 focus:ring-ring" />
                          {/* Unit Price */}
                          <input type="number" step="0.01" value={line.unit_price} onChange={e => updateLine(i, "unit_price", Number(e.target.value))}
                           className="h-9 w-full px-2 border border-[hsl(0,0%,22%)] bg-[hsl(0,0%,10%)] text-white rounded-sm text-sm text-right focus:outline-none focus:ring-1 focus:ring-ring" />
                          {/* Disc% */}
                          <input type="number" min="0" max="100" value={line.discount} onChange={e => updateLine(i, "discount", Number(e.target.value))}
                           className="h-9 w-full px-2 border border-[hsl(0,0%,22%)] bg-[hsl(0,0%,10%)] text-white rounded-sm text-sm text-right focus:outline-none focus:ring-1 focus:ring-ring" />
                        {/* GST */}
                        <div className="flex justify-center">
                          <input type="checkbox" checked={line.gst} onChange={e => updateLine(i, "gst", e.target.checked)}
                            className="h-4 w-4 accent-primary" />
                        </div>
                        {/* Total */}
                        <div className="text-right font-semibold text-sm">${(line.total || 0).toFixed(2)}</div>
                        {/* Delete */}
                        <div className="flex justify-center">
                          <button onClick={() => removeLine(i)} className="text-muted-foreground hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={addLine} className="rounded-sm font-heading text-xs uppercase tracking-wider">
                    <Plus className="w-3 h-3 mr-1" /> Add Line
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addCharge("Freight")} className="rounded-sm font-heading text-xs uppercase tracking-wider text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                    + Freight
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addCharge("Handling")} className="rounded-sm font-heading text-xs uppercase tracking-wider text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                    + Handling
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addCharge("Remote Delivery Surcharge")} className="rounded-sm font-heading text-xs uppercase tracking-wider text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                    + Remote Surcharge
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addCharge("After-hours Surcharge")} className="rounded-sm font-heading text-xs uppercase tracking-wider text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                    + After-hours
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addCharge("Miscellaneous")} className="rounded-sm font-heading text-xs uppercase tracking-wider text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                    + Misc Charge
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5 — TOTALS */}
          <div className="border border-border rounded-sm overflow-hidden mb-3">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2">
              <SectionHeader num={5} label="Charges & Totals" open={openSections.includes(4)} onToggle={() => toggleSection(4)} />
            </div>
            {openSections.includes(4) && (
              <div className="p-4 flex justify-end">
                <div className="w-72 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="font-heading text-[11px] uppercase tracking-wider">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="font-heading text-[11px] uppercase tracking-wider">GST (10%)</span>
                    <span>${gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
                    <span className="font-heading uppercase tracking-wider">Total</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6 — PAYMENT */}
          <div className="border border-border rounded-sm overflow-hidden mb-3">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2">
              <SectionHeader num={6} label="Payment Setup" open={openSections.includes(5)} onToggle={() => toggleSection(5)} />
            </div>
            {openSections.includes(5) && (
              <div className="p-4 grid grid-cols-3 gap-3">
                <div>
                  <FieldLabel>Payment Type</FieldLabel>
                  <Select value={form.payment_type} onValueChange={v => u("payment_type", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map(t => <SelectItem key={t} value={t}>{PAYMENT_TYPE_LABELS[t]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FieldLabel required>Payment Terms</FieldLabel>
                  <Select value={form.payment_terms} onValueChange={v => u("payment_terms", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{PAYMENT_TERMS_LABELS[t]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FieldLabel>Payment Status</FieldLabel>
                  <Select value={form.payment_status} onValueChange={v => u("payment_status", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="part_paid">Part Paid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 7 — INTERNAL CONTROLS */}
          <div className="border border-border rounded-sm overflow-hidden mb-3">
            <div className="bg-[hsl(0,0%,8%)] px-4 py-2">
              <SectionHeader num={7} label="Internal Controls" open={openSections.includes(6)} onToggle={() => toggleSection(6)} />
            </div>
            {openSections.includes(6) && (
              <div className="p-4 grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Approved By</FieldLabel>
                  <Input value={form.approved_by} onChange={e => u("approved_by", e.target.value)} className="rounded-sm" />
                </div>
                <div>
                  <FieldLabel>Linked Customer Account</FieldLabel>
                  <Input value={form.linked_account} onChange={e => u("linked_account", e.target.value)} className="rounded-sm" placeholder="Account ID" />
                </div>
                <div>
                  <FieldLabel>Invoice Status</FieldLabel>
                  <Select value={form.status} onValueChange={v => u("status", v)}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["draft","issued","sent","part_paid","paid","overdue","cancelled","credit_pending"].map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FieldLabel>Account Status</FieldLabel>
                  <Input value={form.account_status} onChange={e => u("account_status", e.target.value)} className="rounded-sm" readOnly placeholder="Auto-filled from customer" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[hsl(0,0%,6%)] border-t border-border flex flex-wrap items-center justify-between gap-3 rounded-b-sm sticky bottom-0">
          <div className="text-white/50 text-xs font-heading uppercase tracking-wider">
            Total: <span className="text-primary font-bold text-base">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onClose} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider border-white/20 text-white/70 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={() => save("draft")} disabled={saving} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-secondary text-white hover:bg-secondary/80">
              {saving && saveAction === "draft" ? "Saving..." : "Save Draft"}
            </Button>
            <Button onClick={() => save("invoice")} disabled={saving} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-primary text-black hover:bg-primary/90">
              {saving && saveAction === "invoice" ? "Creating..." : "Create Invoice"}
            </Button>
            <Button onClick={() => save("email")} disabled={saving} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700">
              {saving && saveAction === "email" ? "Sending..." : "Create & Email"}
            </Button>
            <Button onClick={() => save("paid")} disabled={saving} size="sm"
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-green-600 text-white hover:bg-green-700">
              {saving && saveAction === "paid" ? "Saving..." : "Create & Mark Paid"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}