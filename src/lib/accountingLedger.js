/**
 * Accounting Ledger Helper
 * Creates BankTransaction entries to reflect financial events in the accounting module.
 * All monetary movements (invoices raised, payments received, bills paid) are posted here.
 */
import { base44 } from "@/api/base44Client";

const today = () => new Date().toISOString().slice(0, 10);

let _defaultBankAccountId = null;
async function getDefaultBankAccountId() {
  if (_defaultBankAccountId) return _defaultBankAccountId;
  const accounts = await base44.entities.BankAccount.list(null, 1);
  if (accounts.length) {
    _defaultBankAccountId = accounts[0].id;
  }
  return _defaultBankAccountId || "unassigned";
}

/**
 * Post an invoice to Accounts Receivable ledger.
 * Called when an invoice is created (status: sent, paid, draft).
 */
export async function postInvoiceToLedger(invoice) {
  if (!invoice || !invoice.total) return;
  const bank_account_id = await getDefaultBankAccountId();

  // Post as a credit (money coming in / owed to us)
  await base44.entities.BankTransaction.create({
    bank_account_id,
    date: invoice.invoice_date || today(),
    description: `Invoice ${invoice.invoice_number} — ${invoice.customer_name}`,
    reference: invoice.invoice_number,
    credit: invoice.total,
    debit: 0,
    gst_treatment: "taxable",
    gst_amount: invoice.gst || 0,
    customer_id: invoice.customer_id || "",
    customer_name: invoice.customer_name || "",
    reconciliation_status: invoice.status === "paid" ? "reconciled" : "unmatched",
    matched_to_id: invoice.id,
    matched_to_type: "invoice",
    source: "system",
    notes: `Auto-posted from Invoice ${invoice.invoice_number}`,
  });
}

/**
 * Post a payment received against an invoice (partial or full).
 * Called when AR records a payment.
 */
export async function postInvoicePaymentToLedger(invoice, amountPaid) {
  if (!amountPaid || amountPaid <= 0) return;
  const bank_account_id = await getDefaultBankAccountId();

  await base44.entities.BankTransaction.create({
    bank_account_id,
    date: today(),
    description: `Payment received — ${invoice.customer_name} (${invoice.invoice_number})`,
    reference: invoice.invoice_number,
    credit: amountPaid,
    debit: 0,
    gst_treatment: "no_gst",
    gst_amount: 0,
    customer_id: invoice.customer_id || "",
    customer_name: invoice.customer_name || "",
    reconciliation_status: "matched",
    matched_to_id: invoice.id,
    matched_to_type: "invoice_payment",
    source: "system",
    notes: `Payment recorded for Invoice ${invoice.invoice_number}`,
  });
}

/**
 * Post a supplier bill to Accounts Payable ledger.
 * Called when a bill is created.
 */
export async function postBillToLedger(bill) {
  if (!bill || !bill.total) return;
  const bank_account_id = await getDefaultBankAccountId();

  await base44.entities.BankTransaction.create({
    bank_account_id,
    date: bill.bill_date || today(),
    description: `Supplier Bill — ${bill.supplier_name}${bill.supplier_invoice_number ? ` (${bill.supplier_invoice_number})` : ""}`,
    reference: bill.bill_number || bill.supplier_invoice_number || "",
    debit: bill.total,
    credit: 0,
    gst_treatment: "taxable",
    gst_amount: bill.gst_total || 0,
    supplier_id: bill.supplier_id || "",
    supplier_name: bill.supplier_name || "",
    reconciliation_status: "unmatched",
    matched_to_id: bill.id,
    matched_to_type: "supplier_bill",
    source: "system",
    notes: `Auto-posted from Supplier Bill${bill.bill_number ? " " + bill.bill_number : ""}`,
  });
}

/**
 * Post a supplier bill payment to the ledger.
 * Called when a bill is marked as paid.
 */
export async function postBillPaymentToLedger(bill) {
  if (!bill || !bill.total) return;
  const bank_account_id = await getDefaultBankAccountId();

  await base44.entities.BankTransaction.create({
    bank_account_id,
    date: today(),
    description: `Bill paid — ${bill.supplier_name}${bill.supplier_invoice_number ? ` (${bill.supplier_invoice_number})` : ""}`,
    reference: bill.bill_number || bill.supplier_invoice_number || "",
    debit: bill.amount_paid || bill.total,
    credit: 0,
    gst_treatment: "no_gst",
    gst_amount: 0,
    supplier_id: bill.supplier_id || "",
    supplier_name: bill.supplier_name || "",
    reconciliation_status: "reconciled",
    matched_to_id: bill.id,
    matched_to_type: "supplier_bill_payment",
    source: "system",
    notes: `Payment posted for Supplier Bill${bill.bill_number ? " " + bill.bill_number : ""}`,
  });
}