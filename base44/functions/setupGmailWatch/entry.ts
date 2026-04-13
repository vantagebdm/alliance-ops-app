import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Call this function ONCE to set up Gmail watch on the app's inbox
// After calling, Gmail will send push notifications for new messages

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Set up watch on the primary inbox
    const watchRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/watch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        labelIds: ['INBOX'],
        topicName: 'projects/base44-integrations/topics/webhook',
      }),
    });

    if (!watchRes.ok) {
      const error = await watchRes.text();
      console.error('Watch setup failed:', error);
      return Response.json({ error: 'Failed to set up Gmail watch', details: error }, { status: 500 });
    }

    const watchData = await watchRes.json();
    console.log('Gmail watch established:', JSON.stringify(watchData, null, 2));

    return Response.json({
      success: true,
      message: 'Gmail inbox watch activated. New emails will be synced automatically.',
      historyId: watchData.historyId,
      expiration: watchData.expiration,
    });
  } catch (error) {
    console.error('Error setting up Gmail watch:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});