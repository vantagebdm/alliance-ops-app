import { useRef, useState } from "react";
import { X, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreditAppPage1 from "./CreditAppPage1";
import CreditAppPage2 from "./CreditAppPage2";
import CreditAppPage34 from "./CreditAppPage34";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CreditAppPreview({ template, onClose }) {
  const printRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const pages = printRef.current.querySelectorAll(".pdf-page");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
    }

    pdf.save("APP_Credit_Account_Application.pdf");
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-[hsl(0,0%,4%)] px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/10">
        <div>
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-widest">Credit Account Application Pack — Preview</h2>
          <p className="text-white/40 text-xs font-heading uppercase tracking-wider mt-0.5">Alliance Priority Parts Pty. Ltd.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            {downloading ? "Generating PDF..." : "Download PDF"}
          </Button>
          <button onClick={onClose} className="text-white/50 hover:text-white ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-y-auto py-8 px-4 bg-[hsl(0,0%,12%)]">
        <div ref={printRef} className="mx-auto space-y-8 max-w-[794px]">
          <CreditAppPage1 template={template} />
          <CreditAppPage2 template={template} />
          <CreditAppPage34 template={template} />
        </div>
      </div>
    </div>
  );
}