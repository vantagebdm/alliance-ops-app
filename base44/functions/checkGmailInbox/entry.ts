import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Fallback function to manually poll Gmail inbox for testing
// Call this to sync past emails (last 24 hours) that may have been missed

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Search for emails in last 24 hours to info@alliancepartsgroup.com.au
    const query = 'to:info@alliancepartsgroup.com.au newer_than:1d';
    const searchRes = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!searchRes.ok) {
      return Response.json({ error: `Search failed: ${searchRes.status}` }, { status: 500 });
    }

    const searchData = await searchRes.json();
    const messageIds = searchData.messages?.map(m => m.id) || [];

    console.log(`Found ${messageIds.length} emails to info@alliancepartsgroup.com.au in last 24h`);

    if (messageIds.length === 0) {
      return Response.json({ message: 'No emails found in last 24 hours', count: 0 });
    }

    // Invoke the processor with these messages
    const processRes = await base44.asServiceRole.functions.invoke('processGmailMessage', {
      data: {
        has_new_messages: true,
        new_message_ids: messageIds,
      },
    });

    return Response.json({
      message: `Processed ${messageIds.length} emails`,
      result: processRes,
    });
  } catch (error) {
    console.error('Error checking inbox:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});