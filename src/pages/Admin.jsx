import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Shield, Settings, Database, Hash, Package, ChevronRight, FileText } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import moment from "moment";
import DocumentNumberingSettings from "@/components/admin/DocumentNumberingSettings";
import PartNumberingSettings from "@/components/admin/PartNumberingSettings";
import PDFRegenerationTool from "@/components/admin/PDFRegenerationTool";
import { Link } from "react-router-dom";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list("-created_date", 100).then(d => {
      setUsers(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const columns = [
    { key: "full_name", label: "Name", render: (v) => <span className="font-semibold">{v || "—"}</span> },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (v) => <StatusBadge status={v === "admin" ? "active" : "pending"} /> },
    { key: "created_date", label: "Joined", render: (v) => moment(v).format("DD/MM/YY") },
  ];

  const ADMIN_SECTIONS = [
    { icon: Users, label: "User Management", desc: "Manage team members, roles, permissions and access control", link: "/admin/user-management", highlight: true },
    { icon: Shield, label: "Security", desc: "Authentication and access control", link: "/admin/security", highlight: true },
    { icon: Database, label: "Data Management", desc: "Import, export, and backup data", link: "/admin/data-management", highlight: true },
    { icon: Settings, label: "System Settings", desc: "Configure ERP preferences", link: "/admin/system-settings", highlight: true },
    { icon: Hash, label: "Document Numbering", desc: "Configure auto-sequencing for all document types", link: "/admin/document-numbering", highlight: true },
    { icon: Package, label: "Part Numbering", desc: "Configure APP internal part number generation", link: "/admin/part-numbering", highlight: true },
  ];

  return (
    <div>
      <PageHeader title="Admin" subtitle="System administration and settings" />
      <div className="p-6 space-y-6">
        {/* Quick access cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADMIN_SECTIONS.map((section, i) => {
            const Icon = section.icon;
            const card = (
              <div className={`border rounded-sm p-5 hover:border-primary/40 transition-all cursor-pointer group flex items-start justify-between
                ${section.highlight ? "bg-[hsl(0,0%,10%)] border-primary/25 hover:bg-[hsl(0,0%,12%)]" : "bg-[hsl(0,0%,10%)] border-[hsl(0,0%,18%)]"}`}>
                <div>
                  <Icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">{section.label}</h3>
                  <p className="text-xs text-white/40 mt-1">{section.desc}</p>
                  {section.highlight && (
                    <span className="inline-block mt-2 text-[9px] font-heading uppercase tracking-wider text-primary border border-primary/30 px-1.5 py-0.5 rounded-sm">
                      Full Module Active
                    </span>
                  )}
                </div>
                {section.link && <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors mt-1" />}
              </div>
            );
            return section.link ? <Link key={i} to={section.link}>{card}</Link> : <div key={i}>{card}</div>;
          })}
        </div>

        {/* Document Numbering Settings */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider">Document Numbering Settings</h2>
          </div>
          <DocumentNumberingSettings />
        </div>

        {/* Part Numbering Settings */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider">Part Numbering Settings</h2>
          </div>
          <PartNumberingSettings />
        </div>

        {/* PDF Regeneration Tool */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider">PDF Regeneration</h2>
          </div>
          <PDFRegenerationTool />
        </div>

        {/* Users table */}
        <div>
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider mb-4">Team Members</h2>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
          ) : (
            <DataTable columns={columns} data={users} emptyMessage="No users found." />
          )}
        </div>
      </div>
    </div>
  );
}