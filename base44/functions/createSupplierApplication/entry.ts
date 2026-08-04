import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function buildMimeMessage(to, subject, htmlBody, fromEmail) {
  const boundary = `boundary_${Date.now()}`;
  const lines = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    htmlBody,
    `--${boundary}--`,
  ];
  return btoa(unescape(encodeURIComponent(lines.join('\r\n'))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Normalise a supplier name for fuzzy matching: uppercase, strip legal suffixes & punctuation
function normaliseName(s) {
  return (s || '')
    .toUpperCase()
    .replace(/PTY\.?\s*LTD\.?|PTY\.?\s*LIMITED|LIMITED|PTY\.?|LTD\.?|\(P\/L\)|\(PTY\)/g, ' ')
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function(req) {
  try {
    const body = await req.json();

    // Application number: SA-YYYY-NNN
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(Math.floor(Date.now() / 1000) % 1000).padStart(3, '0');
    const applicationNumber = `SA-${year}-${seq}`;

    const base44 = createClientFromRequest(req);

    // Build the application record — field names mirror the Supplier entity for direct merge
    const appFields = {
      application_number: applicationNumber,
      submitted_at: now.toISOString(),
      status: 'submitted',
      supplier_type: body.supplier_type || 'company',
      name: body.name || '',
      trading_name: body.trading_name || '',
      abn: body.abn || '',
      acn: body.acn || '',
      date_established: body.date_established || '',
      nature_of_business: body.nature_of_business || '',
      address: body.address || '',
      city: body.city || '',
      state: body.state || '',
      postcode: body.postcode || '',
      country: body.country || 'Australia',
      warehouse_address: body.warehouse_address || '',
      warehouse_city: body.warehouse_city || '',
      warehouse_state: body.warehouse_state || '',
      warehouse_postcode: body.warehouse_postcode || '',
      phone: body.phone || '',
      email: body.email || '',
      website: body.website || '',
      contact_person: body.contact_person || '',
      contact_position: body.contact_position || '',
      contact_phone: body.contact_phone || '',
      contact_mobile: body.contact_mobile || '',
      contact_email: body.contact_email || '',
      accounts_contact_name: body.accounts_contact_name || '',
      accounts_phone: body.accounts_phone || '',
      accounts_email: body.accounts_email || '',
      statement_email: body.statement_email || '',
      invoice_email: body.invoice_email || '',
      returns_email: body.returns_email || '',
      additional_contacts: Array.isArray(body.additional_contacts) ? body.additional_contacts : [],
      afterhours_contact: body.afterhours_contact || '',
      breakdown_contact: body.breakdown_contact || '',
      business_hours: body.business_hours || '',
      sales_territory: body.sales_territory || '',
      payment_terms: body.payment_terms || '',
      credit_limit: body.credit_limit || '',
      currency: body.currency || 'AUD',
      gst_registered: body.gst_registered !== false,
      account_number: body.account_number || '',
      pricing_basis: body.pricing_basis || '',
      accepts_credit_card: !!body.accepts_credit_card,
      card_surcharge: body.card_surcharge || '',
      rebate_agreement: !!body.rebate_agreement,
      volume_agreement: !!body.volume_agreement,
      discount_notes: body.discount_notes || '',
      special_contract_terms: body.special_contract_terms || '',
      bank_name: body.bank_name || '',
      bank_account_name: body.bank_account_name || '',
      bank_bsb: body.bank_bsb || '',
      bank_account_number: body.bank_account_number || '',
      purchase_method: body.purchase_method || '',
      orders_email: body.orders_email || '',
      portal_url: body.portal_url || '',
      portal_username: body.portal_username || '',
      cutoff_time: body.cutoff_time || '',
      lead_time_standard: body.lead_time_standard ? Number(body.lead_time_standard) : undefined,
      lead_time_express: body.lead_time_express ? Number(body.lead_time_express) : undefined,
      min_order_value: body.min_order_value || '',
      ships_karratha: !!body.ships_karratha,
      ships_pilbara: !!body.ships_pilbara,
      emergency_supply: !!body.emergency_supply,
      price_file_available: !!body.price_file_available,
      freight_account_option: body.freight_account_option || '',
      freight_notes: body.freight_notes || '',
      returns_accepted: !!body.returns_accepted,
      rma_required: !!body.rma_required,
      core_exchange: !!body.core_exchange,
      return_window: body.return_window || '',
      restocking_fee: body.restocking_fee || '',
      returns_contact: body.returns_contact || '',
      warranty_claim_notes: body.warranty_claim_notes || '',
      dangerous_goods_notes: body.dangerous_goods_notes || '',
      categories_supplied: Array.isArray(body.categories_supplied) ? body.categories_supplied : [],
      brands_supplied: Array.isArray(body.brands_supplied) ? body.brands_supplied : [],
      oem_aftermarket: body.oem_aftermarket || '',
      pricing_notes: body.pricing_notes || '',
      declaration_name: body.declaration_name || '',
      declaration_position: body.declaration_position || '',
      declaration_date: body.declaration_date || '',
    };

    // Remove undefined values so the schema stays clean
    Object.keys(appFields).forEach(k => appFields[k] === undefined && delete appFields[k]);

    const application = await base44.asServiceRole.entities.SupplierApplication.create(appFields);

    // Match against existing On Hold suppliers by name
    let matched = null;
    try {
      const onHold = await base44.asServiceRole.entities.Supplier.filter({ status: 'on_hold' }, null, 500);
      const target = normaliseName(appFields.name);
      for (const s of onHold) {
        const cand = normaliseName(s.name) || normaliseName(s.trading_name);
        if (!cand) continue;
        if (cand === target || cand.includes(target) || target.includes(cand)) {
          matched = s;
          break;
        }
      }
    } catch (matchErr) {
      // Non-fatal
    }

    let matchStatus = 'submitted';
    if (matched) {
      matchStatus = 'matched';
      try {
        await base44.asServiceRole.entities.SupplierApplication.update(application.id, {
          status: 'matched',
          matched_supplier_id: matched.id,
          matched_supplier_name: matched.name,
        });
      } catch (uErr) {
        // Non-fatal
      }

      // In-app notification for the Suppliers page
      try {
        await base44.asServiceRole.entities.Notification.create({
          type: 'system',
          category: 'admin',
          priority: 'important',
          title: `Supplier Application Matched — ${appFields.name}`,
          description: `Online application ${applicationNumber} matches On Hold supplier "${matched.name}". Confirm to populate supplier details.`,
          entity_type: 'SupplierApplication',
          entity_id: application.id,
          entity_ref: applicationNumber,
          is_read: false,
          is_dismissed: false,
          is_pinned: false,
          escalated: false,
          action_url: '/suppliers',
        });
      } catch (notifErr) {
        // Non-fatal
      }
    } else {
      // No match — still notify that a new application arrived
      try {
        await base44.asServiceRole.entities.Notification.create({
          type: 'system',
          category: 'admin',
          priority: 'normal',
          title: `New Supplier Application — ${appFields.name}`,
          description: `Online application ${applicationNumber} received. No matching On Hold supplier found yet.`,
          entity_type: 'SupplierApplication',
          entity_id: application.id,
          entity_ref: applicationNumber,
          is_read: false,
          is_dismissed: false,
          is_pinned: false,
          escalated: false,
          action_url: '/suppliers',
        });
      } catch (notifErr) {
        // Non-fatal
      }
    }

    // Email the completed form to the internal accounts team (non-fatal)
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await profileRes.json();
      const fromEmail = profile.emailAddress;

      const cats = (appFields.categories_supplied || []).join(', ') || '—';
      const brands = (appFields.brands_supplied || []).join(', ') || '—';
      const matchedLine = matched
        ? `<tr><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Matched On Hold Supplier</td><td style="padding:9px 14px;font-weight:bold;color:#16a34a;">${matched.name} — ready to confirm</td></tr>`
        : `<tr><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Match Status</td><td style="padding:9px 14px;color:#d97706;">No matching On Hold supplier — create one to proceed</td></tr>`;

      const emailBody = `
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#fff;color:#111;border-radius:8px;border:1px solid #e0e0e0;overflow:hidden;">
  <div style="background:#0f0f0f;padding:24px 28px;">
    <h2 style="color:#fff;font-size:20px;margin:0 0 4px 0;letter-spacing:1px;">SUPPLIER ACCOUNT APPLICATION</h2>
    <p style="color:#aaa;margin:0;font-size:13px;">Alliance Priority Parts — Online Submission</p>
  </div>
  <div style="padding:24px 28px;">
    <table style="width:100%;font-size:14px;margin-bottom:18px;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:6px;">
      <tr style="background:#f3f4f6;"><td style="padding:9px 14px;color:#666;width:170px;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Application No.</td><td style="padding:9px 14px;font-weight:bold;">${applicationNumber}</td></tr>
      <tr><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Legal Name</td><td style="padding:9px 14px;font-weight:600;">${appFields.name || '—'}</td></tr>
      <tr style="background:#f3f4f6;"><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Trading Name</td><td style="padding:9px 14px;">${appFields.trading_name || '—'}</td></tr>
      <tr><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">ABN / ACN</td><td style="padding:9px 14px;">${appFields.abn || '—'} / ${appFields.acn || '—'}</td></tr>
      <tr style="background:#f3f4f6;"><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Phone / Email</td><td style="padding:9px 14px;">${appFields.phone || '—'} · ${appFields.email || '—'}</td></tr>
      <tr><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Sales Contact</td><td style="padding:9px 14px;">${appFields.contact_person || '—'} (${appFields.contact_email || '—'})</td></tr>
      <tr style="background:#f3f4f6;"><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Payment Terms</td><td style="padding:9px 14px;">${appFields.payment_terms || '—'}</td></tr>
      <tr><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Categories</td><td style="padding:9px 14px;">${cats}</td></tr>
      <tr style="background:#f3f4f6;"><td style="padding:9px 14px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Brands</td><td style="padding:9px 14px;">${brands}</td></tr>
      ${matchedLine}
    </table>
    <p style="margin:0;font-size:13px;color:#555;">Log in to Alliance Priority Parts → Suppliers to review and confirm this application.</p>
    <p style="margin:6px 0 0 0;font-size:13px;color:#555;">🔗 <a href="https://alliance-core-ops.base44.app/suppliers" style="color:#16a34a;">Open Suppliers →</a></p>
  </div>
  <div style="background:#f3f4f6;padding:14px 28px;font-size:11px;color:#aaa;border-top:1px solid #e5e5e5;">Alliance Priority Parts — Automated notification from Supplier Application Portal</div>
</div>`;

      const subject = `New Supplier Application ${applicationNumber} — ${appFields.name}`;
      const raw = buildMimeMessage('accounts@alliancepartsgroup.com.au', subject, emailBody, fromEmail);
      await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      });
    } catch (emailErr) {
      // Non-fatal — submission still succeeds
    }

    return Response.json({
      success: true,
      application_number: applicationNumber,
      application_id: application.id,
      status: matchStatus,
      matched_supplier_id: matched ? matched.id : null,
      matched_supplier_name: matched ? matched.name : null,
      submitted_at: now.toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}