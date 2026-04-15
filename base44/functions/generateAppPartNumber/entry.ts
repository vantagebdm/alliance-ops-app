import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, app_part_number_override } = await req.json();

    if (!category) {
      return Response.json({ error: 'category required' }, { status: 400 });
    }

    // If override is provided and user is admin, validate and return it
    if (app_part_number_override) {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Only admins can override part numbers' }, { status: 403 });
      }

      // Validate override format
      if (!app_part_number_override.startsWith('APP-')) {
        return Response.json({ error: 'Override must start with APP- prefix' }, { status: 400 });
      }

      // Check for duplicates
      const existing = await base44.asServiceRole.entities.Part.filter({ app_part_number: app_part_number_override });
      if (existing.length > 0) {
        return Response.json({ error: 'APP internal part number already exists', code: 'DUPLICATE_NUMBER' }, { status: 409 });
      }

      return Response.json({
        success: true,
        app_part_number: app_part_number_override,
        generated: false
      });
    }

    // Get numbering config for this category
    const configs = await base44.asServiceRole.entities.PartNumbering.filter({ category });

    if (configs.length === 0) {
      return Response.json({ error: `No numbering config found for category: ${category}` }, { status: 404 });
    }

    const config = configs[0];

    if (!config.is_active) {
      return Response.json({ error: `Numbering config is inactive for category: ${category}` }, { status: 400 });
    }

    // Get all parts in this category to find the highest sequence
    const existingParts = await base44.asServiceRole.entities.Part.filter({ category });

    let nextSequence = config.current_sequence + 1;

    // Find the highest sequence number used in this category
    if (existingParts.length > 0) {
      const sequences = existingParts
        .filter(p => p.app_part_number)
        .map(p => {
          const match = p.app_part_number.match(/(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        });

      if (sequences.length > 0) {
        nextSequence = Math.max(...sequences) + 1;
      }
    }

    // Generate the part number
    const padding = config.number_padding || 4;
    const sequenceStr = String(nextSequence).padStart(padding, '0');
    const newPartNumber = `${config.prefix}${sequenceStr}`;

    // Update the config with new sequence
    await base44.asServiceRole.entities.PartNumbering.update(config.id, {
      current_sequence: nextSequence
    });

    return Response.json({
      success: true,
      app_part_number: newPartNumber,
      sequence: nextSequence,
      generated: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});