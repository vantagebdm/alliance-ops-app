import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function GmailTest() {
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const testWebhook = async () => {
    try {
      setStatus('Testing webhook...');
      addLog('Simulating Gmail webhook with test message IDs');
      
      const res = await base44.functions.invoke('processGmailMessage', {
        data: {
          has_new_messages: true,
          new_message_ids: [], // Empty for now, will populate with real IDs
        },
      });

      addLog(`Webhook test result: ${JSON.stringify(res.data)}`);
      setStatus('Webhook test complete');
    } catch (error) {
      addLog(`Error: ${error.message}`);
      setStatus(`Error: ${error.message}`);
    }
  };

  const checkEnquiries = async () => {
    try {
      setStatus('Checking enquiries...');
      addLog('Fetching all enquiries from database');
      
      const enquiries = await base44.entities.Enquiry.list('-created_date', 50);
      addLog(`Found ${enquiries.length} enquiries`);
      
      const unreadCount = enquiries.filter(e => e.is_unread).length;
      addLog(`Unread enquiries: ${unreadCount}`);
      
      enquiries.forEach((e) => {
        addLog(`- ${e.enquiry_number}: ${e.customer_name} (${e.email_sender_address || e.customer_email})`);
      });

      setStatus(`${enquiries.length} enquiries found`);
    } catch (error) {
      addLog(`Error: ${error.message}`);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gmail Integration Test</h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Send a test email to: <code className="bg-muted px-2 py-1 rounded">info@alliancepartsgroup.com.au</code>
            </p>
            <p className="text-sm text-muted-foreground">
              It should automatically appear in the Enquiries section as an unread entry.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={testWebhook} variant="outline">
              Test Webhook
            </Button>
            <Button onClick={checkEnquiries}>
              Check Enquiries
            </Button>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-semibold mb-2">Status: {status}</p>
            <div className="text-xs space-y-1 max-h-64 overflow-y-auto font-mono">
              {logs.map((log, i) => (
                <div key={i} className="text-muted-foreground">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}