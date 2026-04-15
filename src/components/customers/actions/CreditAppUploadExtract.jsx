import { useState } from "react";
import { X, File, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function CreditAppUploadExtract({ customer, onClose, onExtracted }) {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    // Extract data from PDF
    setExtracting(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      
      // Extract structured data using OCR/LLM
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract the following data from this credit application PDF. Return as JSON:\n- legal_name\n- trading_name\n- abn\n- acn\n- address\n- city\n- state\n- postcode\n- phone\n- email\n- business_type\n- directors (array with name, dob, address)\n- bank_name\n- bank_account_name\n- bank_bsb\n- bank_account_number\n- trade_references (array with business_name, contact, address)`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            legal_name: { type: "string" },
            trading_name: { type: "string" },
            abn: { type: "string" },
            acn: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            postcode: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            business_type: { type: "string" },
            directors: { type: "array" },
            bank_name: { type: "string" },
            bank_account_name: { type: "string" },
            bank_bsb: { type: "string" },
            bank_account_number: { type: "string" },
            trade_references: { type: "array" }
          }
        }
      });

      setExtractedData(response);
    } catch (err) {
      console.error("Extraction failed:", err);
    }
    setExtracting(false);
  };

  const handleSaveExtractedData = async () => {
    if (!extractedData) return;
    setSaving(true);
    try {
      // Upload the PDF file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Update customer with extracted data
      const updates = {
        name: extractedData.legal_name || customer.name,
        trading_name: extractedData.trading_name,
        abn: extractedData.abn,
        acn: extractedData.acn,
        physical_address_1: extractedData.address,
        physical_state: extractedData.state,
        physical_postcode: extractedData.postcode,
        phone: extractedData.phone,
        email: extractedData.email,
        nature_of_business: extractedData.business_type,
        bank_branch: extractedData.bank_name,
        bank_account_number: extractedData.bank_account_number,
        directors: extractedData.directors || [],
        trade_references: extractedData.trade_references || [],
      };

      await base44.entities.Customer.update(customer.id, updates);

      // Save credit app document
      const docs = customer?.attachments || [];
      docs.push({
        doc_type: "Credit Application",
        filename: file.name,
        url: file_url,
        uploaded_by: (await base44.auth.me())?.email,
        upload_date: new Date().toISOString(),
        description: "Extracted from uploaded PDF"
      });
      await base44.entities.Customer.update(customer.id, { attachments: docs });

      onExtracted?.();
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-sm max-w-2xl w-full mx-4 shadow-2xl my-4">
        <div className="bg-[hsl(0,0%,8%)] px-6 py-4 flex items-center justify-between sticky top-0">
          <h2 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Upload & Extract Credit Application</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {!extractedData ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Upload a completed credit application PDF. Data will be extracted and matched to customer fields.</p>
              
              <div className="border-2 border-dashed border-border rounded-sm p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => document.getElementById("pdf-input").click()}>
                <File className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-heading uppercase tracking-wider text-foreground/60 mb-1">
                  {file ? file.name : "Click to select PDF"}
                </p>
                <p className="text-xs text-muted-foreground">PDF format, max 10MB</p>
                <input
                  id="pdf-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf"
                  className="hidden"
                />
              </div>

              {extracting && <div className="mt-4 text-center text-sm text-muted-foreground">Extracting data...</div>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-sm p-4 flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Data Extracted Successfully</p>
                  <p className="text-xs text-green-600 mt-1">Review the extracted fields below. Missing or incorrect fields are highlighted.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(extractedData).filter(([k]) => !Array.isArray(extractedData[k])).map(([key, value]) => (
                  <div key={key} className="bg-muted/30 rounded-sm p-3">
                    <label className="text-xs font-heading uppercase tracking-wider text-foreground/60 block mb-1">{key.replace(/_/g, " ")}</label>
                    <p className={`font-medium ${!value ? "text-amber-500" : "text-foreground"}`}>{value || "—"}</p>
                  </div>
                ))}
              </div>

              {extractedData.directors?.length > 0 && (
                <div>
                  <h4 className="text-xs font-heading uppercase tracking-wider text-foreground/60 mb-2">Directors</h4>
                  <div className="space-y-2">
                    {extractedData.directors.map((d, i) => (
                      <div key={i} className="bg-muted/30 rounded-sm p-2 text-xs">
                        {d.name} {d.dob && `(DOB: ${d.dob})`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.trade_references?.length > 0 && (
                <div>
                  <h4 className="text-xs font-heading uppercase tracking-wider text-foreground/60 mb-2">Trade References</h4>
                  <div className="space-y-2">
                    {extractedData.trade_references.map((ref, i) => (
                      <div key={i} className="bg-muted/30 rounded-sm p-2 text-xs">
                        {ref.business_name} — {ref.contact}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-sm font-heading text-xs uppercase tracking-wider">
            Cancel
          </Button>
          {extractedData && (
            <Button
              onClick={handleSaveExtractedData}
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 text-black rounded-sm font-heading text-xs uppercase tracking-wider"
            >
              {saving ? "Saving..." : "Save to Profile"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}