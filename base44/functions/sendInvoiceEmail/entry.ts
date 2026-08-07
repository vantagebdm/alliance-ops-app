import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildMimeWithAttachment(to, subject, htmlBody, fromEmail, pdfBase64, pdfFilename) {
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
  ];

  if (pdfBase64 && pdfFilename) {
    lines.push(
      `--${boundary}`,
      `Content-Type: application/pdf; name="${pdfFilename}"`,
      `Content-Disposition: attachment; filename="${pdfFilename}"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      pdfBase64,
    );
  }

  lines.push(`--${boundary}--`);
  const raw = lines.join('\r\n');

  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body, pdfUrl, pdfFilename } = await req.json();
    if (!to || !subject || !body) {
      return Response.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 });
    }

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
      const pdfRes = await fetch(parsed.href);
      const pdfBuffer = await pdfRes.arrayBuffer();
      const uint8 = new Uint8Array(pdfBuffer);
      let binary = '';
      for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
      pdfBase64 = btoa(binary);
    }

    const raw = buildMimeWithAttachment(to, subject, body, fromEmail, pdfBase64, filename);

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