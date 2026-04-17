import { base44 } from "@/api/base44Client";

/**
 * Preview the next document number WITHOUT incrementing the sequence.
 */
async function getDocNumberConfig(documentType, subtype = null) {
  let configs;
  if (subtype) {
    configs = await base44.entities.DocNumbering.filter({ document_type: documentType, subtype });
  } else {
    configs = await base44.entities.DocNumbering.filter({ document_type: documentType });
    configs = configs.filter(c => !c.subtype);
  }
  return configs?.[0] || null;
}

export async function previewDocNumber(documentType, subtype = null) {
  const config = await getDocNumberConfig(documentType, subtype);
  if (!config) return null;
  const seq = config.current_sequence || 1;
  const padding = config.number_padding || 5;
  return `${config.prefix}${String(seq).padStart(padding, "0")}`;
}

/**
 * Generate a formatted document number and increment the sequence.
 * @param {string} documentType - e.g. "quote", "sales_order", "purchase_order"
 * @param {string} [subtype] - e.g. "parts", "company_expense" for purchase_order
 * @returns {Promise<string>} formatted document number e.g. "Q-00001"
 */
export async function generateDocNumber(documentType, subtype = null) {
  const config = await getDocNumberConfig(documentType, subtype);

  if (!config) {
    return `${documentType.toUpperCase().slice(0, 2)}-${Date.now().toString(36).toUpperCase()}`;
  }

  const seq = config.current_sequence || 1;
  const padding = config.number_padding || 5;
  const padded = String(seq).padStart(padding, "0");
  const docNumber = `${config.prefix}${padded}`;

  await base44.entities.DocNumbering.update(config.id, {
    current_sequence: seq + 1,
  });

  return docNumber;
}