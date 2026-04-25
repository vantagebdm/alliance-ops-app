import { useState } from "react";
import { Database, Upload, Download, HardDrive, GitMerge, Edit3, ShieldCheck, Truck, Archive, FileText, LayoutDashboard } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataDashboard from "@/components/datamanagement/DataDashboard";
import ImportCentre from "@/components/datamanagement/ImportCentre";
import ExportCentre from "@/components/datamanagement/ExportCentre";
import BackupRestore from "@/components/datamanagement/BackupRestore";
import DataMapping from "@/components/datamanagement/DataMapping";
import BulkUpdateTools from "@/components/datamanagement/BulkUpdateTools";
import DataQualityCleanup from "@/components/datamanagement/DataQualityCleanup";
import MigrationTools from "@/components/datamanagement/MigrationTools";
import ArchiveRetention from "@/components/datamanagement/ArchiveRetention";
import DataAuditLog from "@/components/datamanagement/DataAuditLog";

const TABS = [
  { id: "dashboard",  label: "Dashboard",         icon: LayoutDashboard },
  { id: "import",     label: "Import Centre",      icon: Upload },
  { id: "export",     label: "Export Centre",      icon: Download },
  { id: "backup",     label: "Backup & Restore",   icon: HardDrive },
  { id: "mapping",    label: "Data Mapping",       icon: GitMerge },
  { id: "bulk",       label: "Bulk Update",        icon: Edit3 },
  { id: "quality",    label: "Data Quality",       icon: ShieldCheck },
  { id: "migration",  label: "Migration Tools",    icon: Truck },
  { id: "archive",    label: "Archive & Retention",icon: Archive },
  { id: "auditlog",   label: "Data Audit Log",     icon: FileText },
];

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":  return <DataDashboard />;
      case "import":     return <ImportCentre />;
      case "export":     return <ExportCentre />;
      case "backup":     return <BackupRestore />;
      case "mapping":    return <DataMapping />;
      case "bulk":       return <BulkUpdateTools />;
      case "quality":    return <DataQualityCleanup />;
      case "migration":  return <MigrationTools />;
      case "archive":    return <ArchiveRetention />;
      case "auditlog":   return <DataAuditLog />;
      default:           return <DataDashboard />;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      <PageHeader
        title="Data Management"
        subtitle="Import, export, backup, restore, cleansing and migration"
        actions={
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-sm text-[10px] font-heading uppercase tracking-wider border bg-primary/10 text-primary border-primary/30">
              Full Module Active
            </span>
          </div>
        }
      />

      {/* Sub-nav */}
      <div className="bg-[hsl(0,0%,8%)] border-b border-[hsl(0,0%,14%)] px-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[10px] font-heading uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-white/40 hover:text-white/70 hover:border-white/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}