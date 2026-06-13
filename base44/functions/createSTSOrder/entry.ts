import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      name, company, job_number, urgency,
      asset_type, fleet_number, make, model, client_owner,
      lines, image_urls, acknowledged
    } = body;

    // Generate order number: STS-YYYY-MM-DDThhmm
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const seq = String(Math.floor(Date.now() / 1000) % 1000).padStart(3, '0');
    const orderNumber = `STS-${dateStr}T${seq}`;

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
      `Job Number: ${job_number}`,
      asset_type ? `Asset Type: ${asset_type}` : null,
      fleet_number ? `Fleet/Asset No: ${fleet_number}` : null,
      make ? `Make: ${make}` : null,
      model ? `Model: ${model}` : null,
      client_owner ? `Client/Owner: ${client_owner}` : null,
    ].filter(Boolean).join('\n');

    const base44 = createClientFromRequest(req);

    const order = await base44.asServiceRole.entities.SalesOrder.create({
      order_number: orderNumber,
      customer_name: company,
      company: company,
      customer_po_number: job_number,
      status: 'pending',
      priority: urgency || 'normal',
      items,
      subtotal: 0,
      gst: 0,
      total: 0,
      delivery_method: 'pickup',
      notes: noteLines,
      submitted_by_name: name,
      job_number,
      asset_type: asset_type || '',
      asset_fleet_number: fleet_number || '',
      asset_make: make || '',
      asset_model: model || '',
      client_owner: client_owner || '',
      order_source: 'sts_portal',
      image_urls: image_urls || [],
      acknowledged: !!acknowledged,
    });

    return Response.json({
      success: true,
      order_number: orderNumber,
      order_id: order.id,
      submitted_at: now.toISOString(),
      name, company, job_number, urgency,
      asset_type, fleet_number, make, model, client_owner,
      lines: lines?.filter(l => l.description?.trim()),
      image_urls: image_urls || [],
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});