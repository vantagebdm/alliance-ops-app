import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoicePdf";

const SAMPLE_INVOICE = {
  invoice_number: "INV-2026-001",
  customer_name: "ABC Manufacturing Pty Ltd",
  company: "Alliance Priority Parts",
  invoice_date: "2026-04-30",
  due_date: "2026-05-30",
  customer_po_number: "PO-12345",
  customer_notes: "Thank you for your business. Please remit payment to the account details shown in the footer.",
  items: [
    {
      part_number: "APP-ENG0001",
      description: "Complete Engine Gasket Set",
      quantity: 2,
      unit_price: 245.50,
      discount: 0,
      total: 491.00
    },
    {
      part_number: "APP-BRK0002",
      description: "Brake Pad Set (Front Axle)",
      quantity: 4,
      unit_price: 89.95,
      discount: 5,
      total: 342.20
    },
    {
      part_number: "APP-OIL0001",
      description: "Premium Engine Oil (20L)",
      quantity: 1,
      unit_price: 125.00,
      discount: 0,
      total: 125.00
    }
  ],
  subtotal: 958.20,
  gst: 95.82,
  total: 1054.02
};

export default function TestInvoicePDFGenerator() {
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const blob = generateInvoicePDF(SAMPLE_INVOICE);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      alert("Error generating PDF: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = generateInvoicePDF(SAMPLE_INVOICE);
      const file = new File([blob], `Test-Invoice-${SAMPLE_INVOICE.invoice_number}.pdf`, { type: "application/pdf" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Trigger download
      const a = document.createElement('a');
      a.href = file_url;
      a.download = `Test-Invoice-${SAMPLE_INVOICE.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Error downloading PDF: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <h3 className="font-heading text-sm font-bold uppercase tracking-wider mb-4">Test Invoice PDF Generator</h3>
      <p className="text-xs text-muted-foreground mb-6">
        Generate a sample invoice to preview the new standardized PDF format with black header, company branding, and banking details.
      </p>

      <div className="flex gap-3 mb-6">
        <Button
          onClick={handleGeneratePDF}
          disabled={generating}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-sm font-heading text-xs uppercase tracking-wider"
        >
          {generating ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-2" />
              Preview PDF
            </>
          )}
        </Button>

        <Button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="bg-green-600 text-white hover:bg-green-700 rounded-sm font-heading text-xs uppercase tracking-wider"
        >
          {downloading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-3 h-3 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {pdfUrl && (
        <div className="border border-border rounded-sm overflow-hidden bg-[hsl(0,0%,8%)]">
          <iframe
            src={pdfUrl}
            className="w-full"
            style={{ height: '600px' }}
            title="Invoice Preview"
          />
        </div>
      )}
    </div>
  );
}