export async function resolveSalesPartNumbers(client, items) {
  const fields = ['part_number', 'supplier_sku', 'oem_number', 'aftermarket_number', 'app_part_number'];
  const codes = [...new Set(items.flatMap(i => [i.part_number, i.app_part_number]).filter(Boolean))];
  const ids = [...new Set(items.map(i => i.part_id).filter(Boolean))];
  const batches = [[]];
  let size = 0;
  for (const code of new Set([...codes, ...ids])) {
    const length = encodeURIComponent(code).length;
    if (size + length > 600 && batches[batches.length - 1].length) { batches.push([]); size = 0; }
    batches[batches.length - 1].push(code);
    size += length;
  }
  const found = new Map();
  for (const batch of batches.filter(b => b.length)) {
    let cursor;
    do {
      const query = { $or: [...fields, 'id'].map(field => ({ [field]: { $in: batch } })) };
      const page = await client.entities.Part.filter(query, { limit: 100, cursor });
      page.items.forEach(part => found.set(part.id, part));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);
  }
  const parts = [...found.values()];
  return items.map(item => {
    const stored = [item.app_part_number, item.part_number].find(v => /^APP-/i.test(String(v || '').trim()));
    if (stored) return { part_id: item.part_id || '', app_part_number: stored.trim() };
    const codes = [item.part_number, item.app_part_number].filter(Boolean);
    const matches = item.part_id ? parts.filter(p => p.id === item.part_id) : parts.filter(p => fields.some(f => codes.includes(p[f])));
    const part = matches.length === 1 ? matches[0] : null;
    return { part_id: part?.id || '', app_part_number: /^APP-/i.test(part?.app_part_number || '') ? part.app_part_number : '' };
  });
}