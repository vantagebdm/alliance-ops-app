import { useRef, useState, useEffect } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupplierAppPage1 from "./SupplierAppPage1";
import SupplierAppPage2 from "./SupplierAppPage2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const LOGO_URL = "https://media.base44.com/images/public/69dccee2e4380f803487afa5/d6f3ce989_image.png";

export default function SupplierAppPreview({ onClose }) {
  const printRef = useRef();
  const [downloading, setDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoLoading, setLogoLoading] = useState(true);
  const [pdfError, setPdfError] = useState("");

  // Preload logo as a data URL so html2canvas renders it without CORS taint
  useEffect(() => {
    let active = true;
    fetch(LOGO_URL)
      .then(r => r.blob())
      .then(b => {
        const reader = new FileReader();
        reader.onloadend = () => { if (active) { setLogoDataUrl(reader.result); setLogoLoading(false); } };
        reader.readAsDataURL(b);
      })
      .catch(() => { if (active) setLogoLoading(false); });
    return () => { active = false; };
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    setPdfError("");
    try {
      const pages = printRef.current.querySelectorAll(".pdf-page");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 0,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
      }

      pdf.save("APP_Supplier_Account_Application.pdf");
    } catch (err) {
      setPdfError("PDF generation failed — use your browser's Print → Save as PDF instead.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-[hsl(0,0%,4%)] px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/10">
        <div>
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-widest">Supplier Account Application — Preview</h2>
          <p className="text-white/40 text-xs font-heading uppercase tracking-wider mt-0.5">Alliance Priority Parts Pty. Ltd.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading || logoLoading}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
          >
            {downloading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...</>
              : logoLoading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Loading logo...</>
              : <><Download className="w-4 h-4 mr-1" /> Download PDF</>}
          </Button>
          <button onClick={onClose} className="text-white/50 hover:text-white ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {pdfError && (
        <div className="bg-destructive/20 border-b border-destructive/40 px-6 py-2 text-destructive text-xs text-center">{pdfError}</div>
      )}

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-y-auto py-8 px-4 bg-[hsl(0,0%,12%)]">
        <div ref={printRef} className="mx-auto space-y-8 max-w-[794px]">
          <SupplierAppPage1 logoUrl={logoDataUrl || LOGO_URL} />
          <SupplierAppPage2 logoUrl={logoDataUrl || LOGO_URL} />
        </div>
      </div>
    </div>
  );
}