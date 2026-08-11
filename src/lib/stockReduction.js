import { base44 } from "@/api/base44Client";

// Decrement stock_quantity on matching parts for each invoiced line item.
// Only called for non-draft invoices (actual sales). Charge lines without a
// part_number are ignored.
export async function reduceStockForInvoiceItems(items) {
  const partNumbers = (items || [])
    .map((it) => it.part_number || it.app_part_number)
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter((s, i, arr) => arr.indexOf(s) === i);

  if (partNumbers.length === 0) return;

  // Fetch matching parts by each identifier
  const matched = new Map();
  for (const pn of partNumbers) {
    try {
      const results = await base44.entities.Part.filter({
        $or: [
          { part_number: pn },
          { app_part_number: pn },
          { supplier_sku: pn },
        ],
      });
      for (const p of results || []) {
        if (!matched.has(p.id)) matched.set(p.id, p);
      }
    } catch (_) {}
  }

  if (matched.size === 0) return;

  // Build quantity map by part_number identifier
  const qtyMap = {};
  for (const it of items || []) {
    const pn = String(it.part_number || it.app_part_number || "").trim();
    if (!pn) continue;
    qtyMap[pn] = (qtyMap[pn] || 0) + (Number(it.quantity) || 0);
  }

  const updates = [];
  for (const part of matched.values()) {
    const identifiers = [part.part_number, part.app_part_number, part.supplier_sku]
      .filter(Boolean)
      .map((s) => String(s).trim());
    const qty = identifiers.reduce((sum, id) => sum + (qtyMap[id] || 0), 0);
    if (qty <= 0) continue;
    const newQty = Math.max(0, (Number(part.stock_quantity) || 0) - qty);
    updates.push({ id: part.id, stock_quantity: newQty });
  }

  if (updates.length === 0) return;

  try {
    await base44.entities.Part.bulkUpdate(updates);
  } catch (_) {}
}