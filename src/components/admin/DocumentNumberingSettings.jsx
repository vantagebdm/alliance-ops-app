import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hash, RefreshCw, Save, Eye } from "lucide-react";

const DEFAULT_CONFIGS = [
  { document_type: "purchase_order", subtype: "parts",           prefix: "PO-PS", current_sequence: 1, number_padding: 5, is_active: true, label: "Purchase Order — Parts" },
  { document_type: "purchase_order", subtype: "company_expense", prefix: "PO-CE", current_sequence: 1, number_padding: 5, is_active: true, label: "Purchase Order — Company Expense / Capex" },
  { document_type: "sales_order",    subtype: null,              prefix: "SO-",   current_sequence: 1, number_padding: 5, is_active: true, label: "Sales Order" },
  { document_type: "invoice",        subtype: null,              prefix: "I-",    current_sequence: 1, number_padding: 5, is_active: true, label: "Invoice" },
  { document_type: "quote",          subtype: null,              prefix: "Q-",    current_sequence: 1, number_padding: 5, is_active: true, label: "Quote" },
  { document_type: "enquiry",        subtype: null,              prefix: "E-",    current_sequence: 1, number_padding: 5, is_active: true, label: "Enquiry" },
  { document_type: "credit_return",    subtype: null, prefix: "CR-",  current_sequence: 1, number_padding: 5, is_active: true, label: "Credit / Return" },
  { document_type: "warranty",         subtype: null, prefix: "W-",   current_sequence: 1, number_padding: 5, is_active: true, label: "Warranty" },
  { document_type: "stock_adjustment", subtype: null, prefix: "SA-",  current_sequence: 1, number_padding: 5, is_active: true, label: "Stock Adjustment" },
  { document_type: "stocktake",        subtype: null, prefix: "ST-",  current_sequence: 1, number_padding: 5, is_active: true, label: "Stocktake" },
  { document_type: "stock_transfer",   subtype: null, prefix: "TR-",  current_sequence: 1, number_padding: 5, is_active: true, label: "Stock Transfer" },
  { document_type: "stock_movement",   subtype: null, prefix: "SM-",  current_sequence: 1, number_padding: 5, is_active: true, label: "Stock Movement" },
];

function formatExample(prefix, seq, padding) {
  return `${prefix}${String(seq).padStart(padding, "0")}`;
}

export default function DocumentNumberingSettings() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [initializing, setInitializing] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.DocNumbering.list("-created_date", 50);
    setConfigs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const initializeDefaults = async () => {
    setInitializing(true);
    for (const cfg of DEFAULT_CONFIGS) {
      await base44.entities.DocNumbering.create(cfg);
    }
    await load();
    setInitializing(false);
  };

  const updateLocal = (id, field, value) => {
    setConfigs(cs => cs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const saveConfig = async (config) => {
    setSaving(config.id);
    await base44.entities.DocNumbering.update(config.id, {
      prefix: config.prefix,
      current_sequence: Number(config.current_sequence),
      number_padding: Number(config.number_padding),
    });
    setSaving(null);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;
  }

  if (configs.length === 0) {
    return (
      <div className="bg-white border border-border rounded-sm p-8 text-center">
        <Hash className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider mb-1">No Numbering Configs Found</h3>
        <p className="text-xs text-muted-foreground mb-4">Click below to initialize the default document numbering sequences.</p>
        <Button
          onClick={initializeDefaults}
          disabled={initializing}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
        >
          {initializing ? "Initializing..." : "Initialize Default Sequences"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {configs.map(config => {
        const nextExample = formatExample(config.prefix, config.current_sequence, config.number_padding);
        const prevExample = config.current_sequence > 1
          ? formatExample(config.prefix, config.current_sequence - 1, config.number_padding)
          : null;

        return (
          <div key={config.id} className="bg-white border border-border rounded-sm overflow-hidden">
            {/* Config header */}
            <div className="bg-[hsl(0,0%,10%)] px-4 py-2.5 flex items-center justify-between">
              <div>
                <span className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                  {config.label || config.document_type}
                </span>
                {config.subtype && (
                  <span className="ml-2 text-[10px] font-heading text-white/40 uppercase tracking-wider">
                    [{config.subtype}]
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary text-sm font-bold">{nextExample}</span>
                <span className="text-white/30 text-[10px]">← next</span>
              </div>
            </div>

            {/* Config body */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Prefix</label>
                <Input
                  value={config.prefix}
                  onChange={e => updateLocal(config.id, "prefix", e.target.value)}
                  className="rounded-sm font-mono text-sm"
                  placeholder="e.g. Q-"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Next Sequence #</label>
                <Input
                  type="number"
                  min="1"
                  value={config.current_sequence}
                  onChange={e => updateLocal(config.id, "current_sequence", e.target.value)}
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Number Padding</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={config.number_padding}
                  onChange={e => updateLocal(config.id, "number_padding", e.target.value)}
                  className="rounded-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Preview</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/50 border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary font-bold">
                    {nextExample}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveConfig(config)}
                    disabled={saving === config.id}
                    className="bg-primary text-black font-heading font-bold uppercase text-[10px] tracking-wider hover:bg-primary/90 rounded-sm flex-shrink-0"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    {saving === config.id ? "..." : "Save"}
                  </Button>
                </div>
                {prevExample && (
                  <div className="text-[10px] text-muted-foreground font-heading">
                    Last issued: <span className="font-mono">{prevExample}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Example strip */}
            <div className="border-t border-border/50 px-4 py-2 bg-muted/20 flex items-center gap-1 flex-wrap">
              <span className="font-heading text-[9px] uppercase tracking-wider text-foreground/40 mr-1">
                <Eye className="w-3 h-3 inline mr-1" />Examples:
              </span>
              {[0, 1, 2, 9, 99].map(offset => (
                <span key={offset} className="font-mono text-[10px] text-foreground/60 bg-border/50 px-1.5 py-0.5 rounded-sm">
                  {formatExample(config.prefix, (config.current_sequence || 1) + offset, config.number_padding)}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="rounded-sm font-heading text-xs uppercase tracking-wider gap-2"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
      </div>
    </div>
  );
}