import { useState } from "react";
import { Shield, Lock, Clock, AlertTriangle, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Toggle({ value, onChange, label, desc, warning }) {
  return (
    <div className={`flex items-start justify-between px-4 py-3.5 border-b border-[hsl(0,0%,14%)] last:border-0 ${warning && value ? "bg-yellow-500/3" : ""}`}>
      <div className="flex-1 mr-4">
        <p className="text-xs font-heading uppercase tracking-wider text-white">{label}</p>
        {desc && <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>}
        {warning && value && <p className="text-[10px] text-yellow-400/70 mt-0.5">⚠ {warning}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 mt-0.5 ${value ? "bg-primary" : "bg-[hsl(0,0%,25%)]"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function SecuritySettingsTab() {
  const [settings, setSettings] = useState({
    force_mfa: false,
    password_expiry_days: 90,
    session_timeout_minutes: 60,
    disable_after_inactive_days: 90,
    login_lockout_attempts: 5,
    allowed_login_hours_enabled: false,
    allowed_login_start: "07:00",
    allowed_login_end: "20:00",
    require_reauth_supplier_bank: true,
    require_reauth_employee_bank: true,
    require_reauth_payroll: true,
    require_reauth_bas: true,
    require_reauth_bank_recon: true,
    require_reauth_credit_limit: false,
    require_reauth_permissions: true,
    ip_restriction_enabled: false,
    show_inactive_after_days: 30,
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm uppercase tracking-wider text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Security Settings
        </h3>
        <Button onClick={handleSave}
          className={`rounded-sm text-xs font-heading uppercase tracking-wider ${saved ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary text-black hover:bg-primary/90"}`}>
          <Save className="w-3.5 h-3.5 mr-1" /> {saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      {/* Authentication */}
      <Section title="Authentication" icon={<Lock className="w-4 h-4 text-primary" />}>
        <Toggle value={settings.force_mfa} onChange={v => set("force_mfa", v)}
          label="Force Multi-Factor Authentication"
          desc="Require all users to enable MFA on next login"
          warning="All users will be prompted to set up MFA" />
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[hsl(0,0%,14%)]">
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white">Password Expiry</p>
            <p className="text-[10px] text-white/30">Force password reset after N days (0 = never)</p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="number" value={settings.password_expiry_days} onChange={e => set("password_expiry_days", parseInt(e.target.value)||0)}
              className="w-20 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs text-right" />
            <span className="text-xs text-white/30 font-heading">days</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[hsl(0,0%,14%)]">
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white">Login Attempt Lockout</p>
            <p className="text-[10px] text-white/30">Lock account after N failed login attempts</p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="number" value={settings.login_lockout_attempts} onChange={e => set("login_lockout_attempts", parseInt(e.target.value)||5)}
              className="w-20 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs text-right" />
            <span className="text-xs text-white/30 font-heading">attempts</span>
          </div>
        </div>
      </Section>

      {/* Session */}
      <Section title="Session & Inactivity" icon={<Clock className="w-4 h-4 text-primary" />}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[hsl(0,0%,14%)]">
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white">Session Timeout</p>
            <p className="text-[10px] text-white/30">Auto-logout inactive users after N minutes</p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="number" value={settings.session_timeout_minutes} onChange={e => set("session_timeout_minutes", parseInt(e.target.value)||60)}
              className="w-20 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs text-right" />
            <span className="text-xs text-white/30 font-heading">min</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[hsl(0,0%,14%)]">
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white">Disable Inactive Users</p>
            <p className="text-[10px] text-white/30">Automatically disable users who haven't logged in for N days</p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="number" value={settings.disable_after_inactive_days} onChange={e => set("disable_after_inactive_days", parseInt(e.target.value)||90)}
              className="w-20 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs text-right" />
            <span className="text-xs text-white/30 font-heading">days</span>
          </div>
        </div>
        <Toggle value={settings.allowed_login_hours_enabled} onChange={v => set("allowed_login_hours_enabled", v)}
          label="Restrict Login Hours"
          desc="Only allow logins during specified hours" />
        {settings.allowed_login_hours_enabled && (
          <div className="flex items-center gap-4 px-4 py-3 bg-[hsl(0,0%,9%)]">
            <span className="text-xs text-white/40 font-heading uppercase">From</span>
            <Input type="time" value={settings.allowed_login_start} onChange={e => set("allowed_login_start", e.target.value)}
              className="w-32 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
            <span className="text-xs text-white/40 font-heading uppercase">To</span>
            <Input type="time" value={settings.allowed_login_end} onChange={e => set("allowed_login_end", e.target.value)}
              className="w-32 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs" />
          </div>
        )}
      </Section>

      {/* Re-authentication */}
      <Section title="Sensitive Action Re-Authentication" icon={<AlertTriangle className="w-4 h-4 text-yellow-400" />}>
        <p className="px-4 pt-3 text-[10px] text-white/30">Users must re-enter their password before performing these sensitive actions.</p>
        {[
          ["require_reauth_supplier_bank", "Supplier Bank Detail Changes"],
          ["require_reauth_employee_bank", "Employee Bank Detail Changes"],
          ["require_reauth_payroll", "Payroll Processing & Pay Rate Changes"],
          ["require_reauth_bas", "BAS Lodgement Status Changes"],
          ["require_reauth_bank_recon", "Bank Reconciliation Reversal"],
          ["require_reauth_credit_limit", "Customer Credit Limit Changes"],
          ["require_reauth_permissions", "User Permission Changes"],
        ].map(([key, label]) => (
          <Toggle key={key} value={settings[key]} onChange={v => set(key, v)} label={label} />
        ))}
      </Section>

      {/* Placeholder */}
      <div className="p-4 bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm">
        <p className="font-heading text-[10px] uppercase tracking-widest text-white/30 mb-2">IP & Device Restrictions (Placeholder)</p>
        <p className="text-xs text-white/25">IP address and device-specific restrictions can be configured once the app is connected to an identity provider.</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,9%)] flex items-center gap-2">
        {icon}
        <h4 className="font-heading text-[10px] uppercase tracking-widest text-white/50">{title}</h4>
      </div>
      {children}
    </div>
  );
}