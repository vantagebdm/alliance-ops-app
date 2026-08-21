import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { isValidInternalToken } from '../../shared/internalWorkflowAuth.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json().catch(() => ({}));

  // This function is only meant to be invoked by the "Flag Low Margin Parts"
  // workflow (system-triggered on Part create/update), never by a signed-in
  // user or a public form — verify the shared internal token instead of
  // requiring a login, which the workflow doesn't have.
  if (!isValidInternalToken(body)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: part, event } = body;

  if (!part) {
    return Response.json({ error: 'No part data provided' }, { status: 400 });
  }

  const sellPrice = part.sell_price || 0;
  const unitCost = part.unit_cost || 0;

  // Only flag if both prices are set and > 0
  if (sellPrice <= 0 || unitCost <= 0) {
    return Response.json({ skipped: true, reason: 'Missing sell_price or unit_cost' });
  }

  const margin = ((sellPrice - unitCost) / sellPrice) * 100;

  if (margin < 20) {
    const partRef = part.app_part_number || part.part_number || part.id;
    const partName = part.name || 'Unknown Part';
    const marginRounded = margin.toFixed(1);

    // Check if a low-margin notification already exists for this part (unread)
    const existing = await base44.asServiceRole.entities.Notification.filter({
      entity_id: part.id,
      type: 'stock_adjustment', // reusing as a type — see below we use 'system'
      is_read: false
    });

    // Use a unique title to deduplicate
    const title = `Low Margin: ${partRef}`;
    const existingForPart = await base44.asServiceRole.entities.Notification.filter({
      entity_id: part.id,
      is_dismissed: false
    });

    const alreadyNotified = existingForPart.some(n => n.type === 'system' && !n.is_read && !n.is_dismissed);

    if (!alreadyNotified) {
      await base44.asServiceRole.entities.Notification.create({
        type: 'system',
        category: 'inventory',
        priority: margin < 10 ? 'urgent' : 'important',
        title: `Low Margin: ${partRef} — ${partName}`,
        description: `Gross margin is ${marginRounded}% (below 20% threshold). Sell: $${sellPrice.toFixed(2)} · Cost: $${unitCost.toFixed(2)}. Review pricing.`,
        entity_type: 'Part',
        entity_id: part.id,
        entity_ref: partRef,
        is_read: false,
        is_dismissed: false
      });
    }
  }

  return Response.json({ ok: true, margin: ((sellPrice - unitCost) / sellPrice * 100).toFixed(1) });
});