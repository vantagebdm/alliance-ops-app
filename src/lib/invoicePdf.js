import { jsPDF } from "jspdf";
import { getLogo } from "@/lib/companyLogos";

export function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  // Header bar - dark grey
  doc.setFillColor(40, 40, 40);
  doc.rect(0, 0, pageW, 28, "F");

  // Logo (invoice logo preferred, fallback to company logo)
  const logoUrl = getLogo("invoice_logo") || getLogo("company_logo");
  if (logoUrl) {
    try { doc.addImage(logoUrl, "PNG", margin, 4, 40, 20, undefined, "FAST"); } catch (_) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", logoUrl ? margin + 44 : margin, 17);
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #${invoice.invoice_number || ""}`, pageW - margin, 17, { align: "right" });
  y = 38;

  // Info block
  const infoRows = [
    ["Customer:", invoice.customer_name || ""],
    invoice.company ? ["Company:", invoice.company] : null,
    ["Invoice Date:", invoice.invoice_date || ""],
    ["Due Date:", invoice.due_date || ""],
    invoice.customer_po_number ? ["PO Number:", invoice.customer_po_number] : null,
  ].filter(Boolean);

  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.text(String(val), margin + 34, y);
    y += 7;
  });
  y += 6;

  // Table header
  doc.setFillColor(40, 40, 40);
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

  // Table rows
  doc.setFont("helvetica", "normal");
  (invoice.items || []).forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y - 1, pageW - margin * 2, 8, "F");
    }
    doc.setTextColor(30, 30, 30);
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

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  // Totals
  const totalsX = pageW - margin - 65;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(30, 30, 30);
  doc.text(`$${Number(invoice.subtotal || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 7;

  doc.setTextColor(100, 100, 100);
  doc.text("GST (10%):", totalsX, y);
  doc.setTextColor(30, 30, 30);
  doc.text(`$${Number(invoice.gst || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 5;

  doc.setDrawColor(180, 180, 180);
  doc.line(totalsX, y, pageW - margin, y);
  y += 6;

  // Total row - dark grey background
  doc.setFillColor(40, 40, 40);
  doc.rect(totalsX - 4, y - 4, pageW - margin - totalsX + 4 + 4, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL DUE:", totalsX, y + 3);
  doc.text(`$${Number(invoice.total || 0).toFixed(2)}`, pageW - margin, y + 3, { align: "right" });
  y += 14;

  if (invoice.customer_notes) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Notes: ${invoice.customer_notes}`, margin, y);
  }

  // Footer
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 282, pageW, 15, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("This is an automated invoice. Please contact us if you have any queries.", pageW / 2, 290, { align: "center" });

  return doc.output("blob");
}

export async function generateAndUploadInvoicePDF(invoice, base44) {
  const blob = generateInvoicePDF(invoice);
  const file = new File([blob], `Invoice-${invoice.invoice_number || "INV"}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

export function buildInvoiceEmailBody(invoice, pdfUrl) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#111111;padding:0;border-radius:6px;border:1px solid #e0e0e0;">
  <div style="background:#282828;padding:24px 28px;border-radius:6px 6px 0 0;">
    <h2 style="color:#ffffff;font-size:22px;margin:0 0 4px 0;">INVOICE</h2>
    <p style="color:#cccccc;margin:0;">Invoice #${invoice.invoice_number || ""}</p>
  </div>
  <div style="padding:24px 28px;">
    <table style="width:100%;font-size:14px;margin-bottom:24px;border-collapse:collapse;">
      <tr><td style="color:#666;padding:5px 0;width:140px;">Customer:</td><td style="color:#111;font-weight:bold;">${invoice.customer_name || ""}</td></tr>
      ${invoice.company ? `<tr><td style="color:#666;padding:5px 0;">Company:</td><td style="color:#111;">${invoice.company}</td></tr>` : ""}
      <tr><td style="color:#666;padding:5px 0;">Invoice Date:</td><td style="color:#111;">${invoice.invoice_date || ""}</td></tr>
      <tr><td style="color:#666;padding:5px 0;">Due Date:</td><td style="color:#b45309;font-weight:bold;">${invoice.due_date || ""}</td></tr>
      <tr><td style="color:#666;padding:5px 0;">Total Due:</td><td style="color:#282828;font-weight:bold;font-size:18px;">$${Number(invoice.total || 0).toFixed(2)}</td></tr>
    </table>
    <p style="color:#444;font-size:13px;">Please find your invoice attached as a PDF to this email.</p>
    ${invoice.customer_notes ? `<p style="font-size:12px;color:#888;margin-top:16px;border-top:1px solid #eee;padding-top:12px;">${invoice.customer_notes}</p>` : ""}
    <p style="font-size:11px;color:#aaa;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">This is an automated invoice email. Please do not reply directly to this message.</p>
  </div>
</div>`;
}