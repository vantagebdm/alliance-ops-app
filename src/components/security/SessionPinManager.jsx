import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { KeyRound, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SessionPinManager() {
  const [users, setUsers] = useState([]);
  const [profilesByEmail, setProfilesByEmail] = useState({});
  const [drafts, setDrafts] = useState({});
  const [savedEmail, setSavedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list(),
      base44.entities.UserProfile.list("-created_date", 500),
    ]).then(([userList, profileList]) => {
      setUsers(userList);
      const map = {};
      profileList.forEach((p) => { if (p.email) map[p.email] = p; });
      setProfilesByEmail(map);
      setLoading(false);
    });
  }, []);

  const handleSave = async (user) => {
    const email = user.email;
    const pin = (drafts[email] ?? profilesByEmail[email]?.session_pin ?? "").replace(/\D/g, "");
    const existing = profilesByEmail[email];
    let updated;
    if (existing) {
      updated = await base44.entities.UserProfile.update(existing.id, { session_pin: pin });
    } else {
      const [first_name, ...rest] = (user.full_name || email).split(" ");
      updated = await base44.entities.UserProfile.create({
        email,
        first_name: first_name || email,
        last_name: rest.join(" "),
        session_pin: pin,
      });
    }
    setProfilesByEmail((prev) => ({ ...prev, [email]: updated }));
    setSavedEmail(email);
    setTimeout(() => setSavedEmail(null), 1500);
  };

  if (loading) {
    return <p className="text-[10px] text-white/30 font-heading uppercase tracking-wider">Loading authorised users...</p>;
  }

  return (
    <div>
      <h3 className="font-heading text-xs uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
        <KeyRound className="w-3.5 h-3.5" /> Authorised Users — Session PINs
      </h3>
      <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
              {["Name", "Email", "PIN", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(0,0%,14%)]">
            {users.map((u) => {
              const profile = profilesByEmail[u.email];
              const draftValue = drafts[u.email] ?? profile?.session_pin ?? "";
              return (
                <tr key={u.id} className="hover:bg-[hsl(0,0%,11%)]">
                  <td className="px-4 py-2.5 text-white font-semibold">{u.full_name || "—"}</td>
                  <td className="px-4 py-2.5 text-white/50">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={draftValue}
                      onChange={(e) => setDrafts((d) => ({ ...d, [u.email]: e.target.value.replace(/\D/g, "") }))}
                      placeholder="No PIN set"
                      className="w-24 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white rounded-sm text-xs"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Button size="sm" onClick={() => handleSave(u)} className="bg-primary text-black text-[10px] font-heading uppercase tracking-wider rounded-sm h-7">
                      {savedEmail === u.email ? <Check className="w-3.5 h-3.5" /> : "Save"}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-white/20 font-heading uppercase text-[10px]">No authorised users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}