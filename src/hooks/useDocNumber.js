import { base44 } from "@/api/base44Client";

// Maps document types to their entity and number field for duplicate checking
const DOC_ENTITY_MAP = {
  quote: { entity: "Quote", field: "quote_number" },
  sales_order: { entity: "SalesOrder", field: "order_number" },
  invoice: { entity: "Invoice", field: "invoice_number" },
  purchase_order: { entity: "PurchaseOrder", field: "po_number" },
  credit_return: { entity: "CreditReturn", field: "credit_number" },
  warranty: { entity: "Warranty", field: "claim_number" },
  goods_receipt: { entity: "GoodsReceipt", field: "grn_number" },
  stock_adjustment: { entity: "StockAdjustment", field: "adjustment_number" },
  stocktake: { entity: "Stocktake", field: "stocktake_number" },
  stock_transfer: { entity: "StockTransfer", field: "transfer_number" },
  stock_movement: { entity: "StockMovement", field: "movement_number" },
};

/**
 * Check if a document number already exists in the database.
 */
export async function checkDocNumberExists(documentType, number, excludeId = null) {
  const mapping = DOC_ENTITY_MAP[documentType];
  if (!mapping || !number) return false;
  try {
    const results = await base44.entities[mapping.entity].filter({ [mapping.field]: number });
    if (excludeId) return results.some(r => r.id !== excludeId);
    return results.length > 0;
  } catch {
    return false;
  }
}

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
 * If preferredNumber is provided, tries to use it (after duplicate check).
 * Always checks the database for duplicates and skips to the next available.
 *
 * @param {string} documentType - e.g. "quote", "sales_order", "purchase_order"
 * @param {string} [subtype] - e.g. "parts", "company_expense" for purchase_order
 * @param {string} [preferredNumber] - A preview number already shown to the user
 * @returns {Promise<string>} formatted document number e.g. "Q-00001"
 */
export async function generateDocNumber(documentType, subtype = null, preferredNumber = null) {
  const config = await getDocNumberConfig(documentType, subtype);

  if (!config) {
    return preferredNumber || `${documentType.toUpperCase().slice(0, 2)}-${Date.now().toString(36).toUpperCase()}`;
  }

  const padding = config.number_padding || 5;
  const prefix = config.prefix;

  // If a preferred number is provided, try to use it (keeps the number the user saw)
  if (preferredNumber) {
    const exists = await checkDocNumberExists(documentType, preferredNumber);
    if (!exists) {
      // Advance the sequence past the preferred number's sequence
      const seqMatch = preferredNumber.match(/(\d+)$/);
      if (seqMatch) {
        const preferredSeq = parseInt(seqMatch[1], 10);
        if (preferredSeq >= (config.current_sequence || 1)) {
          await base44.entities.DocNumbering.update(config.id, {
            current_sequence: preferredSeq + 1,
          });
        }
      }
      return preferredNumber;
    }
  }

  // Generate the next available number, skipping any that already exist in the DB
  let seq = config.current_sequence || 1;
  let docNumber;
  let attempts = 0;

  do {
    docNumber = `${prefix}${String(seq).padStart(padding, "0")}`;
    const exists = await checkDocNumberExists(documentType, docNumber);
    if (!exists) break;
    seq++;
    attempts++;
  } while (attempts < 200);

  await base44.entities.DocNumbering.update(config.id, {
    current_sequence: seq + 1,
  });

  return docNumber;
}