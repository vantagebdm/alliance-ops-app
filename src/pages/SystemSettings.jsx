import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Building2, Warehouse, DollarSign, Receipt, ShoppingCart, Package, BarChart3, Tag, FileText, GitBranch, Bell, Mail, Truck, Plug, Settings, ClipboardList } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

import CompanyProfile from "@/components/systemsettings/CompanyProfile";
import BranchesWarehouses from "@/components/systemsettings/BranchesWarehouses";
import FinancialSettings from "@/components/systemsettings/FinancialSettings";
import GSTBASSettings from "@/components/systemsettings/GSTBASSettings";
import SalesSettings from "@/components/systemsettings/SalesSettings";
import PurchasingSettings from "@/components/systemsettings/PurchasingSettings";
import InventorySettings from "@/components/systemsettings/InventorySettings";
import PricingMarginRules from "@/components/systemsettings/PricingMarginRules";
import DocumentDefaults from "@/components/systemsettings/DocumentDefaults";
import WorkflowSettings from "@/components/systemsettings/WorkflowSettings";
import NotificationsSettings from "@/components/systemsettings/NotificationsSettings";
import EmailTemplates from "@/components/systemsettings/EmailTemplates";
import FreightDelivery from "@/components/systemsettings/FreightDelivery";
import IntegrationsSettings from "@/components/systemsettings/IntegrationsSettings";
import SystemPreferences from "@/components/systemsettings/SystemPreferences";
import SettingsAuditLog from "@/components/systemsettings/SettingsAuditLog";

const TABS = [
  { id: "company",       label: "Company Profile",           icon: Building2,     mfa: false },
  { id: "branches",      label: "Branches & Warehouses",     icon: Warehouse,     mfa: false },
  { id: "financial",     label: "Financial Settings",        icon: DollarSign,    mfa: true  },
  { id: "gst",           label: "GST & BAS Settings",        icon: Receipt,       mfa: true  },
  { id: "sales",         label: "Sales Settings",            icon: ShoppingCart,  mfa: false },
  { id: "purchasing",    label: "Purchasing Settings",       icon: Package,       mfa: false },
  { id: "inventory",     label: "Inventory Settings",        icon: BarChart3,     mfa: false },
  { id: "pricing",       label: "Pricing & Margin Rules",    icon: Tag,           mfa: false },
  { id: "documents",     label: "Document Defaults",         icon: FileText,      mfa: false },
  { id: "workflow",      label: "Workflow Settings",         icon: GitBranch,     mfa: false },
  { id: "notifications", label: "Notifications",             icon: Bell,          mfa: false },
  { id: "email",         label: "Email & Comms Templates",   icon: Mail,          mfa: false },
  { id: "freight",       label: "Freight & Delivery",        icon: Truck,         mfa: false },
  { id: "integrations",  label: "Integrations",              icon: Plug,          mfa: true  },
  { id: "preferences",   label: "System Preferences",        icon: Settings,      mfa: false },
  { id: "audit",         label: "Settings Audit Log",        icon: ClipboardList, mfa: false },
];

const COMPONENTS = {
  company:       CompanyProfile,
  branches:      BranchesWarehouses,
  financial:     FinancialSettings,
  gst:           GSTBASSettings,
  sales:         SalesSettings,
  purchasing:    PurchasingSettings,
  inventory:     InventorySettings,
  pricing:       PricingMarginRules,
  documents:     DocumentDefaults,
  workflow:      WorkflowSettings,
  notifications: NotificationsSettings,
  email:         EmailTemplates,
  freight:       FreightDelivery,
  integrations:  IntegrationsSettings,
  preferences:   SystemPreferences,
  audit:         SettingsAuditLog,
};

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("company");
  const ActiveComponent = COMPONENTS[activeTab];
  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="System Settings"
        subtitle="Central control panel for APP ERP operating behaviour"
        actions={
          <div className="flex items-center gap-2 text-[10px] font-heading uppercase text-white/30">
            <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/60">System Settings</span>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-56 flex-shrink-0 bg-[hsl(0,0%,7%)] border-r border-[hsl(0,0%,14%)] overflow-y-auto">
          <div className="py-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all group ${
                    active
                      ? "bg-primary/10 border-r-2 border-primary text-primary"
                      : "text-white/40 hover:text-white/70 hover:bg-[hsl(0,0%,10%)]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-primary" : "text-white/25 group-hover:text-white/50"}`} />
                  <span className="text-[10px] font-heading uppercase tracking-wider leading-tight">{tab.label}</span>
                  {tab.mfa && (
                    <span className="ml-auto text-[8px] font-heading uppercase text-yellow-500/60 border border-yellow-500/30 px-1 rounded-sm flex-shrink-0">MFA</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[hsl(0,0%,9%)]">
          <div className="p-6">
            {activeTabData?.mfa && (
              <div className="mb-4 p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-sm flex items-center gap-2">
                <span className="text-yellow-400 text-[10px] font-heading uppercase tracking-wider">⚠ Changes to this section require MFA verification and are recorded in the Settings Audit Log.</span>
              </div>
            )}
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}