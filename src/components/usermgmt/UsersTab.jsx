import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, MoreVertical, UserX, RefreshCw, Send, Trash2, Eye, Edit2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_ROLES, ROLE_COLORS } from "@/lib/permissions";
import UserForm from "./UserForm";
import UserDetailPanel from "./UserDetailPanel";
import moment from "moment";

const STATUS_STYLES = {
  invited:   "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  active:    "bg-green-500/10 text-green-400 border border-green-500/20",
  suspended: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  disabled:  "bg-red-500/10 text-red-400 border border-red-500/20",
  archived:  "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

export default function UsersTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [confirmDisable, setConfirmDisable] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.UserProfile.list("-created_date", 200);
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const departments = [...new Set(profiles.map(p => p.department).filter(Boolean))];

  const filtered = profiles.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = !search || [p.first_name, p.last_name, p.email, p.job_title, p.department].join(" ").toLowerCase().includes(s);
    const matchRole = filterRole === "all" || p.role_name === filterRole;
    const matchStatus = filterStatus === "all" || p.account_status === filterStatus;
    const matchDept = filterDept === "all" || p.department === filterDept;
    return matchSearch && matchRole && matchStatus && matchDept;
  });

  const handleDisable = async (profile) => {
    await base44.entities.UserProfile.update(profile.id, { account_status: profile.account_status === "disabled" ? "active" : "disabled" });
    setConfirmDisable(null);
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.UserProfile.delete(id);
    setOpenMenu(null);
    load();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white rounded-sm text-xs" />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-44 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white/70 rounded-sm text-xs font-heading uppercase tracking-wider">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
            <SelectItem value="all">All Roles</SelectItem>
            {DEFAULT_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white/70 rounded-sm text-xs font-heading uppercase tracking-wider">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
            <SelectItem value="all">All Status</SelectItem>
            {["invited","active","suspended","disabled","archived"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        {departments.length > 0 && (
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-44 bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-white/70 rounded-sm text-xs font-heading uppercase tracking-wider">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <div className="ml-auto">
          <Button onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 text-xs">
        {["active","invited","suspended","disabled"].map(s => {
          const count = profiles.filter(p => p.account_status === s).length;
          return <span key={s} className={`px-2.5 py-1 rounded-sm font-heading uppercase tracking-wider ${STATUS_STYLES[s]}`}>{count} {s}</span>;
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[hsl(0,0%,20%)] border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20 font-heading uppercase tracking-wider text-xs">
          No users found. Click Add User to get started.
        </div>
      ) : (
        <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                {["Name","Email","Job Title","Department","Role","Status","Last Login","MFA","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[hsl(0,0%,11%)] transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {p.profile_image_url
                        ? <img src={p.profile_image_url} className="w-7 h-7 rounded-full object-cover" />
                        : <div className="w-7 h-7 rounded-full bg-[hsl(0,0%,18%)] flex items-center justify-center text-[10px] font-heading text-white/50">{(p.first_name?.[0]||"")+(p.last_name?.[0]||"")}</div>}
                      <span className="font-semibold text-white text-xs">{p.first_name} {p.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-white/50">{p.email}</td>
                  <td className="px-4 py-2.5 text-xs text-white/50">{p.job_title || "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-white/50">{p.department || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase tracking-wider text-white/80"
                      style={{ backgroundColor: (ROLE_COLORS[p.role_name] || "#22c55e") + "22", color: ROLE_COLORS[p.role_name] || "#22c55e", border: `1px solid ${(ROLE_COLORS[p.role_name] || "#22c55e")}44` }}>
                      {p.role_name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase tracking-wider ${STATUS_STYLES[p.account_status] || STATUS_STYLES.invited}`}>
                      {p.account_status || "invited"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-white/40">{p.last_login ? moment(p.last_login).fromNow() : "Never"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[10px] font-heading uppercase ${p.mfa_enabled ? "text-green-400" : "text-white/25"}`}>{p.mfa_enabled ? "ON" : "OFF"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewTarget(p)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setEditTarget(p); setShowForm(true); }} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDisable(p)} className={`p-1 rounded hover:bg-white/10 ${p.account_status === "disabled" ? "text-green-400" : "text-yellow-400"}`} title={p.account_status === "disabled" ? "Enable" : "Disable"}>
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1 rounded hover:bg-red-500/10 text-red-500/40 hover:text-red-400" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm disable modal */}
      {confirmDisable && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,22%)] rounded-sm p-6 w-96">
            <h3 className="font-heading uppercase tracking-wider text-white mb-2">
              {confirmDisable.account_status === "disabled" ? "Enable" : "Disable"} User?
            </h3>
            <p className="text-white/50 text-sm mb-4">
              Are you sure you want to {confirmDisable.account_status === "disabled" ? "enable" : "disable"} <span className="text-white font-semibold">{confirmDisable.first_name} {confirmDisable.last_name}</span>?
              {confirmDisable.account_status !== "disabled" && " They will no longer be able to access the ERP."}
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmDisable(null)} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60">Cancel</Button>
              <Button onClick={() => handleDisable(confirmDisable)} className={`rounded-sm text-xs font-heading uppercase tracking-wider ${confirmDisable.account_status === "disabled" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}>
                Confirm {confirmDisable.account_status === "disabled" ? "Enable" : "Disable"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <UserForm
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { setShowForm(false); setEditTarget(null); load(); }}
        />
      )}

      {viewTarget && (
        <UserDetailPanel
          profile={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={(p) => { setViewTarget(null); setEditTarget(p); setShowForm(true); }}
          onRefresh={load}
        />
      )}
    </div>
  );
}