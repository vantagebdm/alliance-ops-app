import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PermissionContext = createContext({});

export function PermissionProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;
        const profiles = await base44.entities.UserProfile.filter({ email: user.email });
        const profile = profiles?.[0] || null;
        setUserProfile(profile);

        if (profile?.role_name) {
          const roles = await base44.entities.AppRole.filter({ name: profile.role_name });
          setRole(roles?.[0] || null);
        }
      } catch {
        // not critical
      }
    };
    load();
  }, []);

  const hasPermission = (module, level = 'view') => {
    if (!role) return true; // default allow if no role loaded yet
    const perms = role.permissions || {};
    if (perms['_all'] === 'admin') return true;
    const moduleLevel = perms[module];
    if (!moduleLevel) return level === 'view';
    const levels = ['view', 'edit', 'approve', 'admin'];
    return levels.indexOf(moduleLevel) >= levels.indexOf(level);
  };

  const canApprove = (type, amount) => {
    if (!role) return false;
    const limits = { ...(role.approval_limits || {}), ...(userProfile?.approval_limits || {}) };
    const limit = limits[type];
    if (limit === -1 || limit === true) return true;
    if (typeof amount === 'number') return limit >= amount;
    return !!limit;
  };

  const isFieldHidden = (field) => {
    if (!userProfile) return false;
    return !!userProfile[field];
  };

  return (
    <PermissionContext.Provider value={{ userProfile, role, hasPermission, canApprove, isFieldHidden }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}