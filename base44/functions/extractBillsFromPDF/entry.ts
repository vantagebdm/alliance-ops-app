import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a document extraction AI for an automotive parts ERP system.

You have been given a PDF that may contain one or more supplier invoices/bills (one per page or section).

For EACH distinct invoice/bill found in the document, extract the following data:

- supplier_name: The name of the supplier/vendor issuing the invoice
- supplier_invoice_number: The invoice number or reference number on the bill
- bill_date: The invoice/bill date in YYYY-MM-DD format
- due_date: The payment due date in YYYY-MM-DD format (if present, otherwise null)
- notes: Any relevant payment terms, special instructions, or notes
- lines: An array of line items, each with:
  - description: Item description
  - quantity: Numeric quantity (default 1 if not shown)
  - unit_price: Unit price (numeric, inc GST if Australian invoice)
  - gst_treatment: "taxable" if GST applies, "gst_free" otherwise

Important rules:
- If the PDF has multiple pages with separate invoices, return each as a separate bill object
- Prices should be the TOTAL line price divided by quantity to get unit_price
- Return ONLY valid JSON, no explanation text
- If a field cannot be determined, use null

Return format:
{
  "bills": [
    {
      "supplier_name": "...",
      "supplier_invoice_number": "...",
      "bill_date": "YYYY-MM-DD",
      "due_date": "YYYY-MM-DD or null",
      "notes": "...",
      "lines": [
        { "description": "...", "quantity": 1, "unit_price": 0.00, "gst_treatment": "taxable" }
      ]
    }
  ]
}`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          bills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                supplier_name: { type: "string" },
                supplier_invoice_number: { type: "string" },
                bill_date: { type: "string" },
                due_date: { type: "string" },
                notes: { type: "string" },
                lines: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      quantity: { type: "number" },
                      unit_price: { type: "number" },
                      gst_treatment: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return Response.json({ bills: result?.bills || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});