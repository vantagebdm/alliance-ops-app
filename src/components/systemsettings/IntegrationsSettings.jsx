import { useState } from "react";
import { RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

const STATUS_CONFIG = {
  "Connected":      { cls: "text-green-400",  badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  "Not Connected":  { cls: "text-white/20",   badge: "bg-[hsl(0,0%,16%)] text-white/30 border-[hsl(0,0%,22%)]" },
  "Error":          { cls: "text-red-400",    badge: "bg-red-500/10 text-red-400 border-red-500/20" },
  "Disabled":       { cls: "text-white/20",   badge: "bg-[hsl(0,0%,14%)] text-white/20 border-[hsl(0,0%,18%)]" },
};

const StatusIcon = ({ status }) => {
  if (status === "Connected")     return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  if (status === "Error")         return <AlertCircle className="w-4 h-4 text-red-400" />;
  if (status === "Disabled")      return <MinusCircle className="w-4 h-4 text-white/20" />;
  return <XCircle className="w-4 h-4 text-white/20" />;
};

const INTEGRATIONS = [
  { id: "accounting",      category: "Accounting",  name: "MYOB / Xero Integration",              status: "Not Connected", sync: "—",         last_sync: "—",                   api_key: "" },
  { id: "bank_feed",       category: "Banking",     name: "Bank Feed (ANZ / CommBank)",            status: "Not Connected", sync: "Daily",     last_sync: "—",                   api_key: "" },
  { id: "email_service",   category: "Email",       name: "Email Service (SendGrid / SMTP)",       status: "Connected",     sync: "Real-time", last_sync: "2026-04-25 09:00",    api_key: "sg_live_••••••••••••" },
  { id: "sms",             category: "SMS",         name: "SMS Service (Twilio)",                  status: "Not Connected", sync: "—",         last_sync: "—",                   api_key: "" },
  { id: "supplier_api",    category: "Supplier",    name: "Supplier Price Feed API",               status: "Not Connected", sync: "Daily",     last_sync: "—",                   api_key: "" },
  { id: "freight_api",     category: "Freight",     name: "Freight Carrier API (Toll / StarTrack)",status: "Not Connected", sync: "—",         last_sync: "—",                   api_key: "" },
  { id: "payment_gateway", category: "Payments",    name: "Payment Gateway (Stripe)",              status: "Not Connected", sync: "—",         last_sync: "—",                   api_key: "" },
  { id: "ocr",             category: "AI & OCR",    name: "OCR Invoice Scanning",                  status: "Disabled",      sync: "On demand", last_sync: "—",                   api_key: "" },
  { id: "ai_risk",         category: "AI & OCR",    name: "AI Risk Scoring",                       status: "Connected",     sync: "On demand", last_sync: "2026-04-25 08:45",    api_key: "ai_••••••••••••" },
];

const groupBy = (arr, key) => arr.reduce((acc, item) => {
  const group = item[key];
  if (!acc[group]) acc[group] = [];
  acc[group].push(item);
  return acc;
}, {});

export default function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [showKeys, setShowKeys] = useState({});
  const [testing, setTesting] = useState({});

  const toggleEnabled = (id) => setIntegrations(list => list.map(i =>
    i.id === id ? { ...i, status: i.status === "Disabled" ? "Not Connected" : "Disabled" } : i
  ));

  const testConnection = (id) => {
    setTesting(t => ({ ...t, [id]: true }));
    setTimeout(() => setTesting(t => ({ ...t, [id]: false })), 1500);
  };

  const grouped = groupBy(integrations, "category");

  return (
    <div className="space-y-4 max-w-5xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Integrations</h2>
      <div className="p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400 font-heading uppercase">⚠ Integration API keys are masked after saving. Changes to API keys require MFA verification and are recorded in the audit log.</p>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,9%)] px-4 py-2.5 border-b border-[hsl(0,0%,16%)]">
              <span className="font-heading text-[9px] uppercase tracking-widest text-white/30">{cat}</span>
            </div>
            {items.map(intg => {
              const cfg = STATUS_CONFIG[intg.status] || STATUS_CONFIG["Not Connected"];
              return (
                <div key={intg.id} className="px-4 py-4 border-b border-[hsl(0,0%,14%)] last:border-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon status={intg.status} />
                        <span className="text-sm font-heading text-white uppercase tracking-wide">{intg.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-heading uppercase border ${cfg.badge}`}>{intg.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-white/30">
                        <span>Sync: {intg.sync}</span>
                        <span>Last sync: {intg.last_sync}</span>
                      </div>
                      {intg.api_key && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-heading uppercase text-white/30">API Key:</span>
                          <span className="font-mono text-[10px] text-white/50">
                            {showKeys[intg.id] ? intg.api_key : "••••••••••••••••"}
                          </span>
                          <button
                            onClick={() => setShowKeys(k => ({ ...k, [intg.id]: !k[intg.id] }))}
                            className="text-white/20 hover:text-white"
                          >
                            {showKeys[intg.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => testConnection(intg.id)}
                        disabled={testing[intg.id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase bg-[hsl(0,0%,14%)] border border-[hsl(0,0%,22%)] text-white/50 hover:text-white transition-all"
                      >
                        <RefreshCw className={`w-3 h-3 ${testing[intg.id] ? "animate-spin text-primary" : ""}`} />
                        {testing[intg.id] ? "Testing..." : "Test"}
                      </button>
                      <button
                        onClick={() => toggleEnabled(intg.id)}
                        className={`px-3 py-1.5 rounded-sm text-[10px] font-heading uppercase border transition-all ${
                          intg.status === "Disabled"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {intg.status === "Disabled" ? "Enable" : "Disable"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}