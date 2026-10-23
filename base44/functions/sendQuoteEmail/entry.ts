import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });
    if (!['admin', 'sales_representative'].includes(user.role)) return Response.json({ error: 'Sales access required' }, { status: 403 });
    const { quote_id } = await req.json();
    if (typeof quote_id !== 'string' || !/^[a-f0-9]{24}$/i.test(quote_id)) return Response.json({ error: 'Valid quote required' }, { status: 400 });
    const quote = await base44.entities.Quote.get(quote_id);
    if (!quote?.customer_email) return Response.json({ error: 'Quote billing email required' }, { status: 400 });
    const recipients = await base44.asServiceRole.entities.User.filter({ email: quote.customer_email }, '-created_date', 1);
    if (!recipients.length) return Response.json({ error: 'Quote email can only be sent to a registered app user.' }, { status: 400 });
    const esc = value => String(value || '').slice(0, 500).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipients[0].email,
      subject: `Quotation ${String(quote.quote_number || '').replace(/[\r\n]/g, '').slice(0, 80)} from Alliance Priority Parts`,
      body: `<h2>Quotation ${esc(quote.quote_number)}</h2><p>Dear ${esc(quote.customer_name)},</p><p>Your quotation total is $${Number(quote.total || 0).toFixed(2)}.</p><p>Valid until: ${esc(quote.valid_until)}</p><p>Alliance Priority Parts</p>`,
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}