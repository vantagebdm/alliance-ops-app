import { escapeEmailData } from './emailSafety.ts';

export function buildInvoiceEmailBody(record) {
  const invoice = escapeEmailData(record);
  const rows = [
    ['Customer', invoice.customer_name], ['Company', invoice.company],
    ['Invoice Date', invoice.invoice_date], ['Due Date', invoice.due_date],
    ['Customer PO', invoice.customer_po_number], ['Order Ref', invoice.sales_order_reference],
    ['Total Due', `$${Number(record.total || 0).toFixed(2)}`],
  ].filter(([, value]) => value).map(([label, value]) => `<tr><td style="color:#666;padding:5px 0;width:140px;">${label}:</td><td style="color:#111;font-weight:bold;">${value}</td></tr>`).join('');
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;color:#111;border-radius:6px;border:1px solid #e0e0e0;">
    <div style="background:#000;padding:24px 28px;border-radius:6px 6px 0 0;"><h2 style="color:#fff;font-size:22px;margin:0 0 4px;">INVOICE</h2><p style="color:#ccc;margin:0;">Invoice #${invoice.invoice_number || ''}</p></div>
    <div style="padding:24px 28px;"><table style="width:100%;font-size:14px;margin-bottom:24px;border-collapse:collapse;">${rows}</table>
    <p style="color:#444;font-size:13px;">Please find your invoice attached as a PDF to this email.</p>
    ${invoice.customer_notes ? `<p style="font-size:12px;color:#888;">${invoice.customer_notes}</p>` : ''}
    <p style="font-size:11px;color:#aaa;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">Alliance Priority Parts</p></div></div>`;
}