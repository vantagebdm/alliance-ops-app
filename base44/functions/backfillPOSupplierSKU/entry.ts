import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all purchase orders
    const allPOs = await base44.asServiceRole.entities.PurchaseOrder.list();

    let updatedCount = 0;

    // Process each PO
    for (const po of allPOs) {
      if (!po.items || po.items.length === 0) continue;

      let hasChanges = false;
      const updatedItems = await Promise.all(
        po.items.map(async (item) => {
          // Skip if supplier_sku already exists
          if (item.supplier_sku) return item;

          // Fetch part details to get supplier_sku
          if (item.part_number) {
            try {
              const parts = await base44.asServiceRole.entities.Part.filter({ part_number: item.part_number });
              if (parts.length > 0) {
                hasChanges = true;
                return { ...item, supplier_sku: parts[0].supplier_sku || "" };
              }
            } catch (e) {
              console.log(`Could not fetch part ${item.part_number}:`, e.message);
            }
          }

          return item;
        })
      );

      // Update PO if changes were made
      if (hasChanges) {
        await base44.asServiceRole.entities.PurchaseOrder.update(po.id, { items: updatedItems });
        updatedCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Updated ${updatedCount} purchase orders with supplier SKU`,
      poCount: allPOs.length,
      updatedCount
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});