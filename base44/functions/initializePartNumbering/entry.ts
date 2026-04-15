import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const categoryMap = {
      engine: 'APP-ENG',
      transmission: 'APP-TRM',
      brakes: 'APP-BRK',
      suspension: 'APP-SUS',
      electrical: 'APP-ELE',
      body: 'APP-BDY',
      filters: 'APP-FLT',
      hydraulic: 'APP-HYD',
      driveline: 'APP-DRV',
      cooling: 'APP-CLG',
      fuel: 'APP-FUL',
      tyres: 'APP-TYR',
      oils: 'APP-OIL',
      sprays: 'APP-SPR',
      consumables: 'APP-CON',
      compliance: 'APP-COM',
      chemicals: 'APP-CHM',
      other: 'APP-OTH'
    };

    const configs = [];
    let created = 0;
    let skipped = 0;

    for (const [category, prefix] of Object.entries(categoryMap)) {
      // Check if config already exists
      const existing = await base44.asServiceRole.entities.PartNumbering.filter({ category });

      if (existing.length === 0) {
        configs.push({
          category,
          prefix,
          current_sequence: 0,
          number_padding: 4,
          is_active: true,
          allow_manual_override: false
        });
        created++;
      } else {
        skipped++;
      }
    }

    if (configs.length > 0) {
      await base44.asServiceRole.entities.PartNumbering.bulkCreate(configs);
    }

    return Response.json({
      success: true,
      message: `Part numbering initialized: ${created} created, ${skipped} already exist`,
      created,
      skipped
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});