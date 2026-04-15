import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Trash2, AlertTriangle, Package, ChevronDown } from "lucide-react";
import Autocomplete from "@/components/ui/Autocomplete";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import moment from "moment";

const DISPATCH_SOURCES = [
  { value: "sales_order", label: "From Sales Order" },
  { value: "customer_order", label: "From Customer Order" },
  { value: "manual", label: "Manual Dispatch" },
  { value: "urgent_breakdown", label: "Urgent Breakdown Dispatch" },
];

const DISPATCH_METHODS = [
  { value: "pickup", label: "Customer Pickup" },
  { value: "local_delivery", label: "Local Delivery" },
  { value: "freight", label: "Freight to Regional WA" },
  { value: "remote_site", label: "Remote Site Delivery" },
  { value: "internal_transfer", label: "Internal Transfer" },
];

const PRIORITIES = [
  { value: "standard", label: "Standard" },
  { value: "same_day", label: "Same Day" },
  { value: "urgent", label: "Urgent" },
  { value: "breakdown_critical", label: "Breakdown Critical" },
];

const ATTACHMENT_TYPES = ["Packing Slip", "Delivery Note", "Freight Label", "Goods Photo", "Proof of Dispatch", "Signed POD"];

const EMPTY_LINE = { part_number: "", description: "", ordered_qty: 0, available_qty: 0, dispatch_qty: 0, remaining_qty: 0, location: "", status: "pending" };

function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
      <div className="w-6 h-6 rounded-full bg-primary text-black text-xs font-heading font-bold flex items-center justify-center flex-shrink-0">{number}</div>
      <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">{title}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export default function DispatchForm({ onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const customerAC = useAutocomplete("Customer", "name", ["company", "trading_name"]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [soSearch, setSoSearch] = useState("");
  const [showSODropdown, setShowSODropdown] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const [form, setForm] = useState({
    dispatch_source: "",
    order_id: "", order_number: "",
    customer_name: "", customer_po_number: "", job_number: "",
    site_contact_name: "", contact_phone: "", contact_email: "",
    method: "",
    priority: "standard",
    status: "draft",
    items: [],
    pickup_contact: "", pickup_date: "", pickup_notes: "",
    delivery_address: "", delivery_suburb: "", delivery_contact: "",
    delivery_instructions: "", requested_delivery_date: "",
    freight_company: "", consignment_number: "", eta: "",
    site_name: "", site_access_instructions: "",
    from_location: "", to_location: "", transfer_reference: "",
    carrier: "", tracking_number: "",
    warehouse_location: "", assigned_staff: "", picked_by: "", packed_by: "",
    dispatch_date: moment().format("YYYY-MM-DD"),
    internal_notes: "", customer_notes: "",
    attachments: [],
  });

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    base44.entities.SalesOrder.list("-created_date", 200).then(setSalesOrders);
  }, []);

  const filteredSOs = salesOrders.filter(so =>
    so.order_number?.toLowerCase().includes(soSearch.toLowerCase()) ||
    so.customer_name?.toLowerCase().includes(soSearch.toLowerCase())
  );

  const selectSalesOrder = (so) => {
    const items = (so.items || []).map(i => ({
      part_number: i.part_number || "",
      description: i.description || "",
      ordered_qty: i.quantity || 0,
      available_qty: i.quantity || 0,
      dispatch_qty: i.quantity || 0,
      remaining_qty: 0,
      location: "",
      status: "pending",
    }));
    setForm(f => ({
      ...f,
      order_id: so.id,
      order_number: so.order_number || "",
      customer_name: so.customer_name || "",
      items,
    }));
    setSoSearch(so.order_number || "");
    setShowSODropdown(false);
  };

  const updateLine = (idx, field, val) => {
    const updated = form.items.map((item, i) => {
      if (i !== idx) return item;
      const newItem = { ...item, [field]: val };
      if (field === "dispatch_qty" || field === "ordered_qty") {
        newItem.remaining_qty = Math.max(0, (newItem.ordered_qty || 0) - (newItem.dispatch_qty || 0));
      }
      return newItem;
    });
    up("items", updated);
  };

  const addLine = () => up("items", [...form.items, { ...EMPTY_LINE }]);
  const removeLine = (idx) => up("items", form.items.filter((_, i) => i !== idx));

  const handleFileUpload = async (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingIdx(idx);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updated = [...form.attachments];
    updated[idx] = { ...updated[idx], url: file_url, filename: file.name };
    up("attachments", updated);
    setUploadingIdx(null);
  };

  const addAttachment = (type) => {
    up("attachments", [...form.attachments, { type, filename: "", url: "" }]);
  };

  const removeAttachment = (idx) => up("attachments", form.attachments.filter((_, i) => i !== idx));

  const generateDispatchNumber = () => {
    const ts = Date.now().toString().slice(-6);
    return `DSP-${ts}`;
  };

  const isValid = () => {
    if (!form.dispatch_source) return false;
    if (!form.customer_name) return false;
    if (!form.method) return false;
    if (form.items.length === 0) return false;
    if (!form.items.some(i => (i.dispatch_qty || 0) > 0)) return false;
    if (!form.dispatch_date) return false;
    return true;
  };

  const save = async (statusOverride) => {
    setSaving(true);
    const payload = {
      ...form,
      dispatch_number: generateDispatchNumber(),
      status: statusOverride || form.status,
    };
    await base44.entities.Dispatch.create(payload);
    setSaving(false);
    onSaved();
  };

  const isBreakdown = form.priority === "breakdown_critical";

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-end">
      <div className="w-full max-w-5xl h-full bg-card flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 flex-shrink-0 ${isBreakdown ? "bg-red-900" : "bg-[hsl(0,0%,6%)]"}`}>
          <div className="flex items-center gap-3">
            {isBreakdown && <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />}
            <div>
              <h2 className="font-heading text-xl font-bold text-white uppercase tracking-wider">New Dispatch</h2>
              {isBreakdown && <p className="text-xs text-red-300 font-heading uppercase tracking-wider">⚡ BREAKDOWN CRITICAL — PRIORITY DISPATCH</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* S1 — Source */}
          <SectionHeader number="1" title="Dispatch Source" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <FieldLabel required>Dispatch Source</FieldLabel>
              <Select value={form.dispatch_source} onValueChange={v => up("dispatch_source", v)}>
                <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select source..." /></SelectTrigger>
                <SelectContent>
                  {DISPATCH_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {form.dispatch_source === "sales_order" && (
              <div className="col-span-2 relative">
                <FieldLabel required>Sales Order Lookup</FieldLabel>
                <Input
                  value={soSearch}
                  onChange={e => { setSoSearch(e.target.value); setShowSODropdown(true); }}
                  onFocus={() => setShowSODropdown(true)}
                  placeholder="Search by order # or customer..."
                  className="rounded-sm"
                />
                {showSODropdown && filteredSOs.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 bg-popover border border-border rounded-sm shadow-xl max-h-48 overflow-y-auto">
                    {filteredSOs.slice(0, 15).map(so => (
                      <button key={so.id} onClick={() => selectSalesOrder(so)}
                        className="w-full text-left px-3 py-2 hover:bg-muted/40 flex items-center justify-between text-sm border-b border-border last:border-0">
                        <span className="font-mono font-semibold">{so.order_number}</span>
                        <span className="text-muted-foreground">{so.customer_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* S2 — Customer & Reference */}
          <SectionHeader number="2" title="Customer & Reference Details" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Customer Name</FieldLabel>
              <Autocomplete
                value={form.customer_name}
                suggestions={customerAC.suggestions}
                open={customerAC.open}
                loading={customerAC.loading}
                onInputChange={(val) => { up("customer_name", val); customerAC.handleInputChange(val); }}
                onSelect={(item) => {
                  const name = item.company || item.trading_name || item.name;
                  up("customer_name", name);
                  customerAC.setQuery(name);
                  customerAC.setOpen(false);
                }}
                onShowAll={customerAC.handleShowAll}
                placeholder="Search customer..."
                className="rounded-sm"
              />
            </div>
            <div>
              <FieldLabel>Sales Order #</FieldLabel>
              <Input value={form.order_number} onChange={e => up("order_number", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel>Customer PO #</FieldLabel>
              <Input value={form.customer_po_number} onChange={e => up("customer_po_number", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel>Job Number</FieldLabel>
              <Input value={form.job_number} onChange={e => up("job_number", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel>Site / Contact Name</FieldLabel>
              <Input value={form.site_contact_name} onChange={e => up("site_contact_name", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel>Contact Phone</FieldLabel>
              <Input value={form.contact_phone} onChange={e => up("contact_phone", e.target.value)} className="rounded-sm" />
            </div>
            <div className="col-span-2">
              <FieldLabel>Contact Email</FieldLabel>
              <Input value={form.contact_email} onChange={e => up("contact_email", e.target.value)} className="rounded-sm" />
            </div>
          </div>

          {/* S3 — Dispatch Method */}
          <SectionHeader number="3" title="Dispatch Method" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <FieldLabel required>Dispatch Method</FieldLabel>
              <div className="grid grid-cols-5 gap-2">
                {DISPATCH_METHODS.map(m => (
                  <button key={m.value} onClick={() => up("method", m.value)}
                    className={`py-2 px-2 text-[10px] font-heading font-semibold uppercase tracking-wider rounded-sm border transition-colors text-center
                      ${form.method === m.value ? "bg-primary text-black border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* S4 — Dispatch Lines */}
          <SectionHeader number="4" title="Dispatch Line Items" />
          <div className="border border-border rounded-sm overflow-x-auto mb-3">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-[hsl(0,0%,12%)]">
                <tr>
                  {["Part #", "Description", "Ord. Qty", "Avail. Qty", "Dispatch Qty", "Remaining", "Location", "Status", ""].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-heading text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.items.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No items added. Add lines below or link a Sales Order.</p>
                    </td>
                  </tr>
                )}
                {form.items.map((item, idx) => {
                  const isOverStock = (item.dispatch_qty || 0) > (item.available_qty || 0) && (item.available_qty || 0) > 0;
                  return (
                    <tr key={idx} className={`border-t border-border ${isOverStock ? "bg-red-500/5" : idx % 2 === 0 ? "" : "bg-muted/5"}`}>
                      <td className="px-2 py-1.5">
                        <Input value={item.part_number} onChange={e => updateLine(idx, "part_number", e.target.value)}
                          className="h-7 text-xs rounded-sm w-24" placeholder="P/N" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input value={item.description} onChange={e => updateLine(idx, "description", e.target.value)}
                          className="h-7 text-xs rounded-sm w-40" placeholder="Description" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" value={item.ordered_qty} onChange={e => updateLine(idx, "ordered_qty", parseFloat(e.target.value) || 0)}
                          className="h-7 text-xs rounded-sm w-16" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" value={item.available_qty} onChange={e => updateLine(idx, "available_qty", parseFloat(e.target.value) || 0)}
                          className="h-7 text-xs rounded-sm w-16" />
                      </td>
                      <td className="px-2 py-1.5">
                        <div>
                          <Input type="number" value={item.dispatch_qty} onChange={e => updateLine(idx, "dispatch_qty", parseFloat(e.target.value) || 0)}
                            className={`h-7 text-xs rounded-sm w-16 ${isOverStock ? "border-red-500" : ""}`} />
                          {isOverStock && <p className="text-[9px] text-red-400 mt-0.5">⚠ Exceeds stock</p>}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`font-mono text-xs font-bold ${item.remaining_qty > 0 ? "text-amber-400" : "text-green-400"}`}>
                          {item.remaining_qty > 0 ? `BO: ${item.remaining_qty}` : "Full"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <Input value={item.location} onChange={e => updateLine(idx, "location", e.target.value)}
                          className="h-7 text-xs rounded-sm w-20" placeholder="Bin/Location" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Select value={item.status} onValueChange={v => updateLine(idx, "status", v)}>
                          <SelectTrigger className="h-7 text-xs rounded-sm w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="picked">Picked</SelectItem>
                            <SelectItem value="packed">Packed</SelectItem>
                            <SelectItem value="backorder">Backorder</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5">
                        <button onClick={() => removeLine(idx)} className="text-muted-foreground hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button variant="outline" onClick={addLine} className="rounded-sm font-heading text-xs uppercase tracking-wider h-8 gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Line
          </Button>

          {/* S5 — Delivery / Collection Details */}
          {form.method && (
            <>
              <SectionHeader number="5" title="Delivery / Collection Details" />
              <div className="grid grid-cols-2 gap-3">
                {form.method === "pickup" && <>
                  <div>
                    <FieldLabel required>Pickup Contact Name</FieldLabel>
                    <Input value={form.pickup_contact} onChange={e => up("pickup_contact", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel required>Pickup Date</FieldLabel>
                    <Input type="date" value={form.pickup_date} onChange={e => up("pickup_date", e.target.value)} className="rounded-sm" />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Pickup Notes</FieldLabel>
                    <Textarea value={form.pickup_notes} onChange={e => up("pickup_notes", e.target.value)} className="rounded-sm" rows={2} />
                  </div>
                </>}

                {form.method === "local_delivery" && <>
                  <div className="col-span-2">
                    <FieldLabel required>Delivery Address</FieldLabel>
                    <Input value={form.delivery_address} onChange={e => up("delivery_address", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel required>Suburb / Town</FieldLabel>
                    <Input value={form.delivery_suburb} onChange={e => up("delivery_suburb", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>Delivery Contact</FieldLabel>
                    <Input value={form.delivery_contact} onChange={e => up("delivery_contact", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel required>Requested Delivery Date</FieldLabel>
                    <Input type="date" value={form.requested_delivery_date} onChange={e => up("requested_delivery_date", e.target.value)} className="rounded-sm" />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Delivery Instructions</FieldLabel>
                    <Textarea value={form.delivery_instructions} onChange={e => up("delivery_instructions", e.target.value)} className="rounded-sm" rows={2} />
                  </div>
                </>}

                {form.method === "freight" && <>
                  <div className="col-span-2">
                    <FieldLabel required>Delivery Address</FieldLabel>
                    <Input value={form.delivery_address} onChange={e => up("delivery_address", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel required>Town / Region</FieldLabel>
                    <Input value={form.delivery_suburb} onChange={e => up("delivery_suburb", e.target.value)} className="rounded-sm" placeholder="e.g. Karratha, Newman, Tom Price" />
                  </div>
                  <div>
                    <FieldLabel required>Freight Company</FieldLabel>
                    <Input value={form.freight_company} onChange={e => up("freight_company", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>Consignment Number</FieldLabel>
                    <Input value={form.consignment_number} onChange={e => up("consignment_number", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>ETA</FieldLabel>
                    <Input type="date" value={form.eta} onChange={e => up("eta", e.target.value)} className="rounded-sm" />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Dispatch Instructions</FieldLabel>
                    <Textarea value={form.delivery_instructions} onChange={e => up("delivery_instructions", e.target.value)} className="rounded-sm" rows={2} />
                  </div>
                </>}

                {form.method === "remote_site" && <>
                  <div>
                    <FieldLabel required>Site Name</FieldLabel>
                    <Input value={form.site_name} onChange={e => up("site_name", e.target.value)} className="rounded-sm" placeholder="e.g. Cloudbreak Mine Site" />
                  </div>
                  <div>
                    <FieldLabel>Site Contact</FieldLabel>
                    <Input value={form.site_contact_name} onChange={e => up("site_contact_name", e.target.value)} className="rounded-sm" />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Delivery Location Details</FieldLabel>
                    <Input value={form.delivery_address} onChange={e => up("delivery_address", e.target.value)} className="rounded-sm" placeholder="Laydown, workshop gate, etc." />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Access Instructions</FieldLabel>
                    <Textarea value={form.site_access_instructions} onChange={e => up("site_access_instructions", e.target.value)} className="rounded-sm" rows={2} placeholder="Inductions, gate codes, escort required..." />
                  </div>
                  <div>
                    <FieldLabel required>Freight Company</FieldLabel>
                    <Input value={form.freight_company} onChange={e => up("freight_company", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>ETA</FieldLabel>
                    <Input type="date" value={form.eta} onChange={e => up("eta", e.target.value)} className="rounded-sm" />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Remote Delivery Notes</FieldLabel>
                    <Textarea value={form.customer_notes} onChange={e => up("customer_notes", e.target.value)} className="rounded-sm" rows={2} />
                  </div>
                </>}

                {form.method === "internal_transfer" && <>
                  <div>
                    <FieldLabel required>From Location</FieldLabel>
                    <Input value={form.from_location} onChange={e => up("from_location", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel required>To Location</FieldLabel>
                    <Input value={form.to_location} onChange={e => up("to_location", e.target.value)} className="rounded-sm" />
                  </div>
                  <div>
                    <FieldLabel>Transfer Reference</FieldLabel>
                    <Input value={form.transfer_reference} onChange={e => up("transfer_reference", e.target.value)} className="rounded-sm" />
                  </div>
                </>}
              </div>
            </>
          )}

          {/* S6 — Priority */}
          <SectionHeader number="6" title="Priority" />
          <div className="grid grid-cols-4 gap-2">
            {PRIORITIES.map(p => (
              <button key={p.value} onClick={() => up("priority", p.value)}
                className={`py-3 px-3 text-[11px] font-heading font-semibold uppercase tracking-wider rounded-sm border transition-all text-center
                  ${form.priority === p.value
                    ? p.value === "breakdown_critical"
                      ? "bg-red-600 text-white border-red-600 animate-pulse"
                      : p.value === "urgent"
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-primary text-black border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                {p.label}
              </button>
            ))}
          </div>
          {isBreakdown && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300 font-heading uppercase tracking-wider">Breakdown Critical — This dispatch will be flagged as highest priority</p>
            </div>
          )}

          {/* S7 — Internal Handling */}
          <SectionHeader number="7" title="Internal Handling" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Warehouse Location</FieldLabel>
              <Input value={form.warehouse_location} onChange={e => up("warehouse_location", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel>Assigned Staff Member</FieldLabel>
              <Input value={form.assigned_staff} onChange={e => up("assigned_staff", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel>Picked By</FieldLabel>
              <Input value={form.picked_by} onChange={e => up("picked_by", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel>Packed By</FieldLabel>
              <Input value={form.packed_by} onChange={e => up("packed_by", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel required>Dispatch Date</FieldLabel>
              <Input type="date" value={form.dispatch_date} onChange={e => up("dispatch_date", e.target.value)} className="rounded-sm" />
            </div>
            <div>
              <FieldLabel>ETA</FieldLabel>
              <Input type="date" value={form.eta} onChange={e => up("eta", e.target.value)} className="rounded-sm" />
            </div>
            <div className="col-span-2">
              <FieldLabel>Internal Notes</FieldLabel>
              <Textarea value={form.internal_notes} onChange={e => up("internal_notes", e.target.value)} className="rounded-sm" rows={2} />
            </div>
            <div className="col-span-2">
              <FieldLabel>Customer Notes</FieldLabel>
              <Textarea value={form.customer_notes} onChange={e => up("customer_notes", e.target.value)} className="rounded-sm" rows={2} />
            </div>
          </div>

          {/* S8 — Attachments */}
          <SectionHeader number="8" title="Attachments & Documents" />
          <div className="space-y-2 mb-3">
            {form.attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 border border-border rounded-sm bg-muted/20">
                <span className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground w-32 flex-shrink-0">{att.type}</span>
                {att.url ? (
                  <a href={att.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline flex-1 truncate">{att.filename}</a>
                ) : (
                  <label className="flex-1 cursor-pointer">
                    <span className="text-xs text-muted-foreground">{uploadingIdx === idx ? "Uploading..." : "Click to upload"}</span>
                    <input type="file" className="hidden" onChange={e => handleFileUpload(idx, e)} />
                  </label>
                )}
                <button onClick={() => removeAttachment(idx)} className="text-muted-foreground hover:text-red-400 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ATTACHMENT_TYPES.map(type => (
              <button key={type} onClick={() => addAttachment(type)}
                className="px-2 py-1 text-[10px] font-heading uppercase tracking-wider border border-dashed border-border rounded-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
                + {type}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t border-border bg-[hsl(0,0%,8%)] px-6 py-4">
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">
              Cancel
            </Button>
            <Button variant="outline" onClick={() => save("draft")} disabled={saving || !isValid()}
              className="rounded-sm font-heading text-xs uppercase tracking-wider">
              Save Draft
            </Button>
            <Button onClick={() => save("ready_to_pick")} disabled={saving || !isValid()}
              className="rounded-sm font-heading text-xs uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400">
              Mark Ready to Pick
            </Button>
            <Button onClick={() => save("draft")} disabled={saving || !isValid()}
              className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              {saving ? "Creating..." : isBreakdown ? "⚡ Create Priority Dispatch" : "Create Dispatch"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}