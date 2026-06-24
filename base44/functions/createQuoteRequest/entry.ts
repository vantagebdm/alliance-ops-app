import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      name, company, phone, email, job_number, po_inv_number, urgency,
      asset_type, fleet_number, rego, vin_serial, make, model, client_owner,
      lines, image_urls, acknowledged
    } = body;

    // Generate quote request number: QR-YYYYMMDD-HHMMSS
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const quoteNumber = `QR-${dateStr}-${timeStr}`;

    const items = (lines || [])
      .filter(l => l.description?.trim())
      .map(line => ({
        part_number: line.part_number || '',
        description: line.description,
        quantity: parseFloat(line.qty) || 1,
        unit_price: 0,
        total: 0,
      }));

    const noteLines = [
      `Submitted by: ${name}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      `Job Number: ${job_number || '—'}`,
      po_inv_number ? `PO/Invoice: ${po_inv_number}` : null,
      asset_type ? `Asset Type: ${asset_type}` : null,
      fleet_number ? `Fleet/Asset No: ${fleet_number}` : null,
      rego ? `Rego: ${rego}` : null,
      vin_serial ? `VIN/Serial: ${vin_serial}` : null,
      make ? `Make: ${make}` : null,
      model ? `Model: ${model}` : null,
      client_owner ? `Client/Owner: ${client_owner}` : null,
    ].filter(Boolean).join('\n');

    const base44 = createClientFromRequest(req);

    const quote = await base44.asServiceRole.entities.Quote.create({
      quote_number: quoteNumber,
      customer_name: name,
      customer_email: email || '',
      customer_phone: phone || '',
      company: company || '',
      status: 'quote_request',
      items,
      subtotal: 0,
      gst: 0,
      total: 0,
      notes: noteLines,
      submitted_by_name: name,
      urgency: urgency || 'normal',
      job_number: job_number || '',
      po_inv_number: po_inv_number || '',
      asset_type: asset_type || '',
      asset_fleet_number: fleet_number || '',
      asset_make: make || '',
      asset_model: model || '',
      rego: rego || '',
      vin_serial: vin_serial || '',
      client_owner: client_owner || '',
      image_urls: image_urls || [],
      acknowledged: !!acknowledged,
      request_source: 'portal',
    });

    return Response.json({
      success: true,
      quote_number: quoteNumber,
      quote_id: quote.id,
      submitted_at: now.toISOString(),
      name, company, phone, email, job_number, po_inv_number, urgency,
      asset_type, fleet_number, rego, vin_serial, make, model, client_owner,
      lines: lines?.filter(l => l.description?.trim()),
      image_urls: image_urls || [],
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});