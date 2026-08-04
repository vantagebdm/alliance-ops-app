import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, CheckCircle2, AlertTriangle, Building2, ArrowRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";

const APP_META_FIELDS = ["id", "application_number", "submitted_at", "status", "matched_supplier_id", "matched_supplier_name", "supplier_type", "declaration_name", "declaration_position", "declaration_date", "created_date", "updated_date", "created_by_id"];

function Row({ label, value }) {
  if (!value && value !== 0 && value !== false) return null;
  const display = Array.isArray(value) ? value.join(", ") : String(value);
  if (!display) return null;
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-border/40 text-xs">
      <span className="text-muted-foreground uppercase tracking-wider flex-shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium">{display}</span>
    </div>
  );
}

export default function SupplierApplicationReview({ applications, onClose, onConfirm }) {
  const [selectedId, setSelectedId] = useState(applications[0]?.id || null);
  const [matched, setMatched] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const selected = applications.find(a => a.id === selectedId);

  const loadMatched = async (app) => {
    setMatched(null);
    if (!app?.matched_supplier_id) return;
    setLoadingMatch(true);
    try {
      const sup = await base44.entities.Supplier.get(app.matched_supplier_id);
      setMatched(sup);
    } catch (e) { /* ignore */ }
    setLoadingMatch(false);
  };

  const handleSelect = (app) => {
    setSelectedId(app.id);
    loadMatched(app);
  };

  // Load matched supplier when selection changes initially
  if (selected && matched === null && !loadingMatch && selected.matched_supplier_id) {
    loadMatched(selected);
  }

  const handleConfirm = async () => {
    if (!selected || !matched) return;
    setConfirming(true);
    await base44.entities.SupplierApplication.update(selected.id, { status: "confirmed" });
    // Build prefill: merge application fields over matched supplier, keeping id + status
    const appData = {};
    Object.keys(selected).forEach(k => {
      if (APP_META_FIELDS.includes(k)) return;
      const v = selected[k];
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v) && v.length === 0) return;
      appData[k] = v;
    });
    const prefill = { ...matched, ...appData, id: matched.id, status: matched.status };
    setConfirming(false);
    onConfirm(selected, prefill);
  };

  const handleCreateFromApp = async () => {
    if (!selected) return;
    setConfirming(true);
    await base44.entities.SupplierApplication.update(selected.id, { status: "confirmed" });
    const appData = {};
    Object.keys(selected).forEach(k => {
      if (APP_META_FIELDS.includes(k)) return;
      const v = selected[k];
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v) && v.length === 0) return;
      appData[k] = v;
    });
    const prefill = { ...appData, status: "on_hold", supplier_type: selected.supplier_type };
    setConfirming(false);
    onConfirm(selected, prefill);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-[hsl(0,0%,10%)] w-full max-w-4xl rounded-sm shadow-2xl flex flex-col mx-4" style={{ minHeight: "min(80vh, 700px)" }}>
        {/* Header */}
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm flex-shrink-0 border-b border-border">
          <div>
            <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">Supplier Applications</h2>
            <p className="text-white/40 text-[10px] font-heading uppercase tracking-wider mt-0.5">{applications.length} pending — awaiting confirmation</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex gap-4">
          {/* List */}
          <div className="w-72 flex-shrink-0 space-y-2 overflow-y-auto">
            {applications.map(a => (
              <button key={a.id} onClick={() => handleSelect(a)}
                className={`w-full text-left p-3 rounded-sm border transition-colors ${selectedId === a.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted/30"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-white/40">{a.application_number}</span>
                  {a.status === "matched"
                    ? <span className="text-[9px] font-heading uppercase tracking-wider text-primary flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Match</span>
                    : <span className="text-[9px] font-heading uppercase tracking-wider text-amber-400 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> No Match</span>}
                </div>
                <div className="font-semibold text-white text-sm leading-tight">{a.name}</div>
                {a.trading_name && a.trading_name !== a.name && <div className="text-[10px] text-white/30">{a.trading_name}</div>}
                <div className="text-[10px] text-white/40 mt-1">{new Date(a.submitted_at).toLocaleDateString("en-AU")}</div>
              </button>
            ))}
            {applications.length === 0 && (
              <div className="text-center py-12 text-white/30 text-xs font-heading uppercase tracking-wider">No pending applications</div>
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 overflow-y-auto">
            {!selected ? (
              <div className="text-center py-20 text-white/30 text-xs font-heading uppercase tracking-wider">Select an application to review</div>
            ) : (
              <div className="space-y-4">
                {/* Match banner */}
                {selected.status === "matched" ? (
                  <div className="p-3 rounded-sm border border-primary/40 bg-primary/10 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-heading uppercase tracking-wider text-primary">Matched On Hold Supplier</div>
                      <div className="text-white font-semibold">{loadingMatch ? "Loading…" : (matched?.trading_name || matched?.name || selected.matched_supplier_name)}</div>
                      <div className="text-[10px] text-white/40">Status: {matched?.status || "on_hold"} · Code: {matched?.supplier_code || "—"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-sm border border-amber-500/40 bg-amber-500/10 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-heading uppercase tracking-wider text-amber-400">No Matching On Hold Supplier</div>
                      <div className="text-white/70 text-xs">No On Hold account with a matching name was found. You can still create a new supplier from this application.</div>
                    </div>
                  </div>
                )}

                {/* Application details */}
                <div className="bg-card border border-border rounded-sm p-4">
                  <div className="font-heading text-[10px] uppercase tracking-wider text-white/50 mb-2">Application {selected.application_number}</div>
                  <Row label="Legal Name" value={selected.name} />
                  <Row label="Trading Name" value={selected.trading_name} />
                  <Row label="ABN / ACN" value={[selected.abn, selected.acn].filter(Boolean).join(" / ")} />
                  <Row label="Phone" value={selected.phone} />
                  <Row label="Email" value={selected.email} />
                  <Row label="Website" value={selected.website} />
                  <Row label="Sales Contact" value={[selected.contact_person, selected.contact_email].filter(Boolean).join(" — ")} />
                  <Row label="Accounts Contact" value={[selected.accounts_contact_name, selected.accounts_email].filter(Boolean).join(" — ")} />
                  <Row label="Payment Terms" value={selected.payment_terms} />
                  <Row label="Pricing Basis" value={selected.pricing_basis} />
                  <Row label="Lead Time" value={selected.lead_time_standard ? `${selected.lead_time_standard} days` : ""} />
                  <Row label="Categories" value={selected.categories_supplied} />
                  <Row label="Brands" value={selected.brands_supplied} />
                  <Row label="Bank" value={[selected.bank_name, selected.bank_bsb, selected.bank_account_number].filter(Boolean).join(" · ")} />
                  <Row label="Declaration" value={[selected.declaration_name, selected.declaration_position].filter(Boolean).join(" — ")} />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 justify-end">
                  {selected.status === "matched" ? (
                    <Button onClick={handleConfirm} disabled={!matched || confirming}
                      className="bg-primary text-black font-heading font-bold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
                      {confirming ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ArrowRight className="w-3 h-3 mr-1" />}
                      Confirm & Fill Supplier
                    </Button>
                  ) : (
                    <Button onClick={handleCreateFromApp} disabled={confirming}
                      className="bg-primary text-black font-heading font-bold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
                      {confirming ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                      Create New Supplier from Application
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}