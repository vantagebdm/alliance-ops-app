import { useState } from "react";
import { Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-start justify-between py-3 border-b border-[hsl(0,0%,14%)] last:border-0">
    <div className="flex-1 pr-4">
      <div className="text-xs font-heading uppercase tracking-wider text-white">{label}</div>
      {desc && <div className="text-[10px] text-white/30 mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 mt-0.5 ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden mb-4">
    <div className="px-4 py-3 border-b border-[hsl(0,0%,16%)] bg-[hsl(0,0%,9%)]">
      <p className="font-heading text-[10px] uppercase tracking-widest text-white/40">{title}</p>
    </div>
    <div className="px-4">{children}</div>
  </div>
);

export default function AuthenticationTab() {
  const [settings, setSettings] = useState({
    email_password_login: true,
    invite_only: true,
    admin_approved_activation: true,
    force_reset_first_login: true,
    force_reset_after_admin_reset: true,
    disable_suspended: true,
    disable_archived: true,
    prevent_deleted: true,
    require_active_role: true,
    require_verified_email: false,
    require_status_active: true,
    require_assigned_role: true,
    require_mfa_admin: true,
    require_mfa_accounting: true,
    require_mfa_payroll: true,
    require_mfa_bas: true,
  });
  const [saved, setSaved] = useState(false);

  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Authentication Settings</h2>
        <Button onClick={handleSave} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-sm flex gap-2">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-400/80">Authentication settings control how users log in and what conditions must be met before access is granted. These settings work together with User Management roles and permissions.</p>
      </div>

      <Section title="Login Method">
        <Toggle label="Email & Password Login" desc="Allow users to log in with email and password" value={settings.email_password_login} onChange={set("email_password_login")} />
        <Toggle label="Invite-Only Account Creation" desc="New accounts can only be created by admin invitation" value={settings.invite_only} onChange={set("invite_only")} />
        <Toggle label="Admin-Approved User Activation" desc="Admin must activate account before user can log in" value={settings.admin_approved_activation} onChange={set("admin_approved_activation")} />
      </Section>

      <Section title="Password Reset Rules">
        <Toggle label="Force Password Reset on First Login" desc="New users must change their temporary password immediately" value={settings.force_reset_first_login} onChange={set("force_reset_first_login")} />
        <Toggle label="Force Password Reset After Admin Reset" desc="User must change password after admin manually resets it" value={settings.force_reset_after_admin_reset} onChange={set("force_reset_after_admin_reset")} />
      </Section>

      <Section title="Account Status Blocks">
        <Toggle label="Block Suspended Users from Logging In" desc="Users with status = Suspended cannot authenticate" value={settings.disable_suspended} onChange={set("disable_suspended")} />
        <Toggle label="Block Archived Users from Logging In" desc="Users with status = Archived cannot authenticate" value={settings.disable_archived} onChange={set("disable_archived")} />
        <Toggle label="Block Deleted / Disabled Users" desc="Users with status = Disabled cannot authenticate" value={settings.prevent_deleted} onChange={set("prevent_deleted")} />
        <Toggle label="Require Active Assigned Role Before Login" desc="Users without an assigned role in User Management cannot log in" value={settings.require_active_role} onChange={set("require_active_role")} />
      </Section>

      <Section title="Required Access Conditions">
        <Toggle label="Require Verified Email" desc="User must verify their email address before first login" value={settings.require_verified_email} onChange={set("require_verified_email")} />
        <Toggle label="Require Account Status = Active" desc="Only users with Active status can log in" value={settings.require_status_active} onChange={set("require_status_active")} />
        <Toggle label="Require Assigned Role" desc="User must have a role assigned in User Management" value={settings.require_assigned_role} onChange={set("require_assigned_role")} />
      </Section>

      <Section title="Role-Based MFA Requirements">
        <Toggle label="Require MFA for Admin Users" desc="All users with admin roles must have MFA enabled to access the system" value={settings.require_mfa_admin} onChange={set("require_mfa_admin")} />
        <Toggle label="Require MFA for Accounting Users" desc="Users with accounting module permissions must have MFA" value={settings.require_mfa_accounting} onChange={set("require_mfa_accounting")} />
        <Toggle label="Require MFA for Payroll Users" desc="Users with payroll access must have MFA enabled" value={settings.require_mfa_payroll} onChange={set("require_mfa_payroll")} />
        <Toggle label="Require MFA for BAS Users" desc="Users with BAS preparation or lodgement access must have MFA" value={settings.require_mfa_bas} onChange={set("require_mfa_bas")} />
      </Section>

      <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
        <p className="text-[10px] text-yellow-400/80 font-heading uppercase tracking-wider">
          ⚠ Access Sequence: Security checks login status → Password/MFA → User Management checks role & permissions → Security applies sensitive action protection.
        </p>
      </div>
    </div>
  );
}