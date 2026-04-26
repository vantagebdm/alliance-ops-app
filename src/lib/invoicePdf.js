import { jsPDF } from "jspdf";

export function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  // Header bar
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(74, 222, 128);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, 17);
  doc.setTextColor(180, 180, 180);
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

  doc.setFontSize(8);
  infoRows.forEach(([label, val]) => {
    doc.setTextColor(130, 130, 130); doc.text(label, margin, y);
    doc.setTextColor(220, 220, 220); doc.text(String(val), margin + 32, y);
    y += 6;
  });
  y += 4;

  // Table header
  doc.setFillColor(40, 40, 40);
  doc.rect(margin, y, pageW - margin * 2, 8, "F");
  doc.setTextColor(160, 160, 160);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Part #", margin + 2, y + 5.5);
  doc.text("Description", margin + 28, y + 5.5);
  doc.text("Qty", margin + 100, y + 5.5, { align: "right" });
  doc.text("Unit Price", margin + 122, y + 5.5, { align: "right" });
  doc.text("Disc%", margin + 142, y + 5.5, { align: "right" });
  doc.text("Total", pageW - margin - 2, y + 5.5, { align: "right" });
  y += 10;

  // Table rows
  doc.setFont("helvetica", "normal");
  (invoice.items || []).forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(22, 22, 22);
      doc.rect(margin, y - 1, pageW - margin * 2, 7, "F");
    }
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(7.5);
    doc.text(String(item.part_number || ""), margin + 2, y + 4.5);
    const desc = doc.splitTextToSize(String(item.description || ""), 68);
    doc.text(desc[0], margin + 28, y + 4.5);
    doc.text(String(Number(item.quantity || 0)), margin + 100, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.unit_price || 0).toFixed(2)}`, margin + 122, y + 4.5, { align: "right" });
    doc.text(`${Number(item.discount || 0)}%`, margin + 142, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.total || 0).toFixed(2)}`, pageW - margin - 2, y + 4.5, { align: "right" });
    y += 7;
    if (y > 260) { doc.addPage(); y = 20; }
  });

  y += 6;

  // Totals
  const totalsX = pageW - margin - 60;
  doc.setDrawColor(60, 60, 60);
  doc.line(totalsX, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130); doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(220, 220, 220); doc.text(`$${Number(invoice.subtotal || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 6;
  doc.setTextColor(130, 130, 130); doc.text("GST (10%):", totalsX, y);
  doc.setTextColor(220, 220, 220); doc.text(`$${Number(invoice.gst || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 6;
  doc.line(totalsX, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(74, 222, 128);
  doc.text("TOTAL DUE:", totalsX, y);
  doc.text(`$${Number(invoice.total || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 10;

  if (invoice.customer_notes) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(130, 130, 130);
    doc.text(`Notes: ${invoice.customer_notes}`, margin, y);
  }

  return doc.output("blob");
}

export async function generateAndUploadInvoicePDF(invoice, base44) {
  const blob = generateInvoicePDF(invoice);
  const file = new File([blob], `Invoice-${invoice.invoice_number || "INV"}.pdf`, { type: "application/pdf" });
  const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 604800 }); // 7 days
  return signed_url;
}

export function buildInvoiceEmailBody(invoice, pdfUrl) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#eee;padding:28px;border-radius:6px;">
  <h2 style="color:#4ade80;font-size:22px;margin:0 0 4px 0;">INVOICE</h2>
  <p style="color:#888;margin:0 0 20px 0;">Invoice #${invoice.invoice_number || ""}</p>
  <table style="width:100%;font-size:13px;margin-bottom:20px;">
    <tr><td style="color:#888;padding:4px 0;width:130px;">Customer:</td><td style="font-weight:bold;">${invoice.customer_name || ""}</td></tr>
    ${invoice.company ? `<tr><td style="color:#888;padding:4px 0;">Company:</td><td>${invoice.company}</td></tr>` : ""}
    <tr><td style="color:#888;padding:4px 0;">Invoice Date:</td><td>${invoice.invoice_date || ""}</td></tr>
    <tr><td style="color:#888;padding:4px 0;">Due Date:</td><td style="color:#fbbf24;font-weight:bold;">${invoice.due_date || ""}</td></tr>
    <tr><td style="color:#888;padding:4px 0;">Total Due:</td><td style="color:#4ade80;font-weight:bold;font-size:16px;">$${Number(invoice.total || 0).toFixed(2)}</td></tr>
  </table>
  <a href="${pdfUrl}" style="display:inline-block;background:#4ade80;color:#000;font-weight:bold;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:14px;margin-bottom:20px;">
    📄 Download Invoice PDF
  </a>
  ${invoice.customer_notes ? `<p style="font-size:12px;color:#aaa;margin-top:16px;">${invoice.customer_notes}</p>` : ""}
  <p style="font-size:11px;color:#555;margin-top:24px;border-top:1px solid #222;padding-top:12px;">This is an automated invoice email. Please do not reply.</p>
</div>`;
}