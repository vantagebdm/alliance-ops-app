import { base44 } from "@/api/base44Client";

export const supplierPartNumber = (item) => String(item.supplier_sku || "").trim();

export default async function resolveSupplierItems(items = []) {
  const unresolved = items.filter(item => !supplierPartNumber(item) && (item.part_id || item.part_number || item.app_part_number));
  if (!unresolved.length) return items;
  const fields = ["id", "part_number", "app_part_number", "supplier_sku", "oem_number"];
  const codes = [...new Set(unresolved.flatMap(item => [item.part_id, item.part_number, item.app_part_number]).filter(Boolean))];
  const batches = [[]];
  let size = 0;
  for (const code of codes) {
    const length = encodeURIComponent(code).length;
    if (size + length > 600 && batches.at(-1).length) { batches.push([]); size = 0; }
    batches.at(-1).push(code);
    size += length;
  }
  const found = new Map();
  for (const batch of batches.filter(batch => batch.length)) {
    let cursor;
    do {
      const page = await base44.entities.Part.filter({ $or: fields.map(field => ({ [field]: { $in: batch } })) }, { limit: 100, cursor });
      page.items.forEach(part => found.set(part.id, part));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);
  }
  return items.map(item => {
    if (supplierPartNumber(item)) return item;
    const codes = [item.part_number, item.app_part_number].filter(Boolean);
    const matches = [...found.values()].filter(part => item.part_id ? part.id === item.part_id : fields.slice(1).some(field => codes.includes(part[field])));
    const part = matches.length === 1 ? matches[0] : null;
    return { ...item, supplier_sku: part ? supplierPartNumber(part) : "", ...(part ? { part_id: part.id } : {}) };
  });
}