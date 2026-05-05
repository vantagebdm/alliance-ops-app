import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

// Company profile — kept in sync with lib/companyDetails.js defaults
function getCompanyProfile() {
  return {
    trading_name: "Alliance Priority Parts",
    legal_name: "Alliance Priority Parts Pty Ltd",
    abn: "33 697 061 279",
    reg_address: "3873 Pemeberton Way, Karratha Industrtial Estate 6714",
    phone: "0402 910 119",
    email: "info@allianceparts.com.au",
    website: "www.allianceparts.com.au",
    bank_name: "ANZ Bank",
    bank_bsb: "016-123",
    bank_account: "1234 5678",
    bank_account_name: "Alliance Priority Parts Pty Ltd",
  };
}

function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 14;
  const company = getCompanyProfile();

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  // ── HEADER BAR (black) ────────────────────────────────────────────────
  const headerH = 14;
  const logoAreaH = 32; // space above header bar
  const headerTop = logoAreaH;

  doc.setFillColor(0, 0, 0);
  doc.rect(0, headerTop, pageW, headerH, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, headerTop + 9.5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(210, 210, 210);
  doc.text(`Invoice #${invoice.invoice_number || ""}`, pageW - margin, headerTop + 9.5, { align: "right" });

  // ── COMPANY CONTACT BLOCK (top right) ────────────────────────────────
  const compBoxX = 110;
  const compBoxY = 6;
  const compBoxW = pageW - compBoxX - margin;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  let cbY = compBoxY + 4;

  const compName = company.trading_name || company.legal_name || "";
  doc.text(compName, compBoxX + compBoxW / 2, cbY, { align: "center" });
  cbY += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  if (company.reg_address) {
    const addrLines = doc.splitTextToSize(company.reg_address, compBoxW);
    addrLines.forEach(line => {
      doc.text(line, compBoxX + compBoxW / 2, cbY, { align: "center" });
      cbY += 3.6;
    });
  }
  if (company.phone) { doc.text(`Ph: ${company.phone}`, compBoxX + compBoxW / 2, cbY, { align: "center" }); cbY += 3.6; }
  if (company.email) { doc.text(`Email: ${company.email}`, compBoxX + compBoxW / 2, cbY, { align: "center" }); cbY += 3.6; }
  if (company.website) { doc.text(company.website, compBoxX + compBoxW / 2, cbY, { align: "center" }); cbY += 3.6; }
  if (company.abn) {
    doc.setFont("helvetica", "bold");
    doc.text(`ABN: ${company.abn}`, compBoxX + compBoxW / 2, cbY, { align: "center" });
  }

  // ── CUSTOMER INFO BLOCK ───────────────────────────────────────────────
  let y = headerTop + headerH + 8;
  const invoiceDate = invoice.invoice_date || (invoice.created_date ? invoice.created_date.split("T")[0] : "");

  const infoRows = [
    ["Customer:", invoice.customer_name || ""],
    invoice.company ? ["Company:", invoice.company] : null,
    ["Invoice Date:", invoiceDate],
    ["Due Date:", invoice.due_date || ""],
    (invoice.customer_po_number || invoice.po_number) ? ["Customer PO:", invoice.customer_po_number || invoice.po_number] : null,
    invoice.sales_order_reference ? ["Order Ref:", invoice.sales_order_reference] : null,
  ].filter(Boolean);

  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(String(val), margin + 32, y);
    y += 7;
  });

  y = Math.max(y, cbY + 4) + 6;

  // ── TABLE HEADER ──────────────────────────────────────────────────────
  doc.setFillColor(0, 0, 0);
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

  // ── TABLE ROWS ────────────────────────────────────────────────────────
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
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  // ── TOTALS ────────────────────────────────────────────────────────────
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

  doc.setFillColor(0, 0, 0);
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

  // ── FOOTER ────────────────────────────────────────────────────────────
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 282, pageW, 15, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);

  const footerLine1 = `${company.trading_name || company.legal_name} | ABN: ${company.abn}`;
  const footerLine2 = `${company.bank_name} | BSB: ${company.bank_bsb} | Acct: ${company.bank_account} | ${company.bank_account_name}`;
  doc.text(footerLine1, pageW / 2, 286, { align: "center" });
  doc.text(footerLine2, pageW / 2, 290, { align: "center" });
  doc.text(company.phone || "", margin, 294);
  doc.text(company.email || "", pageW - margin, 294, { align: "right" });

  return doc.output("blob");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const invoices = await base44.asServiceRole.entities.Invoice.list(null, 500);
    let updated = 0;
    let failed = 0;

    for (const invoice of invoices) {
      try {
        const blob = generateInvoicePDF(invoice);
        const file = new File([blob], `Invoice-${invoice.invoice_number}.pdf`, { type: "application/pdf" });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.asServiceRole.entities.Invoice.update(invoice.id, { pdf_url: file_url });
        updated++;
      } catch (e) {
        console.error(`Failed to regenerate invoice ${invoice.invoice_number}:`, e.message);
        failed++;
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