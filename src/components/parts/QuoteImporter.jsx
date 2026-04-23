import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, FileText, Loader2, Check, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PART_CATEGORIES } from "@/lib/categories";
import { EQUIPMENT_TYPES } from "./EquipmentTypeSelector";

const CATEGORY_PREFIX_MAP = {
  engine: "APP-ENG", transmission: "APP-TRM", brakes: "APP-BRK", suspension: "APP-SUS",
  electrical: "APP-ELE", body: "APP-BOD", filters: "APP-FLT", hydraulic: "APP-HYD",
  driveline: "APP-DRV", cooling: "APP-COL", fuel: "APP-FUL", tyres: "APP-TYR",
  oils: "APP-OIL", sprays: "APP-SPR", consumables: "APP-CON", compliance: "APP-COM",
  chemicals: "APP-CHM", other: "APP-OTH"
};

async function generateAppPartNumber(category, existingParts) {
  const prefix = CATEGORY_PREFIX_MAP[category] || "APP-OTH";
  const matching = existingParts.filter(p => p.app_part_number?.startsWith(prefix));
  let nextNum = 1;
  if (matching.length > 0) {
    const nums = matching.map(p => parseInt(p.app_part_number?.replace(prefix, "")) || 0).filter(n => n > 0);
    if (nums.length > 0) nextNum = Math.max(...nums) + 1;
  }
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

export default function QuoteImporter({ onClose, onSaved }) {
  const [step, setStep] = useState("upload"); // upload | review
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [docInfo, setDocInfo] = useState(null);
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [existingParts, setExistingParts] = useState([]);
  const [expanded, setExpanded] = useState({});
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploading(false);
      setExtracting(true);

      // Load existing parts for sequence generation
      const existing = await base44.entities.Part.list();
      setExistingParts(existing);

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            document_number: { type: "string" },
            document_date: { type: "string" },
            supplier_name: { type: "string" },
            lines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  part_number: { type: "string" },
                  description: { type: "string" },
                  quantity: { type: "number" },
                  unit_price: { type: "number" }
                }
              }
            }
          }
        }
      });

      const extracted = result.output || {};
      setDocInfo({
        document_number: extracted.document_number || "",
        document_date: extracted.document_date || "",
        supplier_name: extracted.supplier_name || ""
      });

      // Build line items with defaults
      const rawLines = extracted.lines || [];
      const builtLines = await Promise.all(rawLines.map(async (l, i) => {
        const category = "other";
        const appNum = await generateAppPartNumber(category, existing);
        // Shift sequence so each line gets a different number
        existing.push({ app_part_number: appNum }); // fake push to increment for next

        // Check if part number already exists in ERP
        const extractedPN = (l.part_number || "").trim().toUpperCase();
        const matchedPart = extractedPN
          ? existing.find(p =>
              p.part_number?.toUpperCase() === extractedPN ||
              p.supplier_sku?.toUpperCase() === extractedPN ||
              p.oem_number?.toUpperCase() === extractedPN ||
              p.aftermarket_number?.toUpperCase() === extractedPN
            )
          : null;

        return {
          _id: i,
          include: true,
          part_number: l.part_number || "",
          name: (l.description || "").toUpperCase(),
          description: (l.description || "").toUpperCase(),
          category,
          equipment_type: "",
          unit_cost: l.unit_price || 0,
          sell_price: 0,
          quantity: l.quantity || 1,
          app_part_number: appNum,
          status: "active",
          existing_match: matchedPart || null
        };
      }));

      setLines(builtLines);
      setStep("review");
    } catch (err) {
      alert("Extraction failed: " + err.message);
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  const updateLine = (id, key, value) => {
    setLines(prev => prev.map(l => {
      if (l._id !== id) return l;
      const updated = { ...l, [key]: value };
      // Regenerate app part number if category changes
      if (key === "category") {
        generateAppPartNumber(value, existingParts).then(num => {
          setLines(prev2 => prev2.map(l2 => l2._id === id ? { ...l2, app_part_number: num } : l2));
        });
      }
      // Re-check ERP match if part number changes
      if (key === "part_number") {
        const pn = value.trim().toUpperCase();
        const match = pn
          ? existingParts.find(p =>
              p.part_number?.toUpperCase() === pn ||
              p.supplier_sku?.toUpperCase() === pn ||
              p.oem_number?.toUpperCase() === pn ||
              p.aftermarket_number?.toUpperCase() === pn
            )
          : null;
        updated.existing_match = match || null;
      }
      return updated;
    }));
  };

  const applyMarkup = (id, pct) => {
    setLines(prev => prev.map(l => {
      if (l._id !== id) return l;
      return { ...l, sell_price: parseFloat((l.unit_cost * (1 + pct / 100)).toFixed(2)) };
    }));
  };

  const saveAll = async () => {
    const toSave = lines.filter(l => l.include && l.part_number);
    if (!toSave.length) { alert("No parts selected to save."); return; }
    setSaving(true);
    let count = 0;
    for (const line of toSave) {
      const { _id, include, quantity, ...partData } = line;
      await base44.entities.Part.create(partData);
      count++;
      setSavedCount(count);
    }
    setSaving(false);
    onSaved();
  };

  const includedCount = lines.filter(l => l.include).length;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl mx-4">
        {/* Header */}
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between rounded-t-sm">
          <div>
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Import from Quote / Invoice</h2>
            {docInfo && (
              <p className="text-xs text-white/50 mt-0.5 font-mono">
                {docInfo.document_number} · {docInfo.supplier_name} · {docInfo.document_date}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {/* STEP: Upload */}
          {step === "upload" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-heading font-bold text-lg uppercase tracking-wider">Upload a Quote or Invoice</h3>
                <p className="text-sm text-muted-foreground mt-1">Supports PDF, PNG, JPG — parts will be extracted automatically</p>
              </div>
              {(uploading || extracting) ? (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-heading text-sm uppercase tracking-wider">
                    {uploading ? "Uploading..." : "Extracting parts..."}
                  </span>
                </div>
              ) : (
                <>
                  <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFile} />
                  <Button
                    onClick={() => fileRef.current.click()}
                    className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Choose File
                  </Button>
                </>
              )}
            </div>
          )}

          {/* STEP: Review */}
          {step === "review" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{lines.length}</span> parts extracted · <span className="font-bold text-primary">{includedCount}</span> selected to import
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setLines(prev => prev.map(l => ({ ...l, include: true })))} className="text-xs rounded-sm">Select All</Button>
                  <Button variant="outline" onClick={() => setLines(prev => prev.map(l => ({ ...l, include: false })))} className="text-xs rounded-sm">Deselect All</Button>
                </div>
              </div>

              {lines.map((line) => (
                <div key={line._id} className={`border rounded-sm transition-colors ${line.include ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 opacity-60"}`}>
                  {/* Line header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={line.include}
                      onChange={e => updateLine(line._id, "include", e.target.checked)}
                      className="w-4 h-4 accent-primary flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary">{line.part_number}</span>
                        <span className="text-sm font-medium truncate">{line.name}</span>
                        {line.existing_match && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-600 text-[10px] font-heading font-bold uppercase tracking-wider flex-shrink-0">
                            <AlertCircle className="w-3 h-3" /> Already in ERP
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Qty: {line.quantity} · Cost: ${line.unit_cost.toFixed(2)} · Sell: {line.sell_price > 0 ? `$${line.sell_price.toFixed(2)}` : "Not set"}
                        {line.existing_match && (
                          <span className="ml-2 text-amber-600 font-medium">
                            · Matched: {line.existing_match.name || line.existing_match.part_number} {line.existing_match.app_part_number ? `(${line.existing_match.app_part_number})` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [line._id]: !prev[line._id] }))}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      {expanded[line._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setLines(prev => prev.filter(l => l._id !== line._id))} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expanded edit panel */}
                  {expanded[line._id] && line.include && (
                    <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
                      {line.existing_match && (
                        <div className="flex items-start gap-2 p-3 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-700">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-bold font-heading uppercase tracking-wider">Part already exists in ERP</p>
                            <p className="mt-0.5">
                              <span className="font-mono font-bold">{line.existing_match.part_number}</span>
                              {line.existing_match.app_part_number && <> · <span className="text-primary font-semibold">{line.existing_match.app_part_number}</span></>}
                              {line.existing_match.name && <> · {line.existing_match.name}</>}
                            </p>
                            <p className="mt-0.5 text-amber-600/80">Importing will create a duplicate. Consider unchecking this line.</p>
                          </div>
                        </div>
                      )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Part Number</label>
                        <Input value={line.part_number} onChange={e => updateLine(line._id, "part_number", e.target.value.toUpperCase())} className="rounded-sm font-mono text-xs" />
                      </div>
                      <div>
                        <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Name / Description</label>
                        <Input value={line.name} onChange={e => updateLine(line._id, "name", e.target.value.toUpperCase())} className="rounded-sm text-xs" />
                      </div>
                      <div>
                        <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Category</label>
                        <Select value={line.category} onValueChange={v => updateLine(line._id, "category", v)}>
                          <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PART_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Equipment Type</label>
                        <Select value={line.equipment_type || ""} onValueChange={v => updateLine(line._id, "equipment_type", v)}>
                          <SelectTrigger className="rounded-sm text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            {EQUIPMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">APP Part # (Auto)</label>
                        <Input value={line.app_part_number} onChange={e => updateLine(line._id, "app_part_number", e.target.value.toUpperCase())} className="rounded-sm font-mono text-xs text-primary font-semibold bg-primary/5 border-primary/30" />
                      </div>
                      <div>
                        <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Unit Cost</label>
                        <Input type="number" step="0.01" value={line.unit_cost || ""} onChange={e => updateLine(line._id, "unit_cost", Number(e.target.value))} className="rounded-sm text-xs" placeholder="0.00" />
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50">Sell Price</label>
                          <div className="flex gap-1">
                            {[30, 45, 65].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => applyMarkup(line._id, pct)}
                                className="px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider rounded-sm bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-colors"
                              >
                                +{pct}%
                              </button>
                            ))}
                          </div>
                        </div>
                        <Input type="number" step="0.01" value={line.sell_price || ""} onChange={e => updateLine(line._id, "sell_price", Number(e.target.value))} className="rounded-sm text-xs" placeholder="0.00" />
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "review" && (
          <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {saving ? `Saving... ${savedCount} / ${lines.filter(l => l.include).length}` : `${includedCount} parts will be added to the catalogue`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
              <Button
                onClick={saveAll}
                disabled={saving || includedCount === 0}
                className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
              >
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />Import {includedCount} Parts</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}