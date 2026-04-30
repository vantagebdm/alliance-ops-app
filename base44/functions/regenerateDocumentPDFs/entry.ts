import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

const HEADER_COLOR = [0, 0, 0];
const TEXT_DARK = [30, 30, 30];
const TEXT_GRAY = [100, 100, 100];
const TEXT_LIGHT = [200, 200, 200];
const BG_LIGHT = [245, 245, 245];
const BG_HEADER = [240, 240, 240];

function getCompanyProfile() {
  return {
    trading_name: "Alliance Priority Parts",
    legal_name: "Alliance Priority Parts Pty Ltd",
    bank_name: "ANZ Bank",
    bank_bsb: "016-123",
    bank_account: "1234 5678",
    phone: "(08) 9144 1234",
    email: "info@allianceparts.com.au",
  };
}

function addFooter(doc, pageW) {
  const company = getCompanyProfile();
  const margin = 18;
  
  doc.setFillColor(BG_HEADER[0], BG_HEADER[1], BG_HEADER[2]);
  doc.rect(0, 282, pageW, 15, "F");
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  
  doc.text(company.trading_name || company.legal_name, margin, 286);
  doc.text(`${company.bank_name} | BSB: ${company.bank_bsb} | Account: ${company.bank_account}`, margin, 290);
  doc.text(company.phone, pageW - margin, 286, { align: "right" });
  doc.text(company.email, pageW - margin, 290, { align: "right" });
}

function addHeader(doc, pageW, title, docNumber) {
  const margin = 18;
  
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(0, 0, pageW, 28, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, 17);
  
  doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(docNumber, pageW - margin, 17, { align: "right" });
}

function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  addHeader(doc, pageW, "INVOICE", `Invoice #${invoice.invoice_number || ""}`);
  y = 38;

  const infoRows = [
    ["Customer:", invoice.customer_name || ""],
    invoice.company ? ["Company:", invoice.company] : null,
    ["Invoice Date:", invoice.invoice_date || ""],
    ["Due Date:", invoice.due_date || ""],
    invoice.customer_po_number ? ["PO Number:", invoice.customer_po_number] : null,
  ].filter(Boolean);

  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setTextColor(...TEXT_GRAY);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setTextColor(...TEXT_DARK);
    doc.setFont("helvetica", "normal");
    doc.text(String(val), margin + 34, y);
    y += 7;
  });
  y += 6;

  doc.setFillColor(...HEADER_COLOR);
  doc.rect(margin, y, pageW - margin * 2, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Part #", margin + 2, y + 6);
  doc.text("Description", margin + 30, y + 6);
  doc.text("Qty", margin + 100, y + 6, { align: "right" });
  doc.text("Unit Price", margin + 122, y + 6, { align: "right" });
  doc.text("Disc%", margin + 142, y + 6, { align: "right" });
  doc.text("Total", pageW - margin - 2, y + 6, { align: "right" });
  y += 11;

  doc.setFont("helvetica", "normal");
  (invoice.items || []).forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...BG_LIGHT);
      doc.rect(margin, y - 1, pageW - margin * 2, 8, "F");
    }
    doc.setTextColor(...TEXT_DARK);
    doc.setFontSize(8);
    doc.text(String(item.part_number || ""), margin + 2, y + 4.5);
    const desc = doc.splitTextToSize(String(item.description || ""), 66);
    doc.text(desc[0], margin + 30, y + 4.5);
    doc.text(String(Number(item.quantity || 0)), margin + 100, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.unit_price || 0).toFixed(2)}`, margin + 122, y + 4.5, { align: "right" });
    doc.text(`${Number(item.discount || 0)}%`, margin + 142, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.total || 0).toFixed(2)}`, pageW - margin - 2, y + 4.5, { align: "right" });
    y += 8;
    if (y > 260) { doc.addPage(); y = 20; }
  });

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  const totalsX = pageW - margin - 65;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.setTextColor(...TEXT_GRAY);
  doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`$${Number(invoice.subtotal || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 7;

  doc.setTextColor(...TEXT_GRAY);
  doc.text("GST (10%):", totalsX, y);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`$${Number(invoice.gst || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 5;

  doc.setDrawColor(180, 180, 180);
  doc.line(totalsX, y, pageW - margin, y);
  y += 6;

  doc.setFillColor(...HEADER_COLOR);
  doc.rect(totalsX - 4, y - 4, pageW - margin - totalsX + 4 + 4, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL DUE:", totalsX, y + 3);
  doc.text(`$${Number(invoice.total || 0).toFixed(2)}`, pageW - margin, y + 3, { align: "right" });

  if (invoice.customer_notes) {
    y += 14;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...TEXT_GRAY);
    doc.text(`Notes: ${invoice.customer_notes}`, margin, y);
  }

  addFooter(doc, pageW);
  return doc.output("blob");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { documentType = "invoices" } = await req.json().catch(() => ({}));

    let updated = 0;
    let failed = 0;

    if (documentType === "invoices" || documentType === "all") {
      const invoices = await base44.entities.Invoice.list(null, 500);
      for (const invoice of invoices) {
        try {
          const blob = generateInvoicePDF(invoice);
          const file = new File([blob], `Invoice-${invoice.invoice_number}.pdf`, { type: "application/pdf" });
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          await base44.entities.Invoice.update(invoice.id, { pdf_url: file_url });
          updated++;
        } catch (e) {
          console.error(`Failed to regenerate invoice ${invoice.invoice_number}:`, e.message);
          failed++;
        }
      }
    }

    return Response.json({
      success: true,
      updated,
      failed,
      message: `Regenerated ${updated} PDFs. ${failed} failed.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});