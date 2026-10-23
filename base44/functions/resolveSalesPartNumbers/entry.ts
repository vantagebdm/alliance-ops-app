import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveSalesPartNumbers } from '../../shared/salesPartNumbers.ts';

export default async function(req) {
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length > 500 || items.some(i => !i || ['part_id', 'part_number', 'app_part_number'].some(f => i[f] != null && (typeof i[f] !== 'string' || i[f].length > 200)))) {
      return Response.json({ error: 'Provide up to 500 part references' }, { status: 400 });
    }
    // Accounts staff can issue invoices but cannot read cost-bearing Part records.
    // Expose only the APP identifier to them, never pricing or supplier details.
    const reader = user.role === 'accounts_receivable' ? client.asServiceRole : client;
    const resolved = await resolveSalesPartNumbers(reader, items);
    return Response.json({ items: resolved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}