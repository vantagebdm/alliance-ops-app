import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PDFUploadExtract({ onExtracted }) {
  const [status, setStatus] = useState("idle"); // idle | uploading | extracting | done | error
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      setErrorMsg("Please upload a PDF file.");
      setStatus("error");
      return;
    }
    setFileName(file.name);
    setStatus("uploading");
    setErrorMsg("");

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    setStatus("extracting");

    const schema = {
      type: "object",
      properties: {
        customer_type: { type: "string" },
        name: { type: "string" },
        trading_name: { type: "string" },
        physical_address_1: { type: "string" },
        physical_address_2: { type: "string" },
        physical_state: { type: "string" },
        physical_postcode: { type: "string" },
        billing_address_1: { type: "string" },
        billing_address_2: { type: "string" },
        billing_state: { type: "string" },
        billing_postcode: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        fax: { type: "string" },
        mobile: { type: "string" },
        abn: { type: "string" },
        acn: { type: "string" },
        date_established: { type: "string" },
        nature_of_business: { type: "string" },
        paid_up_capital: { type: "string" },
        estimated_monthly_purchases: { type: "string" },
        credit_limit_required: { type: "string" },
        premises_type: { type: "string" },
        directors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              full_name: { type: "string" },
              dob: { type: "string" },
              address_1: { type: "string" },
              address_2: { type: "string" },
              state: { type: "string" },
              postcode: { type: "string" },
              licence_number: { type: "string" },
              phone: { type: "string" },
              mobile: { type: "string" }
            }
          }
        },
        account_terms: { type: "string" },
        po_required: { type: "boolean" },
        accounts_emailed: { type: "boolean" },
        accounts_email: { type: "string" },
        accounts_contact_name: { type: "string" },
        accounts_contact_phone: { type: "string" },
        bank_branch: { type: "string" },
        bank_account_number: { type: "string" },
        trade_references: {
          type: "array",
          items: {
            type: "object",
            properties: {
              business_name: { type: "string" },
              address: { type: "string" },
              contact: { type: "string" }
            }
          }
        }
      }
    };

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: schema
    });

    if (result.status !== "success") {
      setStatus("error");
      setErrorMsg(result.details || "Extraction failed.");
      return;
    }

    setStatus("done");
    onExtracted(result.output, file_url);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => status === "idle" || status === "error" ? fileRef.current.click() : null}
        className={`border-2 border-dashed rounded-sm p-10 text-center transition-colors cursor-pointer ${
          status === "done" ? "border-primary/50 bg-primary/5" :
          status === "error" ? "border-red-400/50 bg-red-50" :
          "border-border hover:border-primary/40 hover:bg-primary/5"
        }`}
      >
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />

        {status === "idle" && (
          <>
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-heading text-sm uppercase tracking-wider text-foreground/70 mb-1">Upload Credit Application PDF</p>
            <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
          </>
        )}

        {status === "uploading" && (
          <>
            <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-3" />
            <p className="font-heading text-sm uppercase tracking-wider text-foreground/70">Uploading {fileName}...</p>
          </>
        )}

        {status === "extracting" && (
          <>
            <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-3" />
            <p className="font-heading text-sm uppercase tracking-wider text-foreground/70">Extracting data from PDF...</p>
            <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle className="w-10 h-10 mx-auto text-primary mb-3" />
            <p className="font-heading text-sm uppercase tracking-wider text-primary mb-1">Extraction Complete</p>
            <p className="text-xs text-muted-foreground">{fileName} — Review and confirm the extracted data below</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
            <p className="font-heading text-sm uppercase tracking-wider text-red-600 mb-1">Upload Failed</p>
            <p className="text-xs text-red-500">{errorMsg}</p>
            <p className="text-xs text-muted-foreground mt-2">Click to try again</p>
          </>
        )}
      </div>

      {status === "done" && (
        <div className="bg-primary/10 border border-primary/30 rounded-sm px-4 py-3 flex items-start gap-3">
          <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-heading text-xs uppercase tracking-wider text-primary mb-0.5">Extraction Review Required</p>
            <p className="text-xs text-foreground/70">Extracted fields are highlighted in green. Please review all values, correct any errors, and complete any missing fields before saving.</p>
          </div>
        </div>
      )}
    </div>
  );
}