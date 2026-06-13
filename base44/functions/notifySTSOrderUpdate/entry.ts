import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function buildMimeMessage(to, subject, htmlBody, fromEmail) {
  const boundary = `boundary_${Date.now()}`;
  const lines = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    htmlBody,
    `--${boundary}--`,
  ];
  return btoa(unescape(encodeURIComponent(lines.join('\r\n'))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready: 'Ready for Pickup',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pending: '#6b7280',
  confirmed: '#3b82f6',
  processing: '#f59e0b',
  ready: '#8b5cf6',
  dispatched: '#0ea5e9',
  delivered: '#16a34a',
  cancelled: '#dc2626',
};

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { event, data, old_data } = body;

    // Only process STS Service Desk orders
    if (!data || data.company !== 'STS Service Desk') {
      return Response.json({ skipped: true, reason: 'Not an STS Service Desk order' });
    }

    const order = data;
    const oldStatus = old_data?.status;
    const newStatus = order.status;
    const statusChanged = oldStatus && newStatus && oldStatus !== newStatus;

    const oldStatusLabel = STATUS_LABELS[oldStatus] || oldStatus || '—';
    const newStatusLabel = STATUS_LABELS[newStatus] || newStatus || '—';
    const newStatusColor = STATUS_COLORS[newStatus] || '#6b7280';

    const urgencyLabel = { normal: 'Normal', urgent: 'URGENT', breakdown: 'BREAKDOWN / EMERGENCY' };
    const urgency = urgencyLabel[order.priority] || order.priority || 'Normal';
    const isUrgent = order.priority === 'urgent' || order.priority === 'breakdown';
    const urgencyColor = order.priority === 'breakdown' ? '#dc2626' : order.priority === 'urgent' ? '#d97706' : '#16a34a';

    const subjectPrefix = statusChanged
      ? `Order ${order.order_number} Status → ${newStatusLabel}`
      : `Order ${order.order_number} Updated`;

    const subject = `${isUrgent ? '⚠️ ' : ''}[STS Parts] ${subjectPrefix}`;

    const lines = (order.items || []).map((item, i) =>
      `<tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.quantity || 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;">${item.part_number || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.description || ''}</td>
      </tr>`
    ).join('');

    const jobNumber = order.job_number || order.customer_po_number || '—';
    const assetType = order.asset_type || '—';
    const fleetNumber = order.asset_fleet_number || '—';
    const make = order.asset_make || '—';
    const model = order.asset_model || '—';
    const clientOwner = order.client_owner || '—';
    const submittedBy = order.submitted_by_name || '—';

    const statusChangeBlock = statusChanged ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:16px;">
      <div style="text-align:center;">
        <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Previous Status</div>
        <div style="display:inline-block;padding:5px 14px;border-radius:20px;background:#f3f4f6;color:#374151;font-weight:600;font-size:13px;">${oldStatusLabel}</div>
      </div>
      <div style="font-size:22px;color:#9ca3af;flex:1;text-align:center;">→</div>
      <div style="text-align:center;">
        <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">New Status</div>
        <div style="display:inline-block;padding:5px 14px;border-radius:20px;background:${newStatusColor};color:#fff;font-weight:700;font-size:13px;">${newStatusLabel}</div>
      </div>
    </div>` : `
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:14px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#713f12;"><strong>Order Updated</strong> — Details for order ${order.order_number} have been modified. Please review the latest information below.</p>
    </div>`;

    const emailBody = `
<div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;background:#ffffff;color:#111;border-radius:8px;border:1px solid #e0e0e0;overflow:hidden;">
  <div style="background:#0f0f0f;padding:24px 28px;">
    <h2 style="color:#ffffff;font-size:20px;margin:0 0 4px 0;letter-spacing:1px;">${statusChanged ? 'ORDER STATUS UPDATE' : 'ORDER UPDATED'}</h2>
    <p style="color:#aaa;margin:0;font-size:13px;">STS Service Desk Portal — Alliance Priority Parts</p>
  </div>
  ${isUrgent ? `<div style="background:${urgencyColor};padding:10px 28px;color:#fff;font-weight:bold;font-size:13px;letter-spacing:0.5px;">⚠️ ${urgency}</div>` : ''}
  <div style="padding:24px 28px;">
    <p style="margin:0 0 16px 0;">Hi Adam,</p>
    <p style="margin:0 0 20px 0;">${statusChanged ? `The status of parts order <strong>${order.order_number}</strong> has been updated.` : `Parts order <strong>${order.order_number}</strong> has been modified.`}</p>

    ${statusChangeBlock}

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
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Urgency</td>
        <td style="padding:9px 14px;font-weight:bold;color:${urgencyColor};">${urgency}</td>
      </tr>
      <tr style="background:#f3f4f6;">
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Asset Type</td>
        <td style="padding:9px 14px;">${assetType}</td>
      </tr>
      <tr>
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Fleet / Asset No.</td>
        <td style="padding:9px 14px;">${fleetNumber}</td>
      </tr>
      <tr style="background:#f3f4f6;">
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Make / Model</td>
        <td style="padding:9px 14px;">${make}${model !== '—' ? ' / ' + model : ''}</td>
      </tr>
      <tr>
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Client / Owner</td>
        <td style="padding:9px 14px;">${clientOwner}</td>
      </tr>
      <tr style="background:#f3f4f6;">
        <td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Current Status</td>
        <td style="padding:9px 14px;"><span style="display:inline-block;padding:3px 12px;border-radius:20px;background:${newStatusColor};color:#fff;font-weight:700;font-size:12px;">${newStatusLabel}</span></td>
      </tr>
    </table>

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#444;margin:0 0 10px 0;">Parts (${(order.items || []).length} line${(order.items || []).length !== 1 ? 's' : ''})</h3>
    <table style="width:100%;font-size:13px;border-collapse:collapse;border:1px solid #e5e5e5;">
      <thead>
        <tr style="background:#0f0f0f;color:#fff;">
          <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Part No.</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Description</th>
        </tr>
      </thead>
      <tbody>${lines || '<tr><td colspan="3" style="padding:12px;color:#999;text-align:center;">No line items</td></tr>'}</tbody>
    </table>

    <p style="margin:24px 0 0 0;font-size:13px;color:#555;">Log in to review and manage this order.</p>
    <p style="margin:6px 0 0 0;font-size:13px;color:#555;">🔗 <a href="https://alliance-core-ops.base44.app/orders" style="color:#16a34a;">View Orders →</a></p>
  </div>
  <div style="background:#f3f4f6;padding:14px 28px;font-size:11px;color:#aaa;border-top:1px solid #e5e5e5;">
    Alliance Priority Parts — Automated notification from STS Parts Portal
  </div>
</div>`;

    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    const fromEmail = profile.emailAddress;

    const raw = buildMimeMessage('adam.h@thestshub.com.au', subject, emailBody, fromEmail);

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.json();
      return Response.json({ error: err.error?.message || 'Gmail send failed' }, { status: 500 });
    }

    return Response.json({ success: true, order_number: order.order_number, status_changed: statusChanged, old_status: oldStatus, new_status: newStatus });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});