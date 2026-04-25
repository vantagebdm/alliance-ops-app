import { useState } from "react";
import { Shield, LayoutDashboard, KeyRound, Smartphone, Lock, Clock, LogIn, AlertTriangle, Monitor, UserX, ScrollText } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SecurityDashboard from "@/components/security/SecurityDashboard";
import AuthenticationTab from "@/components/security/AuthenticationTab";
import MFAControlsTab from "@/components/security/MFAControlsTab";
import PasswordPolicyTab from "@/components/security/PasswordPolicyTab";
import SessionControlTab from "@/components/security/SessionControlTab";
import LoginAccessRulesTab from "@/components/security/LoginAccessRulesTab";
import SensitiveActionTab from "@/components/security/SensitiveActionTab";
import DeviceIPTab from "@/components/security/DeviceIPTab";
import AccountLockoutTab from "@/components/security/AccountLockoutTab";
import SecurityAuditLog from "@/components/security/SecurityAuditLog";

const TABS = [
  { id: "dashboard",  label: "Security Dashboard",       icon: LayoutDashboard },
  { id: "auth",       label: "Authentication",           icon: KeyRound },
  { id: "mfa",        label: "MFA Controls",             icon: Smartphone },
  { id: "password",   label: "Password Policy",          icon: Lock },
  { id: "session",    label: "Session Control",          icon: Clock },
  { id: "login",      label: "Login Access Rules",       icon: LogIn },
  { id: "sensitive",  label: "Sensitive Action Protection", icon: AlertTriangle },
  { id: "device",     label: "Device & IP Access",       icon: Monitor },
  { id: "lockout",    label: "Account Lockout Rules",    icon: UserX },
  { id: "audit",      label: "Security Audit Log",       icon: ScrollText },
];

export default function Security() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":  return <SecurityDashboard />;
      case "auth":       return <AuthenticationTab />;
      case "mfa":        return <MFAControlsTab />;
      case "password":   return <PasswordPolicyTab />;
      case "session":    return <SessionControlTab />;
      case "login":      return <LoginAccessRulesTab />;
      case "sensitive":  return <SensitiveActionTab />;
      case "device":     return <DeviceIPTab />;
      case "lockout":    return <AccountLockoutTab />;
      case "audit":      return <SecurityAuditLog />;
      default:           return <SecurityDashboard />;
    }
  };

  return (
    <div>
      <PageHeader
        title="Security"
        subtitle="Authentication, access control, and security policy management"
        actions={
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-heading uppercase tracking-wider text-primary">Security Module Active</span>
          </div>
        }
      />
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Sidebar nav */}
        <div className="w-56 flex-shrink-0 bg-[hsl(0,0%,8%)] border-r border-[hsl(0,0%,15%)] py-4">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                  active
                    ? "bg-primary/10 border-r-2 border-primary text-primary"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[11px] font-heading uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-background">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}