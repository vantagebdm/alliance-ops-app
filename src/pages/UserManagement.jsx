import { useState } from "react";
import { Users, Shield, Lock, CheckSquare, Settings, ScrollText, ArrowLeft } from "lucide-react";
import UsersTab from "@/components/usermgmt/UsersTab";
import RolesTab from "@/components/usermgmt/RolesTab";
import AccessControlTab from "@/components/usermgmt/AccessControlTab";
import ApprovalLimitsTab from "@/components/usermgmt/ApprovalLimitsTab";
import SecuritySettingsTab from "@/components/usermgmt/SecuritySettingsTab";
import AuditLogTab from "@/components/usermgmt/AuditLogTab";
import { Link } from "react-router-dom";

const TABS = [
  { id: "users", label: "Users", icon: Users },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "access", label: "Access Control", icon: Lock },
  { id: "approvals", label: "Approval Limits", icon: CheckSquare },
  { id: "security", label: "Security Settings", icon: Settings },
  { id: "audit", label: "Audit Log", icon: ScrollText },
];

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("users");

  const renderTab = () => {
    switch (activeTab) {
      case "users": return <UsersTab />;
      case "roles": return <RolesTab />;
      case "access": return <AccessControlTab />;
      case "approvals": return <ApprovalLimitsTab />;
      case "security": return <SecuritySettingsTab />;
      case "audit": return <AuditLogTab />;
      default: return <UsersTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-[hsl(0,0%,5%)] border-b border-[hsl(0,0%,14%)] px-6 py-4 flex items-center gap-4">
        <Link to="/admin" className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors text-xs font-heading uppercase tracking-wider">
          <ArrowLeft className="w-3.5 h-3.5" /> Admin
        </Link>
        <span className="text-white/15">/</span>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="font-heading text-base font-bold uppercase tracking-widest text-white">User Management</h1>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-[hsl(0,0%,6%)] border-b border-[hsl(0,0%,14%)] px-4 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 font-heading text-[10px] uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-white/35 hover:text-white/65"}`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderTab()}
      </div>
    </div>
  );
}