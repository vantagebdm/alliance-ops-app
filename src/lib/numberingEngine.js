/**
 * APP ERP Numbering Engine
 * Central logic for document and part number generation, validation, and audit.
 */

// ─── Storage Keys ────────────────────────────────────────────────────────────
const KEYS = {
  DOC_RULES:    "app_erp_doc_rules",
  DOC_HISTORY:  "app_erp_doc_history",
  DOC_AUDIT:    "app_erp_doc_audit",
  PART_CATS:    "app_erp_part_cats",
  PART_HISTORY: "app_erp_part_history",
  PART_AUDIT:   "app_erp_part_audit",
  CROSS_REFS:   "app_erp_cross_refs",
};

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const save = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

// ─── Default Document Rules ───────────────────────────────────────────────────
export const DEFAULT_DOC_RULES = [
  { id: "quote",        type: "Quote",                 prefix: "QUO", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "sales_order",  type: "Sales Order",           prefix: "SO",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Financial Year", manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "invoice",      type: "Invoice",               prefix: "INV", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: true,  status: "active", locked: true  },
  { id: "credit_note",  type: "Credit Note",           prefix: "CN",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: true,  status: "active", locked: true  },
  { id: "purchase_order",type: "Purchase Order",       prefix: "PO",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Financial Year", manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "supplier_bill",type: "Supplier Bill",         prefix: "SB",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "supplier_pay", type: "Supplier Payment",      prefix: "SP",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "customer_pay", type: "Customer Payment",      prefix: "CP",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "grn",          type: "Goods Received Note",   prefix: "GRN", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "stock_adj",    type: "Stock Adjustment",      prefix: "SA",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: true,  approvalReq: false, status: "active", locked: false },
  { id: "stock_trans",  type: "Stock Transfer",        prefix: "TR",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: true,  approvalReq: false, status: "active", locked: false },
  { id: "stocktake",    type: "Stocktake",             prefix: "STK", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "dispatch",     type: "Dispatch Note",         prefix: "DSP", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "journal",      type: "Journal Entry",         prefix: "JE",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Financial Year", manualOk: false, approvalReq: true,  status: "active", locked: true  },
  { id: "payroll",      type: "Payroll Run",           prefix: "PAY", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Financial Year", manualOk: false, approvalReq: true,  status: "active", locked: true  },
  { id: "bas",          type: "BAS Reference",         prefix: "BAS", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Financial Year", manualOk: false, approvalReq: true,  status: "active", locked: true  },
  { id: "bank_recon",   type: "Bank Reconciliation",   prefix: "REC", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Monthly",       manualOk: false, approvalReq: true,  status: "active", locked: false },
  { id: "warranty",     type: "Warranty Claim",        prefix: "WC",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "return_auth",  type: "Return Authorisation",  prefix: "RA",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "import_batch", type: "Import Batch",          prefix: "IMP", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "export_batch", type: "Export Batch",          prefix: "EXP", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "backorder",    type: "Backorder",             prefix: "BO",  next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "pick_slip",    type: "Pick Slip",             prefix: "PKS", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Daily",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "pack_slip",    type: "Packing Slip",          prefix: "PKG", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Daily",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "delivery",     type: "Delivery Docket",       prefix: "DEL", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "backup_ref",   type: "Backup Reference",      prefix: "BCK", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
  { id: "audit_ref",    type: "Audit Log Reference",   prefix: "AUD", next: 1,  padding: 5, sep: "-", suffix: "", incBranch: false, incMonth: false, incFY: false, reset: "Never",         manualOk: false, approvalReq: false, status: "active", locked: false },
];

// ─── Default Part Categories ──────────────────────────────────────────────────
export const DEFAULT_PART_CATS = [
  { id: "eng", name: "Engine",            prefix: "ENG", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "trm", name: "Transmission",      prefix: "TRM", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "sus", name: "Suspension",        prefix: "SUS", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "brk", name: "Brakes",            prefix: "BRK", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "fil", name: "Filtration",        prefix: "FIL", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "hyd", name: "Hydraulics",        prefix: "HYD", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "ele", name: "Electrical",        prefix: "ELE", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "oil", name: "Oils",              prefix: "OIL", next: 1, padding: 4, status: "active", marginGroup: "Oils",     gstCode: "Taxable (10%)", stockCat: "Consumable",account: "1300 – Inventory Asset", notes: "" },
  { id: "spr", name: "Sprays",            prefix: "SPR", next: 1, padding: 4, status: "active", marginGroup: "Consumable",gstCode: "Taxable (10%)",stockCat: "Consumable",account: "1300 – Inventory Asset", notes: "" },
  { id: "con", name: "Consumables",       prefix: "CON", next: 1, padding: 4, status: "active", marginGroup: "Consumable",gstCode: "Taxable (10%)",stockCat: "Consumable",account: "1300 – Inventory Asset", notes: "" },
  { id: "che", name: "Chemicals",         prefix: "CHE", next: 1, padding: 4, status: "active", marginGroup: "Consumable",gstCode: "Taxable (10%)",stockCat: "Consumable",account: "1300 – Inventory Asset", notes: "" },
  { id: "com", name: "Compliance",        prefix: "COM", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Compliance",account: "1300 – Inventory Asset", notes: "" },
  { id: "dri", name: "Driveline",         prefix: "DRI", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "trl", name: "Trailer",           prefix: "TRL", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "tyr", name: "Tyres",             prefix: "TYR", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "coo", name: "Cooling",           prefix: "COO", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "cab", name: "Body / Cab",        prefix: "CAB", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "fas", name: "Fasteners",         prefix: "FAS", next: 1, padding: 4, status: "active", marginGroup: "Consumable",gstCode: "Taxable (10%)",stockCat: "Consumable",account: "1300 – Inventory Asset", notes: "" },
  { id: "bea", name: "Bearings",          prefix: "BEA", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "sea", name: "Seals",             prefix: "SEA", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "tol", name: "Tools",             prefix: "TOL", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "wks", name: "Workshop Supplies", prefix: "WKS", next: 1, padding: 4, status: "active", marginGroup: "Consumable",gstCode: "Taxable (10%)",stockCat: "Consumable",account: "1300 – Inventory Asset", notes: "" },
  { id: "saf", name: "Safety",            prefix: "SAF", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
  { id: "oth", name: "Other",             prefix: "OTH", next: 1, padding: 4, status: "active", marginGroup: "Standard", gstCode: "Taxable (10%)", stockCat: "Parts",     account: "1300 – Inventory Asset", notes: "" },
];

// ─── Number generation ────────────────────────────────────────────────────────
export function previewDocNumber(rule) {
  const seq = String(rule.next).padStart(rule.padding, "0");
  const sep = rule.sep === "None" ? "" : rule.sep === "Hyphen" ? "-" : rule.sep === "Slash" ? "/" : ".";
  let num = rule.prefix + sep + seq;
  if (rule.suffix) num += sep + rule.suffix;
  return num;
}

export function previewAppPartNumber(cat) {
  const seq = String(cat.next).padStart(cat.padding, "0");
  return `APP-${cat.prefix}${seq}`;
}

// ─── Document Number Engine ───────────────────────────────────────────────────
export function getDocRules() {
  const stored = load(KEYS.DOC_RULES, null);
  if (!stored) { save(KEYS.DOC_RULES, DEFAULT_DOC_RULES); return DEFAULT_DOC_RULES; }
  // merge any new default rules not in stored
  const storedIds = new Set(stored.map(r => r.id));
  const merged = [...stored, ...DEFAULT_DOC_RULES.filter(r => !storedIds.has(r.id))];
  return merged;
}

export function saveDocRules(rules) { save(KEYS.DOC_RULES, rules); }

export function generateDocNumber(ruleId, user = "System") {
  const rules = getDocRules();
  const ruleIdx = rules.findIndex(r => r.id === ruleId);
  if (ruleIdx === -1) throw new Error(`Rule ${ruleId} not found`);
  const rule = rules[ruleIdx];
  if (rule.status !== "active") throw new Error(`Rule ${ruleId} is not active`);

  const num = previewDocNumber(rule);
  const history = load(KEYS.DOC_HISTORY, []);

  // Duplicate check
  if (history.some(h => h.number === num && !h.voided)) {
    throw new Error(`Duplicate number detected: ${num}`);
  }

  // Advance sequence
  rules[ruleIdx] = { ...rule, next: rule.next + 1 };
  save(KEYS.DOC_RULES, rules);

  // Record history
  history.push({ number: num, ruleId, type: rule.type, generatedAt: new Date().toISOString(), user, voided: false });
  save(KEYS.DOC_HISTORY, history);

  // Audit
  addDocAudit({ action: "Number Generated", module: "Document Numbering", record: num, oldVal: "", newVal: num, reason: "Auto-generated", user });

  return num;
}

export function getDocHistory() { return load(KEYS.DOC_HISTORY, []); }
export function isDocNumberUsed(num) { return load(KEYS.DOC_HISTORY, []).some(h => h.number === num); }

// ─── Part Number Engine ───────────────────────────────────────────────────────
export function getPartCats() {
  const stored = load(KEYS.PART_CATS, null);
  if (!stored) { save(KEYS.PART_CATS, DEFAULT_PART_CATS); return DEFAULT_PART_CATS; }
  const storedIds = new Set(stored.map(c => c.id));
  return [...stored, ...DEFAULT_PART_CATS.filter(c => !storedIds.has(c.id))];
}

export function savePartCats(cats) { save(KEYS.PART_CATS, cats); }

export function generateAppPartNumber(catId, user = "System") {
  const cats = getPartCats();
  const catIdx = cats.findIndex(c => c.id === catId);
  if (catIdx === -1) throw new Error(`Category ${catId} not found`);
  const cat = cats[catIdx];
  if (cat.status !== "active") throw new Error(`Category ${catId} is not active`);

  const num = previewAppPartNumber(cat);
  const history = load(KEYS.PART_HISTORY, []);

  if (history.some(h => h.number === num)) {
    throw new Error(`Duplicate APP part number: ${num}`);
  }

  cats[catIdx] = { ...cat, next: cat.next + 1 };
  save(KEYS.PART_CATS, cats);

  history.push({ number: num, catId, catPrefix: cat.prefix, generatedAt: new Date().toISOString(), user });
  save(KEYS.PART_HISTORY, history);

  addPartAudit({ action: "APP Part Number Generated", module: "Part Numbering", record: num, oldVal: "", newVal: num, reason: "Auto-generated", user });

  return num;
}

export function getPartHistory() { return load(KEYS.PART_HISTORY, []); }

// ─── Cross References ─────────────────────────────────────────────────────────
export function getCrossRefs() { return load(KEYS.CROSS_REFS, []); }
export function saveCrossRef(ref) {
  const refs = getCrossRefs();
  refs.push({ ...ref, id: Date.now().toString(), createdAt: new Date().toISOString() });
  save(KEYS.CROSS_REFS, refs);
}
export function checkCrossRefDuplicate(type, value) {
  return getCrossRefs().filter(r => r.type === type && r.value === value);
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────
export function checkPartDuplicate({ appNumber, oemNumber, supplierNumber, barcode, description }) {
  const history = getPartHistory();
  const refs = getCrossRefs();
  const warnings = [];

  if (appNumber && history.some(h => h.number === appNumber)) {
    warnings.push({ level: "block", field: "APP Part Number", message: `APP number ${appNumber} already exists.` });
  }
  if (oemNumber) {
    const existing = refs.filter(r => r.type === "OEM" && r.value === oemNumber);
    if (existing.length) warnings.push({ level: "warn", field: "OEM Number", message: `OEM number ${oemNumber} is already linked to ${existing.map(r => r.appNumber).join(", ")}.` });
  }
  if (supplierNumber) {
    const existing = refs.filter(r => r.type === "Supplier" && r.value === supplierNumber);
    if (existing.length) warnings.push({ level: "warn", field: "Supplier Part Number", message: `Supplier number ${supplierNumber} is already used.` });
  }
  return warnings;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
function addDocAudit(entry) {
  const log = load(KEYS.DOC_AUDIT, []);
  log.unshift({ id: Date.now(), dt: new Date().toLocaleString("en-AU"), ...entry });
  save(KEYS.DOC_AUDIT, log.slice(0, 500));
}
function addPartAudit(entry) {
  const log = load(KEYS.PART_AUDIT, []);
  log.unshift({ id: Date.now(), dt: new Date().toLocaleString("en-AU"), ...entry });
  save(KEYS.PART_AUDIT, log.slice(0, 500));
}

export function getDocAuditLog() { return load(KEYS.DOC_AUDIT, []); }
export function getPartAuditLog() { return load(KEYS.PART_AUDIT, []); }

export function logDocAudit(entry) { addDocAudit(entry); }
export function logPartAudit(entry) { addPartAudit(entry); }

// ─── Utilities ────────────────────────────────────────────────────────────────
export function resetSequence(type, ruleOrCatId, newNext, user, reason) {
  if (type === "doc") {
    const rules = getDocRules();
    const idx = rules.findIndex(r => r.id === ruleOrCatId);
    if (idx === -1) return;
    const old = rules[idx].next;
    rules[idx] = { ...rules[idx], next: newNext };
    saveDocRules(rules);
    addDocAudit({ action: "Sequence Reset", module: "Document Numbering", record: rules[idx].prefix, oldVal: String(old), newVal: String(newNext), reason, user, approvalReq: true });
  } else {
    const cats = getPartCats();
    const idx = cats.findIndex(c => c.id === ruleOrCatId);
    if (idx === -1) return;
    const old = cats[idx].next;
    cats[idx] = { ...cats[idx], next: newNext };
    savePartCats(cats);
    addPartAudit({ action: "Sequence Reset", module: "Part Numbering", record: cats[idx].prefix, oldVal: String(old), newVal: String(newNext), reason, user, approvalReq: true });
  }
}