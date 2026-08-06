import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import { getLogo, syncLogosFromDB } from "@/lib/companyLogos";
import { getCompanyProfile } from "@/lib/companyDetails";
import { STANDARD_TERMS } from "@/lib/proposalTerms";

const HEADER_COLOR = [0, 0, 0]; // Black (#000000)
const TEXT_DARK = [30, 30, 30];
const TEXT_GRAY = [100, 100, 100];
const TEXT_LIGHT = [200, 200, 200];
const BG_LIGHT = [245, 245, 245];
const BG_HEADER = [240, 240, 240];

// Branded proposal-pack template. Generated proposal content pages are inserted
// between page 2 and page 3 of this template before output.
const PROPOSAL_TEMPLATE_URL = "https://media.base44.com/files/public/69dccee2e4380f803487afa5/a2a047c3d_UntitledA4.pdf";
const CREDIT_APP_URL = "https://media.base44.com/files/public/69dccee2e4380f803487afa5/fb10a183d_APP_Credit_Account_Application5.pdf";

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

  // White area for logo above the black banner
  const logoAreaH = logoUrl ? 30 : 0;

  // Logo — centred above the banner
  if (logoUrl) {
    const logoH = 22;
    const logoW = 50;
    try {
      doc.addImage(logoUrl, "PNG", (pageW - logoW) / 2, 4, logoW, logoH, undefined, "FAST");
    } catch (_) {}
  }

  // Black header banner — sits below logo area
  const bannerTop = logoAreaH;
  const bannerH = 14;
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(0, bannerTop, pageW, bannerH, "F");

  // Title — left of banner
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, bannerTop + 9.5);

  // Doc number — right of banner
  doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(docNumber, pageW - margin, bannerTop + 9.5, { align: "right" });

  return bannerTop + bannerH; // return content start Y
}

export function generateQuotePDF(quote) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  const logoUrl = getLogo("quote_logo") || getLogo("company_logo");
  y = addHeader(doc, pageW, "QUOTE", `Quote #${quote.quote_number || ""}`, logoUrl) + 10;

  const infoRows = [
    ["Customer:", quote.customer_name || ""],
    quote.company ? ["Company:", quote.company] : null,
    ["Status:", quote.status || ""],
    ["Valid Until:", quote.valid_until || ""],
  ].filter(Boolean);

  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
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
    doc.text(String(item.app_part_number || item.part_number || ""), margin + 2, y + 4.5);
    const desc = doc.splitTextToSize(String(item.description || ""), 66);
    doc.text(desc[0], margin + 30, y + 4.5);
    doc.text(String(Number(item.quantity || 0)), margin + 100, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.unit_price || 0).toFixed(2)}`, margin + 122, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.total || 0).toFixed(2)}`, pageW - margin - 2, y + 4.5, { align: "right" });
    y += 8;

    // ETA line under the item if provided
    if (item.eta_days || item.eta_comment) {
      const etaParts = [];
      if (item.eta_days) etaParts.push(`ETA: ${item.eta_days} days`);
      if (item.eta_comment) etaParts.push(item.eta_comment);
      const etaText = etaParts.join(" — ");
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      doc.text(etaText, margin + 30, y + 3);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT_DARK);
      doc.setFontSize(8);
      y += 5;
    }

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

// Proposal PDF — matches the quote layout but with no part-number column and
// includes the full documented terms, client/trade info, items and quantities.
function buildProposalContentDoc(proposal) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  const logoUrl = getLogo("quote_logo") || getLogo("company_logo");
  y = addHeader(doc, pageW, "PROPOSAL", `Proposal #${proposal.proposal_number || ""}`, logoUrl) + 10;

  const ptLabel = { retail: "Retail", trade_business: "Trade Business", commercial: "Commercial" }[proposal.proposal_type] || "—";
  const ttLabel = { cod: "COD", "14_days": "14 Days", "30_days": "30 Days", "30_days_plus": "30 Days Plus" }[proposal.trading_terms] || "—";
  const infoRows = [
    ["Client:", proposal.customer_name || ""],
    proposal.customer_company ? ["Company:", proposal.customer_company] : null,
    proposal.trade_company ? ["Trade Company:", proposal.trade_company] : null,
    proposal.client_number ? ["Client No.:", proposal.client_number] : null,
    proposal.customer_email ? ["Email:", proposal.customer_email] : null,
    ["Existing Customer:", proposal.current_customer === "yes" ? "Yes" : "No"],
    proposal.best_contact ? ["Best Contact:", proposal.best_contact] : null,
    proposal.best_contact_phone ? ["Phone:", proposal.best_contact_phone] : null,
    proposal.best_contact_email ? ["Best Email:", proposal.best_contact_email] : null,
    ["Proposal Type:", ptLabel],
    ["Trading Terms:", ttLabel],
  ].filter(Boolean);

  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(doc.splitTextToSize(String(val), 120), margin + 42, y);
    y += 6;
  });
  y += 4;

  // Items table — NO part number column
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(margin, y, pageW - margin * 2, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin + 2, y + 6);
  doc.text("Qty", margin + 112, y + 6, { align: "right" });
  doc.text("Unit Price", margin + 142, y + 6, { align: "right" });
  doc.text("Total", pageW - margin - 2, y + 6, { align: "right" });
  y += 11;

  doc.setFont("helvetica", "normal");
  (proposal.items || []).forEach((item, idx) => {
    if (y > 250) { doc.addPage(); y = 20; }
    if (idx % 2 === 0) {
      doc.setFillColor(...BG_LIGHT);
      doc.rect(margin, y - 1, pageW - margin * 2, 8, "F");
    }
    doc.setTextColor(...TEXT_DARK);
    doc.setFontSize(8);
    const desc = doc.splitTextToSize(String(item.description || ""), 104);
    doc.text(desc, margin + 2, y + 4.5);
    doc.text(String(Number(item.quantity || 0)), margin + 112, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.unit_price || 0).toFixed(2)}`, margin + 142, y + 4.5, { align: "right" });
    doc.text(`$${Number(item.total || 0).toFixed(2)}`, pageW - margin - 2, y + 4.5, { align: "right" });
    y += 8;
  });

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  const totalsX = pageW - margin - 65;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GRAY);
  doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`$${Number(proposal.subtotal || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 7;
  doc.setTextColor(...TEXT_GRAY);
  doc.text("GST (10%):", totalsX, y);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`$${Number(proposal.gst || 0).toFixed(2)}`, pageW - margin, y, { align: "right" });
  y += 5;
  doc.setDrawColor(180, 180, 180);
  doc.line(totalsX, y, pageW - margin, y);
  y += 6;
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(totalsX - 4, y - 4, pageW - margin - totalsX + 8, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL:", totalsX, y + 3);
  doc.text(`$${Number(proposal.total || 0).toFixed(2)}`, pageW - margin, y + 3, { align: "right" });
  y += 14;

  // Terms & Conditions
  const drawHeading = (t) => {
    if (y > 272) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_DARK);
    doc.text(t, margin, y);
    y += 5;
  };
  const drawPara = (t) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(t, pageW - margin * 2);
    lines.forEach((ln) => {
      if (y > 282) { doc.addPage(); y = 20; }
      doc.text(ln, margin, y);
      y += 4.5;
    });
  };

  drawHeading("Terms & Conditions");
  const tcLines = [];
  if (proposal.deposit_required) tcLines.push(`${proposal.deposit_pct}% deposit required on order.`);
  if (proposal.balance_terms) tcLines.push(`Balance: ${proposal.balance_terms}.`);
  tcLines.push(`Valid for ${proposal.validity_days} days from issue.`);
  if (proposal.conditions_text) tcLines.push(proposal.conditions_text);
  tcLines.forEach((l) => drawPara("•  " + l));
  y += 2;

  (proposal.standard_terms || []).forEach((key) => {
    const set = STANDARD_TERMS[key];
    if (!set) return;
    y += 3;
    drawHeading(set.label);
    set.text.split("\n\n").forEach((p) => drawPara(p));
  });

  addFooter(doc, pageW);
  return doc;
}

// Builds the final proposal PDF by rendering content pages (jsPDF) then inserting
// them between page 2 and page 3 of the branded template (pdf-lib merge).
export async function generateProposalPDF(proposal) {
  const contentDoc = buildProposalContentDoc(proposal);
  const contentBytes = contentDoc.output("arraybuffer");

  try {
    const [templateRes, creditRes] = await Promise.all([
      fetch(PROPOSAL_TEMPLATE_URL, { cache: "force-cache" }),
      fetch(CREDIT_APP_URL, { cache: "force-cache" }),
    ]);
    if (!templateRes.ok) throw new Error("template fetch failed");
    const [templateBytes, creditBytes] = await Promise.all([
      templateRes.arrayBuffer(),
      creditRes.ok ? creditRes.arrayBuffer() : null,
    ]);

    const templatePdf = await PDFDocument.load(templateBytes);
    const contentPdf = await PDFDocument.load(contentBytes);
    const out = await PDFDocument.create();

    const tplCount = templatePdf.getPageCount();
    const beforeCount = Math.min(2, Math.max(0, tplCount - 1));

    // Template pages 1 & 2
    const beforePages = await out.copyPages(templatePdf, Array.from({ length: beforeCount }, (_, i) => i));
    beforePages.forEach((p) => out.addPage(p));

    // Generated proposal content pages
    const contentPages = await out.copyPages(contentPdf, contentPdf.getPageIndices());
    contentPages.forEach((p) => out.addPage(p));

    // Credit account application pages
    if (creditBytes) {
      const creditPdf = await PDFDocument.load(creditBytes);
      const creditPages = await out.copyPages(creditPdf, creditPdf.getPageIndices());
      creditPages.forEach((p) => out.addPage(p));
    }

    // Remaining template pages (page 3 onwards — contact/back page)
    if (tplCount > beforeCount) {
      const afterPages = await out.copyPages(templatePdf, Array.from({ length: tplCount - beforeCount }, (_, i) => i + beforeCount));
      afterPages.forEach((p) => out.addPage(p));
    }

    const finalBytes = await out.save();
    return new Blob([finalBytes], { type: "application/pdf" });
  } catch (e) {
    // Fallback: content-only PDF if template can't be loaded
    return contentDoc.output("blob");
  }
}

// Blank A4 trading application form — downloadable from the proposal generator.
export function generateTradingAppPDF() {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  const logoUrl = getLogo("company_logo");
  y = addHeader(doc, pageW, "TRADING APPLICATION", "Form TA-01", logoUrl) + 12;

  const section = (title) => {
    doc.setFillColor(...HEADER_COLOR);
    doc.rect(margin, y, pageW - margin * 2, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 2, y + 5);
    y += 7;
  };
  const field = (label, lineW) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(label, margin, y);
    doc.setDrawColor(160, 160, 160);
    const lblW = (label.length * 2.2) + 2;
    doc.line(margin + lblW, y - 0.5, margin + lblW + lineW, y - 0.5);
    y += 6;
  };
  const gap = (h = 4) => { y += h; };

  section("1. BUSINESS DETAILS");
  field("Legal / Company Name", 110);
  field("Trading Name", 110);
  field("ABN", 70); gap();
  field("ACN", 70); field("Date Established", 60);
  field("Nature of Business", 110);
  gap();

  section("2. ADDRESS");
  field("Street Address", 110);
  field("Suburb", 70); field("State", 30); field("Postcode", 25);
  field("Postal Address (if different)", 110);
  gap();

  section("3. CONTACT DETAILS");
  field("Contact Person", 110);
  field("Position", 70); field("Phone", 60);
  field("Mobile", 70); field("Email", 70);
  field("Accounts Contact", 90); field("Accounts Email", 70);
  gap();

  section("4. ACCOUNT / PAYMENT DETAILS");
  field("Requested Account Terms", 110);
  field("Credit Limit Requested ($)", 70);

  const bank = getCompanyProfile();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Please direct all payments to:", margin, y);
  y += 6;

  const filledField = (label, value, labelW, lineW) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(String(value ?? ""), margin + labelW, y);
    doc.setDrawColor(160, 160, 160);
    doc.line(margin + labelW, y + 1, margin + labelW + lineW, y + 1);
    y += 6;
  };

  filledField("Bank", bank.bank_name, 24, 110);
  filledField("Account Name", bank.bank_account_name, 38, 100);
  filledField("BSB", bank.bank_bsb, 14, 50);
  filledField("Account No.", bank.bank_account, 28, 60);
  filledField("Remittance Email", bank.remittance_email, 50, 90);
  gap();

  section("5. TRADE REFERENCES (1)");
  field("Ref 1 — Business", 110);
  field("Contact", 70); field("Phone", 60);
  gap(2);
  field("Ref 2 — Business", 110);
  field("Contact", 70); field("Phone", 60);
  gap();

  section("6. DECLARATION");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const decl = doc.splitTextToSize("I/We declare that the information provided in this application is true and correct and authorise Alliance Priority Parts to make any enquiries necessary to verify the details. I/We have read and agree to the trading terms and conditions applicable to this account.", pageW - margin * 2);
  doc.text(decl, margin, y + 3);
  y += 16;
  field("Name", 90); gap();
  field("Position", 90); gap();
  field("Signature", 90); field("Date", 40);

  addFooter(doc, pageW);
  return doc;
}

export function generateSalesOrderPDF(order) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  const logoUrl = getLogo("order_logo") || getLogo("company_logo");
  y = addHeader(doc, pageW, "SALES ORDER", `Order #${order.order_number || ""}`, logoUrl) + 10;

  const infoRows = [
    ["Customer:", order.customer_name || ""],
    order.company ? ["Company:", order.company] : null,
    ["Status:", order.status || ""],
    ["Priority:", order.priority || ""],
    order.delivery_address ? ["Delivery:", order.delivery_address] : null,
  ].filter(Boolean);

  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
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
    doc.text(String(item.app_part_number || item.part_number || ""), margin + 2, y + 4.5);
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
  y = addHeader(doc, pageW, "PURCHASE ORDER", `PO #${po.po_number || ""}`, logoUrl) + 10;

  const infoRows = [
    ["Supplier:", po.supplier_name || ""],
    ["Status:", po.status || ""],
    ["Expected Date:", po.expected_date || ""],
    po.reference ? ["Reference:", po.reference] : null,
  ].filter(Boolean);

  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
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

export function generateDispatchPDF(dispatch) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");

  const logoUrl = getLogo("dispatch_logo") || getLogo("company_logo");
  y = addHeader(doc, pageW, "DISPATCH DOCKET", `Dispatch #${dispatch.dispatch_number || ""}`, logoUrl) + 10;

  const infoRows = [
    ["Customer:", dispatch.customer_name || ""],
    dispatch.order_number ? ["Order #:", dispatch.order_number] : null,
    dispatch.customer_po_number ? ["Customer PO:", dispatch.customer_po_number] : null,
    ["Dispatch Date:", dispatch.dispatch_date || ""],
    ["Method:", dispatch.method || ""],
    ["Priority:", dispatch.priority || ""],
    dispatch.delivery_address ? ["Delivery To:", dispatch.delivery_address] : null,
    dispatch.freight_company ? ["Freight Co:", dispatch.freight_company] : null,
    dispatch.consignment_number ? ["Consignment:", dispatch.consignment_number] : null,
  ].filter(Boolean);

  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
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
  doc.text("Description", margin + 35, y + 6);
  doc.text("Ordered", margin + 105, y + 6, { align: "right" });
  doc.text("Dispatched", margin + 130, y + 6, { align: "right" });
  doc.text("Backorder", pageW - margin - 2, y + 6, { align: "right" });
  y += 11;

  doc.setFont("helvetica", "normal");
  (dispatch.items || []).forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...BG_LIGHT);
      doc.rect(margin, y - 1, pageW - margin * 2, 8, "F");
    }
    doc.setTextColor(...TEXT_DARK);
    doc.setFontSize(8);
    doc.text(String(item.part_number || ""), margin + 2, y + 4.5);
    const desc = doc.splitTextToSize(String(item.description || ""), 68);
    doc.text(desc[0], margin + 35, y + 4.5);
    doc.text(String(Number(item.ordered_qty || 0)), margin + 105, y + 4.5, { align: "right" });
    doc.text(String(Number(item.dispatch_qty || 0)), margin + 130, y + 4.5, { align: "right" });
    const bo = Number(item.remaining_qty || 0);
    doc.setTextColor(bo > 0 ? 180 : 80, bo > 0 ? 100 : 120, bo > 0 ? 0 : 80);
    doc.text(bo > 0 ? `BO: ${bo}` : "—", pageW - margin - 2, y + 4.5, { align: "right" });
    doc.setTextColor(...TEXT_DARK);
    y += 8;
    if (y > 260) { doc.addPage(); y = 20; }
  });

  y += 8;
  if (dispatch.customer_notes) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Notes: ${dispatch.customer_notes}`, margin, y);
    y += 8;
  }

  // Signature line
  y += 4;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, margin + 70, y);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Received by (signature)", margin, y + 4);
  doc.line(margin + 90, y, margin + 160, y);
  doc.text("Date received", margin + 90, y + 4);

  addFooter(doc, pageW);
  return doc.output("blob");
}

async function enrichQuoteItems(quote, base44) {
  const needsLookup = (quote.items || []).some(i => !i.app_part_number && i.part_number);
  if (!needsLookup) return quote;
  const parts = await base44.entities.Part.list(null, 1000);
  const enrichedItems = (quote.items || []).map(item => {
    if (item.app_part_number) return item;
    const match = parts.find(p =>
      p.part_number === item.part_number ||
      p.supplier_sku === item.part_number ||
      p.app_part_number === item.part_number
    );
    return match ? { ...item, app_part_number: match.app_part_number || item.part_number } : item;
  });
  return { ...quote, items: enrichedItems };
}

export async function generateAndUploadQuotePDF(quote, base44) {
  await syncLogosFromDB();
  const enrichedQuote = await enrichQuoteItems(quote, base44);
  const blob = generateQuotePDF(enrichedQuote);
  const file = new File([blob], `Quote-${quote.quote_number || "QUOTE"}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

export async function generateAndUploadSalesOrderPDF(order, base44) {
  await syncLogosFromDB();
  const blob = generateSalesOrderPDF(order);
  const file = new File([blob], `Order-${order.order_number || "ORDER"}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

export async function generateAndUploadPurchaseOrderPDF(po, base44) {
  await syncLogosFromDB();
  const blob = generatePurchaseOrderPDF(po);
  const file = new File([blob], `PO-${po.po_number || "PO"}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

export async function generateAndUploadDispatchPDF(dispatch, base44) {
  await syncLogosFromDB();
  const blob = generateDispatchPDF(dispatch);
  const file = new File([blob], `Dispatch-${dispatch.dispatch_number || "DSP"}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}