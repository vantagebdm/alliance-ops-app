import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Download, Edit, Eye, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import CreditAppEditor from "@/components/creditapp/CreditAppEditor";
import CreditAppPreview from "@/components/creditapp/CreditAppPreview";

export default function CreditAppTemplates() {
  const [templates, setTemplates] = useState([]);
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState(null); // null | 'edit' | 'preview'
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CreditAppTemplate.list("-created_date", 20);
    setTemplates(data);
    if (data.length > 0) setActive(data.find(t => t.is_active) || data[0]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSaved = (saved) => {
    setActive(saved);
    setMode(null);
    load();
  };

  if (mode === "edit") return <CreditAppEditor template={active} onClose={() => setMode(null)} onSaved={handleSaved} />;
  if (mode === "preview") return <CreditAppPreview template={active} onClose={() => setMode(null)} />;

  return (
    <div>
      <PageHeader
        title="Credit Application Templates"
        subtitle="Manage your APP Credit Account Application Pack"
        actions={
          <div className="flex gap-2">
            {active && (
              <>
                <Button variant="outline" onClick={() => setMode("preview")} className="rounded-sm font-heading text-xs uppercase tracking-wider">
                  <Eye className="w-4 h-4 mr-1" /> Preview
                </Button>
                <Button variant="outline" onClick={() => setMode("edit")} className="rounded-sm font-heading text-xs uppercase tracking-wider">
                  <Edit className="w-4 h-4 mr-1" /> Edit Template
                </Button>
              </>
            )}
            {!active && (
              <Button onClick={() => { setActive(null); setMode("edit"); }} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
                <Plus className="w-4 h-4 mr-1" /> Create Template
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : !active ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-sm">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-heading text-lg uppercase tracking-wider text-foreground/60 mb-2">No Template Found</p>
            <p className="text-sm text-muted-foreground mb-6">Create your APP Credit Account Application template to get started.</p>
            <Button onClick={() => setMode("edit")} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <Plus className="w-4 h-4 mr-1" /> Create APP Credit Application Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Template Card */}
            <div className="md:col-span-2 bg-card border border-border rounded-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="font-heading text-xs uppercase tracking-wider text-primary">Active Template</span>
                  </div>
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wider">{active.company_name} — Credit Account Application Pack</h2>
                  <p className="text-sm text-muted-foreground mt-1">Version {active.version || "1.0"} • {active.company_abn ? `ABN: ${active.company_abn}` : ""}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Company</p>
                  <p className="font-semibold">{active.company_name}</p>
                </div>
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">ABN / ACN</p>
                  <p>{active.company_abn} / {active.company_acn}</p>
                </div>
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Address</p>
                  <p>{active.company_address}</p>
                </div>
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Contact</p>
                  <p>{active.company_phone}</p>
                  <p>{active.company_email}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Document Pack Contents</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Page 1 — Credit Account Application", "Page 2 — Personal / Directors Guarantee & Indemnity", "Pages 3–4 — Terms & Conditions of Trade"].map((p, i) => (
                    <div key={i} className="bg-muted/40 border border-border rounded-sm p-3 text-xs">
                      <FileText className="w-4 h-4 text-primary mb-1" />
                      <p className="font-heading uppercase tracking-wide">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-sm p-4">
                <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Actions</p>
                <div className="space-y-2">
                  <Button onClick={() => setMode("preview")} variant="outline" className="w-full justify-start rounded-sm font-heading text-xs uppercase tracking-wider">
                    <Eye className="w-4 h-4 mr-2" /> Preview Full Pack
                  </Button>
                  <Button onClick={() => setMode("edit")} variant="outline" className="w-full justify-start rounded-sm font-heading text-xs uppercase tracking-wider">
                    <Edit className="w-4 h-4 mr-2" /> Edit Template
                  </Button>
                  <Button
                    onClick={() => setMode("preview")}
                    className="w-full justify-start bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
                  >
                    <Download className="w-4 h-4 mr-2" /> Generate & Download PDF
                  </Button>
                </div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-sm p-4 text-xs text-amber-700">
                <p className="font-heading uppercase tracking-wider mb-1">Important</p>
                <p>Always consult your legal advisor before sending credit documents to customers. Terms and conditions are editable but should be reviewed professionally.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}