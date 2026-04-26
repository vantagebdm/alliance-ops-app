import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STORAGE_KEY = "app_notification_settings";

// Maps Notification.type to the key used in the notification settings
const TYPE_TO_SETTINGS_KEY = {
  stock_low: 'low_stock',
  stock_out: 'negative_stock',
  stock_reorder: 'reorder_required',
  stock_critical: 'negative_stock',
  po_approval: 'po_approval',
  approval_required: 'po_approval',
  credit_limit_exceeded: 'credit_exceeded',
  invoice_overdue: 'overdue_invoice',
  account_on_hold: 'account_suspended',
  dispatch_delayed: 'dispatch_overdue',
  account_suspended: 'account_suspended',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const notification = payload.data;
    if (!notification) {
      return Response.json({ skipped: 'no data' });
    }

    // Load notification settings from the AppSettings entity (persisted server-side)
    let settings = null;
    try {
      const settingRecords = await base44.asServiceRole.entities.AppSettings.filter({ key: STORAGE_KEY });
      if (settingRecords && settingRecords.length > 0) {
        settings = JSON.parse(settingRecords[0].value);
      }
    } catch (_) {
      // No settings found, use defaults - email disabled by default
    }

    if (!settings) {
      return Response.json({ skipped: 'no notification settings configured' });
    }

    // Check if email channel is globally enabled
    if (!settings.channels?.email) {
      return Response.json({ skipped: 'email channel disabled' });
    }

    // Find the settings key for this notification type
    const settingsKey = TYPE_TO_SETTINGS_KEY[notification.type];
    if (!settingsKey) {
      // Unknown type — check if priority is urgent/critical and email is globally on
      if (!['urgent', 'critical'].includes(notification.priority)) {
        return Response.json({ skipped: `unknown type: ${notification.type}` });
      }
    } else {
      // Check if this specific notification type has email enabled
      if (!settings.notifications?.[settingsKey]?.email) {
        return Response.json({ skipped: `email disabled for ${settingsKey}` });
      }
    }

    const notifEmail = settings.notifEmail;
    if (!notifEmail) {
      return Response.json({ skipped: 'no notification email configured' });
    }

    // Send the email
    const res = await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
      notification,
      notifEmail,
    });

    return Response.json({ success: true, sentTo: notifEmail, notificationType: notification.type });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});