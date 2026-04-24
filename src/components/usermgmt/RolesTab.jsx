import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Copy, X, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODULE_PERMISSIONS, DEFAULT_ROLES, DEFAULT_ROLE_PERMISSIONS, DEFAULT_APPROVAL_LIMITS, ROLE_COLORS, formatActionLabel } from "@/lib/permissions";

const MODULES = Object.entries(MODULE_PERMISSIONS);

function PermToggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-all relative ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

export default function RolesTab() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    let data = await base44.entities.AppRole.list("-created_date", 100);
    // Seed defaults if none exist
    if (data.length === 0) {
      const seeds = DEFAULT_ROLES.map(name => ({
        name,
        description: `Default ${name} role`,
        color: ROLE_COLORS[name] || "#22c55e",
        is_system: true,
        is_active: true,
        permissions: DEFAULT_ROLE_PERMISSIONS[name] || {},
        approval_limits: DEFAULT_APPROVAL_LIMITS[name] || {}
      }));
      for (const seed of seeds) {
        await base44.entities.AppRole.create(seed);
      }
      data = await base44.entities.AppRole.list("-created_date", 100);
    }
    setRoles(data);
    if (!selected && data.length > 0) setSelected(data[0]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSaveRole = async (roleData) => {
    setSaving(true);
    if (editRole?.id) {
      await base44.entities.AppRole.update(editRole.id, roleData);
    } else {
      await base44.entities.AppRole.create(roleData);
    }
    setSaving(false);
    setShowForm(false);
    setEditRole(null);
    await load();
  };

  const handleTogglePerm = async (moduleKey, action, value) => {
    if (!selected) return;
    const perms = { ...(selected.permissions || {}) };
    if (!perms[moduleKey]) perms[moduleKey] = {};
    perms[moduleKey] = { ...perms[moduleKey], [action]: value };
    const updated = { ...selected, permissions: perms };
    setSelected(updated);
    setRoles(prev => prev.map(r => r.id === selected.id ? updated : r));
    await base44.entities.AppRole.update(selected.id, { permissions: perms });
  };

  const handleClone = async (role) => {
    const clone = { ...role, name: `${role.name} (Copy)`, is_system: false, id: undefined, created_date: undefined, updated_date: undefined };
    delete clone.id;
    await base44.entities.AppRole.create(clone);
    load();
  };

  const getPermValue = (moduleKey, action) => {
    if (!selected) return false;
    const perms = selected.permissions || {};
    if (perms._all === "admin" || perms._all === "approve") return true;
    return !!(perms[moduleKey]?.[action] || perms[moduleKey]?._all);
  };

  const toggleModule = (key) => setExpandedModules(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* Role list */}
      <div className="w-64 flex-shrink-0 space-y-2">
        <Button onClick={() => { setEditRole(null); setShowForm(true); }}
          className="w-full bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Plus className="w-4 h-4 mr-1" /> New Role
        </Button>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[hsl(0,0%,25%)] border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-1">
            {roles.map(role => (
              <div key={role.id}
                onClick={() => setSelected(role)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-sm cursor-pointer transition-all border ${selected?.id === role.id ? "bg-primary/10 border-primary/30" : "bg-[hsl(0,0%,11%)] border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,25%)]"}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: role.color || "#22c55e" }} />
                  <span className="text-xs font-heading text-white truncate">{role.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); handleClone(role); }} className="p-1 text-white/25 hover:text-white/60" title="Clone">
                    <Copy className="w-3 h-3" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setEditRole(role); setShowForm(true); }} className="p-1 text-white/25 hover:text-white/60" title="Edit">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permission matrix */}
      <div className="flex-1 overflow-y-auto space-y-3 min-w-0">
        {!selected ? (
          <div className="text-center py-12 text-white/25 font-heading uppercase tracking-wider text-xs"><Shield className="w-10 h-10 mx-auto mb-2 text-white/10" />Select a role</div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.color || "#22c55e" }} />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">{selected.name}</h3>
              {selected.is_system && <span className="text-[9px] font-heading uppercase tracking-wider text-yellow-400 border border-yellow-400/30 px-1.5 py-0.5 rounded-sm">System Role</span>}
              {selected.description && <span className="text-xs text-white/30">{selected.description}</span>}
            </div>

            {MODULES.map(([moduleKey, module]) => {
              const expanded = expandedModules[moduleKey];
              const enabledCount = module.actions.filter(a => getPermValue(moduleKey, a)).length;
              return (
                <div key={moduleKey} className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
                  <button
                    onClick={() => toggleModule(moduleKey)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[hsl(0,0%,13%)] transition-colors">
                    <div className="flex items-center gap-3">
                      {expanded ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                      <span className="font-heading text-xs uppercase tracking-wider text-white">{module.label}</span>
                    </div>
                    <span className={`text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm ${enabledCount > 0 ? "text-primary bg-primary/10" : "text-white/25 bg-[hsl(0,0%,15%)]"}`}>
                      {enabledCount}/{module.actions.length} enabled
                    </span>
                  </button>
                  {expanded && (
                    <div className="px-4 pb-3 space-y-0 border-t border-[hsl(0,0%,16%)]">
                      {module.actions.map(action => (
                        <div key={action} className="flex items-center justify-between py-2 border-b border-[hsl(0,0%,14%)] last:border-0">
                          <span className="text-xs text-white/50">{formatActionLabel(action)}</span>
                          <PermToggle value={getPermValue(moduleKey, action)} onChange={v => handleTogglePerm(moduleKey, action, v)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {showForm && (
        <RoleFormModal
          initial={editRole}
          onClose={() => { setShowForm(false); setEditRole(null); }}
          onSave={handleSaveRole}
          saving={saving}
        />
      )}
    </div>
  );
}

function RoleFormModal({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: "", description: "", color: "#22c55e", is_active: true,
    ...initial
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,22%)] rounded-sm w-96 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm uppercase tracking-wider text-white">{initial ? "Edit Role" : "New Role"}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="font-heading text-[10px] uppercase tracking-wider text-white/40">Role Name *</label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} className="bg-[hsl(0,0%,15%)] border-[hsl(0,0%,25%)] text-white rounded-sm text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="font-heading text-[10px] uppercase tracking-wider text-white/40">Description</label>
            <Input value={form.description} onChange={e => set("description", e.target.value)} className="bg-[hsl(0,0%,15%)] border-[hsl(0,0%,25%)] text-white rounded-sm text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="font-heading text-[10px] uppercase tracking-wider text-white/40">Role Colour</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={e => set("color", e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              <span className="text-xs text-white/50 font-mono">{form.color}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/60">Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving || !form.name}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            {saving ? "Saving..." : "Save Role"}
          </Button>
        </div>
      </div>
    </div>
  );
}