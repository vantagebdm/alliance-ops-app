import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Shield, Settings, Database } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import moment from "moment";

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
    { icon: Users, label: "User Management", desc: "Manage team members and permissions" },
    { icon: Shield, label: "Security", desc: "Authentication and access control" },
    { icon: Database, label: "Data Management", desc: "Import, export, and backup data" },
    { icon: Settings, label: "System Settings", desc: "Configure ERP preferences" },
  ];

  return (
    <div>
      <PageHeader title="Admin" subtitle="System administration and settings" />
      <div className="p-6 space-y-6">
        {/* Quick access cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADMIN_SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="bg-white border border-border rounded-sm p-5 hover:border-primary/30 transition-colors cursor-pointer">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">{section.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{section.desc}</p>
              </div>
            );
          })}
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