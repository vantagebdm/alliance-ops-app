import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { event, data } = body;

    // Only process STS Service Desk orders
    if (!data || data.company !== 'STS Service Desk') {
      return Response.json({ skipped: true, reason: 'Not an STS Service Desk order' });
    }

    const base44 = createClientFromRequest(req);

    const order = data;
    const urgencyLabel = { normal: 'Normal', urgent: 'URGENT', breakdown: 'BREAKDOWN / EMERGENCY' };
    const urgency = urgencyLabel[order.priority] || order.priority || 'Normal';
    const isUrgent = order.priority === 'urgent' || order.priority === 'breakdown';

    const lines = (order.items || []).map((item, i) =>
      `<tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.quantity || 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;">${item.part_number || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.description || ''}</td>
      </tr>`
    ).join('');

    const noteLines = (order.notes || '').split('\n').filter(Boolean);
    const getNote = (prefix) => {
      const line = noteLines.find(l => l.startsWith(prefix));
      return line ? line.replace(prefix, '').trim() : null;
    };

    const jobNumber = order.job_number || order.customer_po_number || '—';
    const assetType = order.asset_type || getNote('Asset Type:') || '—';
    const fleetNumber = order.asset_fleet_number || getNote('Fleet/Asset No:') || '—';
    const make = order.asset_make || getNote('Make:') || '—';
    const model = order.asset_model || getNote('Model:') || '—';
    const clientOwner = order.client_owner || getNote('Client/Owner:') || '—';
    const submittedBy = order.submitted_by_name || getNote('Submitted by:') || '—';
    const poInv = order.reference || getNote('STS PO/Invoice:') || '—';

    const urgencyColor = order.priority === 'breakdown' ? '#dc2626' : order.priority === 'urgent' ? '#d97706' : '#16a34a';

    const emailBody = `
<div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;background:#ffffff;color:#111;border-radius:8px;border:1px solid #e0e0e0;overflow:hidden;">
  <div style="background:#0f0f0f;padding:24px 28px;">
    <h2 style="color:#ffffff;font-size:20px;margin:0 0 4px 0;letter-spacing:1px;">NEW PARTS ORDER RECEIVED</h2>
    <p style="color:#aaa;margin:0;font-size:13px;">STS Service Desk Portal — Alliance Priority Parts</p>
  </div>
  ${isUrgent ? `<div style="background:${urgencyColor};padding:10px 28px;color:#fff;font-weight:bold;font-size:13px;letter-spacing:0.5px;">⚠️ ${urgency} — Please action immediately</div>` : ''}
  <div style="padding:24px 28px;">
    <p style="margin:0 0 16px 0;">Hi Adam,</p>
    <p style="margin:0 0 20px 0;">A new parts order has been submitted via the STS Service Desk portal and requires your review.</p>

    <table style="width:100%;font-size:14px;margin-bottom:20px;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:6px;">
      <tr style="background:#f3f4f6;">
        <td style="padding:9px 14px;color:#666;width:160px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Order Number</td>
        <td style="padding:9px 14px;font-weight:bold;color:#111;font-size:15px;">${order.order_number}</td>
      </tr>
      <tr>
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Submitted By</td>
        <td style="padding:9px 14px;font-weight:600;">${submittedBy}</td>
      </tr>
      <tr style="background:#f3f4f6;">
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Job Number</td>
        <td style="padding:9px 14px;">${jobNumber}</td>
      </tr>
      <tr>
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">STS PO / Invoice</td>
        <td style="padding:9px 14px;">${poInv}</td>
      </tr>
      <tr style="background:#f3f4f6;">
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Urgency</td>
        <td style="padding:9px 14px;font-weight:bold;color:${urgencyColor};">${urgency}</td>
      </tr>
      <tr>
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Asset Type</td>
        <td style="padding:9px 14px;">${assetType}</td>
      </tr>
      <tr style="background:#f3f4f6;">
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Fleet / Asset No.</td>
        <td style="padding:9px 14px;">${fleetNumber}</td>
      </tr>
      <tr>
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Make / Model</td>
        <td style="padding:9px 14px;">${make} ${model !== '—' ? '/ ' + model : ''}</td>
      </tr>
      <tr style="background:#f3f4f6;">
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Client / Owner</td>
        <td style="padding:9px 14px;">${clientOwner}</td>
      </tr>
    </table>

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#444;margin:0 0 10px 0;">Parts Requested (${(order.items || []).length} line${(order.items || []).length !== 1 ? 's' : ''})</h3>
    <table style="width:100%;font-size:13px;border-collapse:collapse;border:1px solid #e5e5e5;">
      <thead>
        <tr style="background:#0f0f0f;color:#fff;">
          <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Part No.</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Description</th>
        </tr>
      </thead>
      <tbody>${lines}</tbody>
    </table>

    <p style="margin:24px 0 0 0;font-size:13px;color:#555;">Please log in to Alliance Priority Parts to review and process this order.</p>
    <p style="margin:6px 0 0 0;font-size:13px;color:#555;">🔗 <a href="https://alliance-core-ops.base44.app/orders" style="color:#16a34a;">View Orders →</a></p>
  </div>
  <div style="background:#f3f4f6;padding:14px 28px;font-size:11px;color:#aaa;border-top:1px solid #e5e5e5;">
    Alliance Priority Parts — Automated notification from STS Parts Portal
  </div>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'adam.h@thestshub.com.au',
      from_name: 'Alliance Priority Parts',
      subject: `${isUrgent ? `⚠️ [${urgency}] ` : ''}New Parts Order ${order.order_number} — STS Service Desk`,
      body: emailBody,
    });

    return Response.json({ success: true, order_number: order.order_number });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});