import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all approved supplier bills
    const bills = await base44.asServiceRole.entities.SupplierBill.filter({
      status: 'approved'
    });

    // Fetch all sent invoices (not draft)
    const invoices = await base44.asServiceRole.entities.Invoice.filter({
      status: { $ne: 'draft' }
    });

    // Get existing cashflow entries to avoid duplicates
    const existingEntries = await base44.asServiceRole.entities.CashflowEntry.list('', 1000);
    const existingRefs = new Set(existingEntries.map(e => e.reference || ''));

    const toCreate = [];

    // Process supplier bills (outgoing)
    for (const bill of bills) {
      const ref = `bill_${bill.id}`;
      if (!existingRefs.has(ref)) {
        toCreate.push({
          title: `Bill from ${bill.supplier_name}`,
          type: 'outgoing',
          category: 'supplier_payment',
          amount: bill.total || 0,
          due_date: bill.due_date,
          status: 'scheduled',
          recurrence: 'once',
          supplier_id: bill.supplier_id,
          supplier_name: bill.supplier_name,
          reference: ref,
          notes: `Bill #${bill.bill_number}`
        });
      }
    }

    // Process invoices (incoming)
    for (const invoice of invoices) {
      const ref = `invoice_${invoice.id}`;
      if (!existingRefs.has(ref)) {
        toCreate.push({
          title: `Invoice to ${invoice.customer_name}`,
          type: 'incoming',
          category: 'invoice_payment',
          amount: invoice.total || 0,
          due_date: invoice.due_date,
          status: 'scheduled',
          recurrence: 'once',
          reference: ref,
          notes: `Invoice #${invoice.invoice_number}`
        });
      }
    }

    // Bulk create new entries
    if (toCreate.length > 0) {
      await base44.asServiceRole.entities.CashflowEntry.bulkCreate(toCreate);
    }

    return Response.json({
      success: true,
      billsProcessed: bills.length,
      invoicesProcessed: invoices.length,
      entriesCreated: toCreate.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});