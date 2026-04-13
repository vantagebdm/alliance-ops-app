import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Parse email body (handle multipart, plain text, HTML)
function parseEmailBody(message) {
  const headers = message.payload.headers || [];
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const from = headers.find(h => h.name === 'From')?.value || '';
  const senderMatch = from.match(/"?([^"<]+)"?\s*<([^>]+)>/);
  const senderName = senderMatch?.[1]?.trim() || from;
  const senderEmail = senderMatch?.[2]?.trim() || from;

  let body = '';
  let attachments = [];

  // Extract text/html or text/plain from multipart
  const parsePayload = (payload) => {
    if (payload.mimeType?.startsWith('text/')) {
      const data = payload.body?.data;
      if (data) {
        body += Buffer.from(data, 'base64').toString('utf-8');
      }
    }

    if (payload.filename) {
      attachments.push({
        filename: payload.filename,
        mimetype: payload.mimeType,
        size: payload.body?.size || 0,
      });
    }

    // Recursively parse parts
    if (payload.parts) {
      payload.parts.forEach(parsePayload);
    }
  };

  parsePayload(message.payload);

  return {
    subject,
    body: body.substring(0, 10000), // Limit to 10k chars
    senderName,
    senderEmail,
    attachments,
  };
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    console.log('Gmail webhook received:', JSON.stringify(body, null, 2));
    const base44 = createClientFromRequest(req);
    const messageIds = body.data?.new_message_ids ?? [];
    console.log('New message IDs:', messageIds);

    if (messageIds.length === 0) {
      console.log('No new messages found');
      return Response.json({ processed: 0, message: 'No new message IDs' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    let processed = 0;

    for (const messageId of messageIds) {
      // Fetch full message
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!msgRes.ok) {
        console.log(`Failed to fetch message ${messageId}: ${msgRes.status}`);
        continue;
      }

      const message = await msgRes.json();
      const headers = message.payload.headers || [];

      // Only process emails to info@alliancepartsgroup.com.au
      const toHeader = headers.find(h => h.name === 'To')?.value || '';
      if (!toHeader.includes('info@alliancepartsgroup.com.au')) continue;

      const parsed = parseEmailBody(message);
      const { subject, body: emailBody, senderName, senderEmail, attachments } = parsed;
      console.log('Parsed email from', senderEmail, ':', subject);

      // Try to match existing customer by email
      let customer = null;
      const customers = await base44.asServiceRole.entities.Customer.filter(
        { email: senderEmail },
        null,
        1
      );
      if (customers.length > 0) {
        customer = customers[0];
      }

      // Build enquiry data
      const enquiryData = {
        enquiry_number: `ENQ-${messageId.substring(0, 8).toUpperCase()}`,
        customer_name: customer?.name || senderName,
        customer_email: senderEmail,
        company: customer?.company || '',
        part_description: subject,
        email_subject: subject,
        email_body: emailBody,
        email_thread_id: message.threadId,
        email_message_id: messageId,
        email_sender_name: senderName,
        email_sender_address: senderEmail,
        source: 'email',
        status: 'unread',
        is_unread: true,
        attachments: attachments.length > 0 ? attachments : [],
        quantity: 1,
        urgency: subject.toLowerCase().includes('urgent') || subject.toLowerCase().includes('breakdown') ? 'urgent' : 'standard',
      };

      // Check if enquiry already exists for this message
      const existing = await base44.asServiceRole.entities.Enquiry.filter(
        { email_message_id: messageId },
        null,
        1
      );

      if (existing.length === 0) {
        const created = await base44.asServiceRole.entities.Enquiry.create(enquiryData);
        console.log('Created enquiry:', enquiryData.enquiry_number);
        processed++;
      } else {
        console.log('Enquiry already exists for message', messageId);
      }
    }

    return Response.json({ processed, total: messageIds.length });
  } catch (error) {
    console.error('Error processing Gmail:', error);
    console.error('Stack:', error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});