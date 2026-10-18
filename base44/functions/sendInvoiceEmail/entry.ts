import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { buildMimeMessage, emailAddress } from '../../shared/emailSafety.ts';
import { buildInvoiceEmailBody } from '../../shared/invoiceEmail.ts';



export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['admin', 'accounts_receivable'].includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { invoice_id, pdfUrl, to: requestedTo } = await req.json();
    if (typeof invoice_id !== 'string' || !invoice_id || typeof pdfUrl !== 'string' || !pdfUrl) {
      return Response.json({ error: 'A saved invoice and its PDF are required' }, { status: 400 });
    }
    // User-scoped read: the role check does not bypass invoice record permissions.
    const invoice = await base44.entities.Invoice.get(invoice_id);
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
    let to;
    try { to = emailAddress(invoice.billing_email); }
    catch { return Response.json({ error: 'Save a valid billing email on the invoice first' }, { status: 400 }); }
    if (requestedTo && requestedTo.trim().toLowerCase() !== to) return Response.json({ error: 'Recipient must match the saved invoice billing email' }, { status: 403 });
    const subject = `Invoice Due - ${invoice.invoice_number || ''}`;
    const body = buildInvoiceEmailBody(invoice);
    const pdfFilename = `Invoice-${invoice.invoice_number || 'INV'}.pdf`;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Get sender email
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    const fromEmail = profile.emailAddress;

    // Fetch PDF and convert to base64 if URL provided
    let pdfBase64 = null;
    let filename = pdfFilename || 'invoice.pdf';
    if (pdfUrl) {
      // Validate the URL to prevent SSRF: https only, trusted hosts, no internal/private IPs.
      let parsed;
      try {
        parsed = new URL(pdfUrl);
      } catch {
        return Response.json({ error: 'Invalid PDF URL' }, { status: 400 });
      }
      if (parsed.protocol !== 'https:') {
        return Response.json({ error: 'PDF URL must use https' }, { status: 400 });
      }
      const host = parsed.hostname.toLowerCase();
      const ALLOWED_HOSTS = ['media.base44.com', 'base44.com', 'files.base44.com'];
      const isAllowedHost = ALLOWED_HOSTS.some((h) => host === h || host.endsWith('.' + h));
      if (!isAllowedHost) {
        return Response.json({ error: 'PDF URL host is not allowed' }, { status: 400 });
      }
      // Reject literal internal/private IP hosts (SSRF guard).
      const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
      if (ipMatch) {
        const [a, b] = ipMatch.slice(1).map(Number);
        if (a === 127 || a === 10 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)) {
          return Response.json({ error: 'Internal host addresses are not allowed' }, { status: 400 });
        }
      }
      const pdfRes = await fetch(parsed.href, { redirect: 'error', signal: AbortSignal.timeout(10000) });
      if (!pdfRes.ok) return Response.json({ error: 'Unable to read invoice PDF' }, { status: 400 });
      if (Number(pdfRes.headers.get('content-length')) > 5000000) return Response.json({ error: 'Invoice PDF is too large' }, { status: 400 });
      const pdfBuffer = await pdfRes.arrayBuffer();
      const uint8 = new Uint8Array(pdfBuffer);
      if (uint8.length > 5000000 || new TextDecoder().decode(uint8.slice(0, 5)) !== '%PDF-') return Response.json({ error: 'Invalid invoice PDF' }, { status: 400 });
      let binary = '';
      for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
      pdfBase64 = btoa(binary);
    }

    const raw = await buildMimeMessage(to, subject, body, fromEmail, pdfBase64, filename);

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
}