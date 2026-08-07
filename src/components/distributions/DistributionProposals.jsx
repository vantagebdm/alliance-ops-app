import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { generateProposalPDF } from "@/lib/documentPdf";
import { DISTRIBUTION_SUPPLIERS } from "@/lib/distributionData";
import { generateDocNumber } from "@/hooks/useDocNumber";
import {
  Search, Eye, Send, Check, X, FileText, UserPlus, RotateCcw, Clock, CalendarOff,
} from "lucide-react";

const fmt = (n) => `$${Number(n || 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fieldCls = "h-8 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

const STATUS_STYLES = {
  draft: "bg-white/10 text-white/50 border-white/15",
  sent: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  accepted: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  expired: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

function daysLeft(valid_until) {
  if (!valid_until) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const v = new Date(valid_until); v.setHours(0, 0, 0, 0);
  return Math.round((v - today) / 86400000);
}

function effStatus(p) {
  const dl = daysLeft(p.valid_until);
  if (p.status === "sent" && dl !== null && dl < 0) return "expired";
  return p.status || "draft";
}

export default function DistributionProposals() {
  const { toast } = useToast();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.DistributionProposal.list("-created_date", 500);
      setProposals(list || []);
    } catch (e) {
      toast({ title: "Failed to load proposals", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = proposals.filter((p) => {
    const q = query.toLowerCase();
    const matchQ = !q || `${p.proposal_number} ${p.customer_name} ${p.customer_company} ${p.title}`.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || effStatus(p) === statusFilter;
    return matchQ && matchS;
  });

  const setBusyFor = (id, val) => setBusy((b) => ({ ...b, [id]: val }));

  const updateStatus = async (p, status) => {
    setBusyFor(p.id, status);
    try {
      await base44.entities.DistributionProposal.update(p.id, { status });
      setProposals((prev) => prev.map((x) => x.id === p.id ? { ...x, status } : x));
      toast({ title: `Proposal marked ${status}`, description: p.proposal_number });
    } catch (e) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    } finally {
      setBusyFor(p.id, null);
    }
  };

  const viewPdf = async (p) => {
    setBusyFor(p.id, "pdf");
    try {
      const blob = await generateProposalPDF(p);
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (e) {
      toast({ title: "Failed to open PDF", description: e?.message, variant: "destructive" });
    } finally {
      setBusyFor(p.id, null);
    }
  };

  const addCustomer = async (p) => {
    setBusyFor(p.id, "customer");
    try {
      const existing = await base44.entities.Customer.filter({ email: p.customer_email });
      if (existing?.length) {
        toast({ title: "Customer already exists", description: existing[0].name });
        return;
      }
      const c = await base44.entities.Customer.create({
        name: p.customer_name,
        company: p.customer_company,
        email: p.customer_email,
        status: "active",
        account_status: "cash_sale",
        customer_type: "company",
      });
      await base44.entities.DistributionProposal.update(p.id, { status: "accepted" });
      setProposals((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "accepted" } : x));
      toast({ title: "Customer added & proposal accepted", description: c.name });
    } catch (e) {
      toast({ title: "Failed to add customer", description: e?.message, variant: "destructive" });
    } finally {
      setBusyFor(p.id, null);
    }
  };

  const convertToQuote = async (p) => {
    setBusyFor(p.id, "quote");
    try {
      const quote_number = await generateDocNumber("quote");
      const quote = await base44.entities.Quote.create({
        quote_number,
        customer_name: p.customer_name,
        customer_email: p.customer_email,
        company: p.customer_company,
        status: "draft",
        items: (p.items || []).map((it) => ({
          part_number: it.supplier_sku || "",
          description: `${it.description}${it.pack_size ? ` (${it.pack_size})` : ""}`,
          quantity: Number(it.quantity) || 0,
          unit_price: Number(it.unit_price) || 0,
          total: Number(it.total) || 0,
        })),
        subtotal: Number(p.subtotal) || 0,
        gst: Number(p.gst) || 0,
        total: Number(p.total) || 0,
        valid_until: p.valid_until || "",
        notes: `Converted from proposal ${p.proposal_number}`,
      });
      await base44.entities.DistributionProposal.update(p.id, { status: "accepted" });
      setProposals((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "accepted" } : x));
      toast({ title: "Converted to Quote", description: `${quote_number} — open in Quotes` });
    } catch (e) {
      toast({ title: "Conversion failed", description: e?.message, variant: "destructive" });
    } finally {
      setBusyFor(p.id, null);
    }
  };

  const supplierName = (id) => DISTRIBUTION_SUPPLIERS.find((s) => s.id === id)?.name || id;

  return (
    <div className="bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,14%)] rounded-md">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[hsl(0,0%,14%)]">
        <FileText className="w-4 h-4 text-primary" />
        <h2 className="font-heading text-sm uppercase tracking-wider text-white/80">Saved Proposals</h2>
        <span className="text-[10px] text-white/40">{proposals.length} stored</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search proposals..." className={`${fieldCls} pl-7 w-48`} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${fieldCls} w-32`}>
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          <button onClick={load} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md border border-input text-white/60 text-xs hover:text-white hover:bg-white/5">
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-white/40 text-sm">Loading proposals...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-white/40 text-sm">
          {proposals.length === 0 ? "No proposals stored yet. Generate one to see it here." : "No proposals match your filters."}
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[hsl(0,0%,14%)]">
                <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wider text-white/40">Proposal</th>
                <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wider text-white/40">Client</th>
                <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wider text-white/40">Supplier</th>
                <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wider text-white/40 text-right">Total</th>
                <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wider text-white/40">Status</th>
                <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wider text-white/40">Expiry</th>
                <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wider text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const s = effStatus(p);
                const dl = daysLeft(p.valid_until);
                const created = p.created_date ? new Date(p.created_date).toLocaleDateString("en-AU") : "—";
                const isBusy = busy[p.id];
                return (
                  <tr key={p.id} className="border-b border-[hsl(0,0%,12%)] hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <button onClick={() => setViewing(p)} className="text-primary font-mono text-xs hover:underline">{p.proposal_number}</button>
                      <div className="text-white/30 text-[10px]">{created}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-white/85 text-xs">{p.customer_name || "—"}</div>
                      <div className="text-white/30 text-[10px]">{p.customer_company || p.customer_email || ""}</div>
                    </td>
                    <td className="px-3 py-2.5 text-white/60 text-xs">{supplierName(p.supplier)}</td>
                    <td className="px-3 py-2.5 text-right text-white/85 text-xs">{fmt(p.total)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${STATUS_STYLES[s] || STATUS_STYLES.draft}`}>{s}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {dl === null ? (
                        <span className="text-white/30 text-[10px]">—</span>
                      ) : dl < 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[10px]"><CalendarOff className="w-3 h-3" /> {Math.abs(dl)}d ago</span>
                      ) : dl <= 7 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[10px]"><Clock className="w-3 h-3" /> {dl}d left</span>
                      ) : (
                        <span className="text-white/50 text-[10px]">{dl}d left</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewing(p)} title="View" className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => viewPdf(p)} disabled={isBusy === "pdf"} title="Open PDF" className="p-1.5 rounded text-white/50 hover:text-primary hover:bg-white/10 disabled:opacity-50"><FileText className="w-3.5 h-3.5" /></button>
                        {p.status === "draft" && (
                          <button onClick={() => updateStatus(p, "sent")} disabled={isBusy === "sent"} title="Mark sent" className="p-1.5 rounded text-white/50 hover:text-blue-400 hover:bg-white/10 disabled:opacity-50"><Send className="w-3.5 h-3.5" /></button>
                        )}
                        {(p.status === "sent" || p.status === "draft") && (
                          <>
                            <button onClick={() => updateStatus(p, "accepted")} disabled={isBusy === "accepted"} title="Accept" className="p-1.5 rounded text-white/50 hover:text-green-400 hover:bg-white/10 disabled:opacity-50"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => updateStatus(p, "rejected")} disabled={isBusy === "rejected"} title="Reject" className="p-1.5 rounded text-white/50 hover:text-red-400 hover:bg-white/10 disabled:opacity-50"><X className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                        {p.customer_email && p.status !== "accepted" && (
                          <button onClick={() => addCustomer(p)} disabled={isBusy === "customer"} title="Add to customers & accept" className="p-1.5 rounded text-white/50 hover:text-primary hover:bg-white/10 disabled:opacity-50"><UserPlus className="w-3.5 h-3.5" /></button>
                        )}
                        {p.status !== "accepted" && (
                          <button onClick={() => convertToQuote(p)} disabled={isBusy === "quote"} title="Convert to Quote" className="p-1.5 rounded text-white/50 hover:text-primary hover:bg-white/10 disabled:opacity-50"><RotateCcw className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setViewing(null)}>
          <div className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-md w-full max-w-2xl max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(0,0%,18%)] sticky top-0 bg-[hsl(0,0%,10%)]">
              <h3 className="font-heading text-sm uppercase tracking-wider text-white/85">{viewing.proposal_number}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${STATUS_STYLES[effStatus(viewing)] || STATUS_STYLES.draft}`}>{effStatus(viewing)}</span>
              <button onClick={() => viewPdf(viewing)} className="ml-auto inline-flex items-center gap-1 h-8 px-2.5 rounded-md border border-primary/40 text-primary text-xs hover:bg-primary/10"><FileText className="w-3.5 h-3.5" /> Open PDF</button>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Title" value={viewing.title} />
                <Info label="Supplier" value={supplierName(viewing.supplier)} />
                <Info label="Client" value={viewing.customer_name} />
                <Info label="Company" value={viewing.customer_company} />
                <Info label="Email" value={viewing.customer_email} />
                <Info label="Phone" value={viewing.best_contact_phone} />
                <Info label="Type" value={viewing.proposal_type} />
                <Info label="Trading Terms" value={viewing.trading_terms} />
                <Info label="Valid Until" value={viewing.valid_until} />
                <Info label="Deposit" value={viewing.deposit_required ? `${viewing.deposit_pct}%` : "No"} />
              </div>
              <div>
                <span className="block text-[10px] font-heading uppercase tracking-wider text-white/40 mb-1">Items</span>
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-white/40"><th className="py-1">Description</th><th className="py-1 text-right">Qty</th><th className="py-1 text-right">Unit</th><th className="py-1 text-right">Total</th></tr></thead>
                  <tbody>
                    {(viewing.items || []).map((it, i) => (
                      <tr key={i} className="border-t border-[hsl(0,0%,14%)]"><td className="py-1.5 text-white/80">{it.description}<div className="text-white/30 text-[10px]">{it.supplier_sku} · {it.pack_size}</div></td><td className="py-1.5 text-right text-white/70">{it.quantity}</td><td className="py-1.5 text-right text-white/70">{fmt(it.unit_price)}</td><td className="py-1.5 text-right text-white/85">{fmt(it.total)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-1 pt-2 border-t border-[hsl(0,0%,14%)]">
                <Row label="Subtotal" value={fmt(viewing.subtotal)} />
                <Row label="GST (10%)" value={fmt(viewing.gst)} />
                <Row label="Total" value={fmt(viewing.total)} bold />
              </div>
              {viewing.notes && <div><span className="block text-[10px] font-heading uppercase tracking-wider text-white/40 mb-1">Notes</span><p className="text-white/60 text-xs">{viewing.notes}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <span className="block text-[10px] font-heading uppercase tracking-wider text-white/40">{label}</span>
      <span className="text-white/80 text-xs">{value || "—"}</span>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "text-white font-heading text-base pt-1" : "text-white/50"}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}