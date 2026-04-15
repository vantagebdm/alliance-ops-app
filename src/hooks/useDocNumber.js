import { base44 } from "@/api/base44Client";

/**
 * Generate a formatted document number and increment the sequence.
 * @param {string} documentType - e.g. "quote", "sales_order", "purchase_order"
 * @param {string} [subtype] - e.g. "parts", "company_expense" for purchase_order
 * @returns {Promise<string>} formatted document number e.g. "Q-00001"
 */
export async function generateDocNumber(documentType, subtype = null) {
  // Find the matching config
  let configs;
  if (subtype) {
    configs = await base44.entities.DocNumbering.filter({ document_type: documentType, subtype });
  } else {
    configs = await base44.entities.DocNumbering.filter({ document_type: documentType });
    // Exclude subtype configs if we're not looking for one
    configs = configs.filter(c => !c.subtype);
  }

  if (!configs || configs.length === 0) {
    // Fallback: return a timestamp-based number if config missing
    return `${documentType.toUpperCase().slice(0, 2)}-${Date.now().toString(36).toUpperCase()}`;
  }

  const config = configs[0];
  const seq = config.current_sequence || 1;
  const padding = config.number_padding || 5;
  const padded = String(seq).padStart(padding, "0");
  const docNumber = `${config.prefix}${padded}`;

  // Increment sequence
  await base44.entities.DocNumbering.update(config.id, {
    current_sequence: seq + 1,
  });

  return docNumber;
}