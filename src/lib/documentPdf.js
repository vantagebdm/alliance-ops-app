import { jsPDF } from "jspdf";
import { getLogo } from "@/lib/companyLogos";
import { getCompanyProfile } from "@/lib/companyDetails";

const HEADER_COLOR = [0, 0, 0]; // Black (#000000)
const TEXT_DARK = [30, 30, 30];
const TEXT_GRAY = [100, 100, 100];
const TEXT_LIGHT = [200, 200, 200];
const BG_LIGHT = [245, 245, 245];
const BG_HEADER = [240, 240, 240];

function addFooter(doc, pageW) {
  const company = getCompanyProfile();
  const margin = 18;
  
  // Footer background
  doc.setFillColor(BG_HEADER[0], BG_HEADER[1], BG_HEADER[2]);
  doc.rect(0, 282, pageW, 15, "F");
  
  // Company info and banking details
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  
  doc.text(company.trading_name || company.legal_name, margin, 286);
  doc.text(`${company.bank_name} | BSB: ${company.bank_bsb} | Account: ${company.bank_account}`, margin, 290);
  doc.text(company.phone, pageW - margin, 286, { align: "right" });
  doc.text(company.email, pageW - margin, 290, { align: "right" });
}

function addHeader(doc, pageW, title, docNumber, logoUrl) {
  const margin = 18;
  
  // Header bar - black
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(0, 0, pageW, 28, "F");
  
  // Logo
  if (logoUrl) {
    try { doc.addImage(logoUrl, "PNG", margin, 4, 40, 20, undefined, "FAST"); } catch (_) {}
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, logoUrl ? margin + 44 : margin, 17);
  
  doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(docNumber, pageW - margin, 17, { align: "right" });
}

export function generateQuotePDF(quote) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  const logoUrl = getLogo("quote_logo") || getLogo("company_logo");
  addHeader(doc, pageW, "QUOTE", `Quote #${quote.quote_number || ""}`, logoUrl);
  y = 38;

  const infoRows = [
    ["Customer:", quote.customer_name || ""],
    quote.company ? ["Company:", quote.company] : null,
    ["Status:", quote.status || ""],
    ["Valid Until:", quote.valid_until || ""],
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

  // Table header
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(margin, y, pageW - margin * 2, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Part #", margin + 2, y + 6);
  doc.text("Description", margin + 30, y + 6);
  doc.text("Qty", margin + 100, y + 6, { align: "right" });
  doc.text("Unit Price", margin + 122, y + 6, { align: "right" });
  doc.text("Total", pageW - margin - 2, y + 6, { align: "right" });
  y += 11;

  doc.setFont("helvetica", "normal");
  (quote.items || []).forEach((item, idx) => {
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
  doc.text(`$${Number(quote.subtotal || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 7;

  doc.setTextColor(...TEXT_GRAY);
  doc.text("GST (10%):", totalsX, y);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`$${Number(quote.gst || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 5;

  doc.setDrawColor(180, 180, 180);
  doc.line(totalsX, y, pageW - margin, y);
  y += 6;

  doc.setFillColor(...HEADER_COLOR);
  doc.rect(totalsX - 4, y - 4, pageW - margin - totalsX + 4 + 4, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL:", totalsX, y + 3);
  doc.text(`$${Number(quote.total || 0).toFixed(2)}`, pageW - margin, y + 3, { align: "right" });

  addFooter(doc, pageW);
  return doc.output("blob");
}

export function generateSalesOrderPDF(order) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  const logoUrl = getLogo("order_logo") || getLogo("company_logo");
  addHeader(doc, pageW, "SALES ORDER", `Order #${order.order_number || ""}`, logoUrl);
  y = 38;

  const infoRows = [
    ["Customer:", order.customer_name || ""],
    order.company ? ["Company:", order.company] : null,
    ["Status:", order.status || ""],
    ["Priority:", order.priority || ""],
    order.delivery_address ? ["Delivery:", order.delivery_address] : null,
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

  // Table header
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(margin, y, pageW - margin * 2, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Part #", margin + 2, y + 6);
  doc.text("Description", margin + 30, y + 6);
  doc.text("Qty", margin + 100, y + 6, { align: "right" });
  doc.text("Unit Price", margin + 122, y + 6, { align: "right" });
  doc.text("Total", pageW - margin - 2, y + 6, { align: "right" });
  y += 11;

  doc.setFont("helvetica", "normal");
  (order.items || []).forEach((item, idx) => {
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
  doc.text(`$${Number(order.subtotal || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 7;

  doc.setTextColor(...TEXT_GRAY);
  doc.text("GST (10%):", totalsX, y);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`$${Number(order.gst || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 5;

  doc.setDrawColor(180, 180, 180);
  doc.line(totalsX, y, pageW - margin, y);
  y += 6;

  doc.setFillColor(...HEADER_COLOR);
  doc.rect(totalsX - 4, y - 4, pageW - margin - totalsX + 4 + 4, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL:", totalsX, y + 3);
  doc.text(`$${Number(order.total || 0).toFixed(2)}`, pageW - margin, y + 3, { align: "right" });

  addFooter(doc, pageW);
  return doc.output("blob");
}

export function generatePurchaseOrderPDF(po) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  const logoUrl = getLogo("po_logo") || getLogo("company_logo");
  addHeader(doc, pageW, "PURCHASE ORDER", `PO #${po.po_number || ""}`, logoUrl);
  y = 38;

  const infoRows = [
    ["Supplier:", po.supplier_name || ""],
    ["Status:", po.status || ""],
    ["Expected Date:", po.expected_date || ""],
    po.reference ? ["Reference:", po.reference] : null,
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

  // Table header
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(margin, y, pageW - margin * 2, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Part #", margin + 2, y + 6);
  doc.text("Description", margin + 30, y + 6);
  doc.text("Qty", margin + 100, y + 6, { align: "right" });
  doc.text("Unit Cost", margin + 122, y + 6, { align: "right" });
  doc.text("Total", pageW - margin - 2, y + 6, { align: "right" });
  y += 11;

  doc.setFont("helvetica", "normal");
  (po.items || []).forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...BG_LIGHT);
      doc.rect(margin, y - 1, pageW - margin * 2, 8, "F");
    }
    doc.setTextColor(...TEXT_DARK);
    doc.setFontSize(8);
    doc.text(String(item.part_number || item.supplier_sku || ""), margin + 2, y + 4.5);
    const desc = doc.splitTextToSize(String(item.description || ""), 66);
    doc.text(desc[0], margin + 30, y + 4.5);
    doc.text(String(Number(item.quantity || 0)), margin + 100, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.unit_cost || 0).toFixed(2)}`, margin + 122, y + 4.5, { align: "right" });
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
  doc.text(`$${Number(po.subtotal || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 7;

  doc.setTextColor(...TEXT_GRAY);
  doc.text("GST (10%):", totalsX, y);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`$${Number(po.gst || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
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
  doc.text(`$${Number(po.total || 0).toFixed(2)}`, pageW - margin, y + 3, { align: "right" });

  addFooter(doc, pageW);
  return doc.output("blob");
}

export async function generateAndUploadQuotePDF(quote, base44) {
  const blob = generateQuotePDF(quote);
  const file = new File([blob], `Quote-${quote.quote_number || "QUOTE"}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

export async function generateAndUploadSalesOrderPDF(order, base44) {
  const blob = generateSalesOrderPDF(order);
  const file = new File([blob], `Order-${order.order_number || "ORDER"}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

export async function generateAndUploadPurchaseOrderPDF(po, base44) {
  const blob = generatePurchaseOrderPDF(po);
  const file = new File([blob], `PO-${po.po_number || "PO"}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}