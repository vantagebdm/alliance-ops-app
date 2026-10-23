import { base44 } from "@/api/base44Client";

export const salesPartNumber = (item) => {
  const value = [item.app_part_number, item.part_number].find(v => /^APP-/i.test(String(v || "").trim()));
  return value ? String(value).trim() : "";
};

export default async function resolveSalesItems(items = [], { strict = false } = {}) {
  const unresolved = items.filter(i => !salesPartNumber(i) && (i.part_id || i.part_number || i.app_part_number));
  if (!unresolved.length) return items.map(i => ({ ...i, app_part_number: salesPartNumber(i) }));
  const response = await base44.functions.invoke("resolveSalesPartNumbers", {
    items: unresolved.map(i => ({ part_id: i.part_id, part_number: i.part_number, app_part_number: i.app_part_number })),
  });
  let index = 0;
  return items.map((item, line) => {
    const needsLookup = !salesPartNumber(item) && (item.part_id || item.part_number || item.app_part_number);
    const resolved = needsLookup ? response.data.items[index++] : null;
    const appNumber = salesPartNumber(item) || resolved?.app_part_number || "";
    if (strict && needsLookup && !appNumber) throw new Error(`Line ${line + 1} has no unique APP number. Select the correct part and assign its APP number in Parts Master before generating this document.`);
    return { ...item, part_number: item.part_number || (!salesPartNumber(item) ? item.app_part_number || "" : ""), ...(resolved?.part_id ? { part_id: resolved.part_id } : {}), app_part_number: appNumber };
  });
}