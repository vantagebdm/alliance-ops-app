import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Edit2, Shield, AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_COLORS } from "@/lib/permissions";
import moment from "moment";

const STATUS_STYLES = {
  invited:   "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  active:    "bg-green-500/10 text-green-400 border border-green-500/20",
  suspended: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  disabled:  "bg-red-500/10 text-red-400 border border-red-500/20",
  archived:  "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

export default function UserDetailPanel({ profile, onClose, onEdit, onRefresh }) {
  const [activeTab, setActiveTab] = useState("overview");
  const approvalLimits = profile.approval_limits || {};

  const TABS = ["overview", "permissions", "approval limits", "access control", "activity"];

  const formatLimit = (v) => {
    if (v === -1 || v === undefined) return <span className="text-green-400 font-heading text-xs">Unlimited</span>;
    if (v === 0) return <span className="text-red-400 font-heading text-xs">No Authority</span>;
    if (v === true) return <span className="text-green-400 font-heading text-xs">Authorised</span>;
    if (v === false) return <span className="text-red-400 font-heading text-xs">Not Authorised</span>;
    return <span className="text-white font-heading text-xs">${v?.toLocaleString()}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-end">
      <div className="h-full w-[560px] bg-[hsl(0,0%,9%)] border-l border-[hsl(0,0%,18%)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,7%)]">
          <div className="flex items-center gap-3">
            {profile.profile_image_url
              ? <img src={profile.profile_image_url} className="w-10 h-10 rounded-full object-cover" />
              : <div className="w-10 h-10 rounded-full bg-[hsl(0,0%,20%)] flex items-center justify-center text-sm font-heading text-white/50">
                  {(profile.first_name?.[0]||"")+(profile.last_name?.[0]||"")}
                </div>}
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-white">{profile.first_name} {profile.last_name}</h2>
              <p className="text-white/40 text-xs">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => onEdit(profile)} size="sm" variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60">
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 border-b border-[hsl(0,0%,18%)] flex items-center gap-4 bg-[hsl(0,0%,8%)]">
          <span className={`px-2.5 py-1 rounded-sm text-[10px] font-heading uppercase tracking-wider ${STATUS_STYLES[profile.account_status] || STATUS_STYLES.invited}`}>
            {profile.account_status || "invited"}
          </span>
          <span className="text-xs text-white/40 font-heading">{profile.role_name || "No Role"}</span>
          <span className="text-xs text-white/30">{profile.department || ""}</span>
          {profile.mfa_enabled && <span className="text-[10px] font-heading uppercase text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> MFA</span>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,8%)] overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2.5 font-heading text-[10px] uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${activeTab === t ? "border-primary text-primary" : "border-transparent text-white/30 hover:text-white/60"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <InfoSection title="Personal Details">
                <InfoRow label="Full Name" value={`${profile.first_name} ${profile.last_name}`} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Mobile" value={profile.mobile || "—"} />
                <InfoRow label="Job Title" value={profile.job_title || "—"} />
                <InfoRow label="Department" value={profile.department || "—"} />
                <InfoRow label="Employment" value={profile.employment_type?.replace(/_/g," ") || "—"} />
              </InfoSection>
              <InfoSection title="Login & Access">
                <InfoRow label="Role" value={profile.role_name || "—"} />
                <InfoRow label="Default Warehouse" value={profile.default_warehouse || "—"} />
                <InfoRow label="Start Date" value={profile.start_date ? moment(profile.start_date).format("DD/MM/YYYY") : "—"} />
                <InfoRow label="Account Expiry" value={profile.expiry_date ? moment(profile.expiry_date).format("DD/MM/YYYY") : "No expiry"} />
                <InfoRow label="Last Login" value={profile.last_login ? moment(profile.last_login).format("DD/MM/YYYY HH:mm") : "Never"} />
                <InfoRow label="MFA Enabled" value={profile.mfa_enabled ? "Yes" : "No"} />
              </InfoSection>
              {profile.notes && (
                <InfoSection title="Notes">
                  <p className="text-white/50 text-xs">{profile.notes}</p>
                </InfoSection>
              )}
            </div>
          )}

          {activeTab === "approval limits" && (
            <div className="space-y-3">
              <p className="text-white/30 text-xs">Approval limits are inherited from the assigned role unless overridden.</p>
              {[
                ["Purchase Order", "purchase_order", "$"],
                ["Supplier Bill", "supplier_bill", "$"],
                ["Sales Discount", "sales_discount_pct", "%"],
                ["Credit Note", "credit_note", "$"],
                ["Stock Adjustment", "stock_adjustment", "$"],
                ["Customer Credit Limit", "customer_credit_limit", "$"],
                ["Supplier Payment", "supplier_payment", "$"],
                ["Payroll Authority", "payroll", "bool"],
                ["Journal", "journal", "$"],
                ["BAS Lodgement", "bas_lodgement", "bool"],
              ].map(([label, key, type]) => (
                <div key={key} className="flex items-center justify-between py-2.5 border-b border-[hsl(0,0%,16%)]">
                  <span className="text-xs text-white/60 font-heading uppercase tracking-wider">{label}</span>
                  {formatLimit(approvalLimits[key])}
                </div>
              ))}
            </div>
          )}

          {activeTab === "access control" && (
            <div className="space-y-3">
              {[
                ["Hide Cost Price", "hide_cost_price"],
                ["Hide Sell Margins", "hide_sell_margins"],
                ["Hide Bank Balances", "hide_bank_balances"],
                ["Hide Payroll Information", "hide_payroll_info"],
                ["Hide BAS / GST Data", "hide_bas_gst"],
                ["Hide Supplier Bank Details", "hide_supplier_bank"],
                ["Hide Customer Credit Limits", "hide_customer_credit"],
                ["Hide Financial Reports", "hide_financial_reports"],
              ].map(([label, key]) => (
                <div key={key} className="flex items-center justify-between py-2.5 border-b border-[hsl(0,0%,16%)]">
                  <span className="text-xs text-white/60 font-heading uppercase tracking-wider">{label}</span>
                  <span className={`text-[10px] font-heading uppercase ${profile[key] ? "text-red-400" : "text-green-400"}`}>
                    {profile[key] ? "Restricted" : "Allowed"}
                  </span>
                </div>
              ))}
              <InfoRow label="Supplier Access" value={profile.supplier_access === "restricted" ? "Restricted" : "All Suppliers"} />
              <InfoRow label="Customer Access" value={profile.customer_access === "restricted" ? "Restricted" : "All Customers"} />
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="text-white/40 text-xs text-center py-8">
              <Shield className="w-8 h-8 mx-auto mb-2 text-white/15" />
              Permissions are managed via the assigned role.<br />
              Go to Roles & Permissions to view full matrix.
            </div>
          )}

          {activeTab === "activity" && (
            <div className="text-white/40 text-xs text-center py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 text-white/15" />
              Activity history is tracked in the Audit Log tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div className="bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
      <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 mb-3">{title}</h3>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[hsl(0,0%,16%)] last:border-0">
      <span className="text-xs text-white/40 font-heading uppercase tracking-wider text-[10px]">{label}</span>
      <span className="text-xs text-white/80">{value}</span>
    </div>
  );
}