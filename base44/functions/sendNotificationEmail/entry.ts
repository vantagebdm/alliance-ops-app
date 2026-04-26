import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Maps Notification.type to the notification settings key used in localStorage
const TYPE_TO_SETTINGS_KEY = {
  stock_low: 'low_stock',
  stock_out: 'negative_stock',
  stock_reorder: 'reorder_required',
  stock_critical: 'negative_stock',
  po_approval: 'po_approval',
  approval_required: 'po_approval',
  credit_limit_exceeded: 'credit_exceeded',
  invoice_overdue: 'overdue_invoice',
  account_on_hold: 'account_suspended',
  dispatch_delayed: 'dispatch_overdue',
};

// Priority labels for email subject
const PRIORITY_LABELS = {
  low: '🔵 Info',
  normal: '🟢 Notice',
  important: '🟡 Important',
  urgent: '🟠 Urgent',
  critical: '🔴 CRITICAL',
};

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

function buildEmailHtml(notification) {
  const priorityColor = {
    low: '#3b82f6',
    normal: '#22c55e',
    important: '#eab308',
    urgent: '#f97316',
    critical: '#ef4444',
  }[notification.priority] || '#22c55e';

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#111111;padding:0;border-radius:6px;border:1px solid #e0e0e0;">
  <div style="background:#1a1a1a;padding:20px 28px;border-radius:6px 6px 0 0;display:flex;align-items:center;gap:12px;">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${priorityColor};flex-shrink:0;"></span>
    <h2 style="color:#ffffff;font-size:18px;margin:0;font-family:Arial,sans-serif;">${notification.title || 'System Notification'}</h2>
  </div>
  <div style="padding:24px 28px;">
    <table style="width:100%;font-size:13px;margin-bottom:20px;border-collapse:collapse;">
      <tr>
        <td style="color:#888;padding:5px 0;width:120px;vertical-align:top;">Priority:</td>
        <td style="color:#111;font-weight:bold;">${PRIORITY_LABELS[notification.priority] || notification.priority}</td>
      </tr>
      ${notification.category ? `<tr><td style="color:#888;padding:5px 0;vertical-align:top;">Category:</td><td style="color:#111;text-transform:capitalize;">${notification.category}</td></tr>` : ''}
      ${notification.entity_ref ? `<tr><td style="color:#888;padding:5px 0;vertical-align:top;">Reference:</td><td style="color:#111;font-weight:bold;">${notification.entity_ref}</td></tr>` : ''}
      ${notification.customer_name ? `<tr><td style="color:#888;padding:5px 0;vertical-align:top;">Customer:</td><td style="color:#111;">${notification.customer_name}</td></tr>` : ''}
    </table>
    ${notification.description ? `<p style="color:#444;font-size:13px;line-height:1.6;background:#f5f5f5;padding:12px 16px;border-radius:4px;border-left:3px solid ${priorityColor};">${notification.description}</p>` : ''}
    <p style="font-size:11px;color:#aaa;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
      This is an automated notification from Alliance Priority Parts ERP. Do not reply to this email.
    </p>
  </div>
</div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function is called by an automation (no user context), use service role
    const { notification, notifEmail } = await req.json();

    if (!notification || !notifEmail) {
      return Response.json({ error: 'Missing notification or notifEmail' }, { status: 400 });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Get sender email
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    const fromEmail = profile.emailAddress;

    const priorityLabel = PRIORITY_LABELS[notification.priority] || '';
    const subject = `${priorityLabel} | ${notification.title}`;
    const htmlBody = buildEmailHtml(notification);
    const raw = buildMimeMessage(notifEmail, subject, htmlBody, fromEmail);

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

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});