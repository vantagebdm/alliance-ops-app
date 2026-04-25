import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-2 border-b border-[hsl(0,0%,14%)] last:border-0">
    <span className="text-xs font-heading uppercase tracking-wider text-white/60">{label}</span>
    <button onClick={() => onChange(!value)} className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-4" : "left-0.5"}`} />
    </button>
  </div>
);

const DOCUMENTS = ["Quotes","Sales Orders","Invoices","Credit Notes","Purchase Orders","Supplier Bills","Delivery Dockets","Pick Slips","Packing Slips","Customer Statements","Remittance Advices","Payslips","BAS Reports"];

export default function DocumentDefaults() {
  const [activeDoc, setActiveDoc] = useState("Invoices");
  const [s, setS] = useState({
    show_abn: true, show_branch_address: true, show_prepared_by: true,
    show_approved_by: false, show_payment_terms: true, show_gst_breakdown: true,
    show_part_images: false, show_app_part_number: true, show_genuine_number: true,
  });
  const [texts, setTexts] = useState({
    quote_notes: "This quote is valid for 30 days from the date of issue.",
    invoice_notes: "Payment due as per agreed terms. Thank you for your business.",
    po_notes: "Please confirm receipt and advise of any discrepancies within 24 hours.",
    warranty_disclaimer: "Warranty applies to manufacturer defects only. Warranty is void if parts are misused or incorrectly installed.",
    freight_disclaimer: "Freight charges are estimated and may vary based on weight, dimensions and carrier rates.",
    payment_instructions: "EFT to: ANZ Bank | BSB: 016-123 | Account: 1234 5678 | Ref: Invoice Number",
    terms_conditions: "All sales subject to Alliance Priority Parts standard terms and conditions. Available on request.",
  });
  const [saved, setSaved] = useState(false);
  const toggle = (k) => (v) => setS(x => ({ ...x, [k]: v }));

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Document Defaults</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Doc selector */}
        <div className="w-44 flex-shrink-0 bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
          {DOCUMENTS.map(d => (
            <button key={d} onClick={() => setActiveDoc(d)}
              className={`w-full text-left px-3 py-2.5 text-[10px] font-heading uppercase tracking-wider border-b border-[hsl(0,0%,14%)] last:border-0 transition-all ${activeDoc === d ? "bg-primary/10 text-primary border-r-2 border-r-primary" : "text-white/40 hover:text-white/70 hover:bg-[hsl(0,0%,13%)]"}`}>
              {d}
            </button>
          ))}
        </div>

        {/* Settings panel */}
        <div className="flex-1 space-y-4">
          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
            <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">{activeDoc} — Display Options</h3>
            <Toggle label="Show ABN on Document" value={s.show_abn} onChange={toggle("show_abn")} />
            <Toggle label="Show Branch Address" value={s.show_branch_address} onChange={toggle("show_branch_address")} />
            <Toggle label="Show Prepared By" value={s.show_prepared_by} onChange={toggle("show_prepared_by")} />
            <Toggle label="Show Approved By" value={s.show_approved_by} onChange={toggle("show_approved_by")} />
            <Toggle label="Show Payment Terms" value={s.show_payment_terms} onChange={toggle("show_payment_terms")} />
            <Toggle label="Show GST Breakdown" value={s.show_gst_breakdown} onChange={toggle("show_gst_breakdown")} />
            <Toggle label="Show Part Images" value={s.show_part_images} onChange={toggle("show_part_images")} />
            <Toggle label="Show APP Part Number" value={s.show_app_part_number} onChange={toggle("show_app_part_number")} />
            <Toggle label="Show Genuine Part Number" value={s.show_genuine_number} onChange={toggle("show_genuine_number")} />
          </div>

          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
            <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Default Text Content</h3>
            {[
              ["Quote Notes","quote_notes"], ["Invoice Notes","invoice_notes"],
              ["PO Notes","po_notes"], ["Warranty Disclaimer","warranty_disclaimer"],
              ["Freight Disclaimer","freight_disclaimer"],
              ["Payment Instructions","payment_instructions"],
              ["Terms & Conditions","terms_conditions"],
            ].map(([l, k]) => (
              <div key={k}>
                <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">{l}</label>
                <textarea value={texts[k]} onChange={e => setTexts(t => ({ ...t, [k]: e.target.value }))} rows={2}
                  className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white rounded-sm text-xs px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}