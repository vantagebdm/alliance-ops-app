import { useState } from "react";
import { LayoutDashboard, BookOpen, Building2, Users, FileText, Calculator, BookMarked, BarChart2, CreditCard } from "lucide-react";
import AccountingDashboard from "./accounting/AccountingDashboard";
import ChartOfAccounts from "./accounting/ChartOfAccounts";
import BankReconciliation from "./accounting/BankReconciliation";
import AccountsReceivable from "./accounting/AccountsReceivable";
import AccountsPayable from "./accounting/AccountsPayable";
import Payroll from "./accounting/Payroll";
import BASPreparation from "./accounting/BASPreparation";
import Journals from "./accounting/Journals";
import AccountingReports from "./accounting/AccountingReports";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chart_of_accounts", label: "Chart of Accounts", icon: BookOpen },
  { id: "bank", label: "Bank & Reconciliation", icon: Building2 },
  { id: "ar", label: "Accounts Receivable", icon: Users },
  { id: "ap", label: "Accounts Payable", icon: CreditCard },
  { id: "payroll", label: "Payroll", icon: Users },
  { id: "bas", label: "BAS Preparation", icon: Calculator },
  { id: "journals", label: "Journals", icon: BookMarked },
  { id: "reports", label: "Reports", icon: BarChart2 },
];

export default function Accounting() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get("tab");
  const [tab, setTab] = useState(tabParam || "dashboard");

  const handleTab = (id) => setTab(id);

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <AccountingDashboard />;
      case "chart_of_accounts": return <ChartOfAccounts />;
      case "bank": return <BankReconciliation />;
      case "ar": return <AccountsReceivable />;
      case "ap": return <AccountsPayable />;
      case "payroll": return <Payroll />;
      case "bas": return <BASPreparation />;
      case "journals": return <Journals />;
      case "reports": return <AccountingReports />;
      default: return <AccountingDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sub-navigation */}
      <div className="bg-[hsl(0,0%,6%)] border-b border-[hsl(0,0%,14%)] px-4 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => handleTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 font-heading text-[10px] uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${tab === t.id ? "border-primary text-primary" : "border-transparent text-white/40 hover:text-white/70"}`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}