import MailComposer from 'npm:nodemailer@6.10.1/lib/mail-composer/index.js';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Use only on a copy at the HTML rendering boundary, never on stored records.
export function escapeEmailData(value) {
  if (typeof value === 'string') return escapeHtml(value);
  if (Array.isArray(value)) return value.map(escapeEmailData);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, escapeEmailData(v)]));
  return value;
}

export function emailAddress(value) {
  if (typeof value !== 'string' || /[\x00-\x20\x7f<>,;:"\\]/.test(value) || !/^[^@]+@[^@]+\.[^@]+$/.test(value) || value.length > 254) throw new Error('Invalid email address');
  return value.toLowerCase();
}

export async function buildMimeMessage(to, subject, htmlBody, fromEmail, pdfBase64 = null, pdfFilename = 'invoice.pdf') {
  const mail = new MailComposer({
    from: { address: emailAddress(fromEmail) },
    to: [{ address: emailAddress(to) }],
    subject: String(subject ?? '').replace(/[\x00-\x1f\x7f]/g, ' ').slice(0, 200),
    html: htmlBody,
    disableFileAccess: true,
    disableUrlAccess: true,
    attachments: pdfBase64 ? [{ filename: String(pdfFilename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120), content: pdfBase64, encoding: 'base64', contentType: 'application/pdf' }] : [],
  });
  const bytes = await new Promise((resolve, reject) => mail.compile().build((error, result) => error ? reject(error) : resolve(result)));
  return bytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}