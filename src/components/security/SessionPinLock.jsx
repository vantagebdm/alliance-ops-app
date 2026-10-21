import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const IDLE_LIMIT_MS = 5 * 60 * 1000;

export default function SessionPinLock({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(false);
  const idleTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const profiles = await base44.entities.UserProfile.filter({ email: currentUser.email }, "-updated_date", 1);
        const p = profiles[0] || null;
        setProfile(p);
        setLocked(!!p?.session_pin);
      } catch (err) {
        setLocked(true);
        if (err.status === 401 || err.response?.status === 401) base44.auth.redirectToLogin(window.location.href);
        else setError("Unable to load your PIN settings. Refresh and try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (!profile?.session_pin) return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setError("");
      setPin("");
      setLocked(true);
    }, IDLE_LIMIT_MS);
  }, [profile]);

  useEffect(() => {
    if (loading || locked || !profile?.session_pin) return;
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [loading, locked, profile, resetIdleTimer]);

  const handleSubmit = async () => {
    if (checking || !user || !/^\d{4,6}$/.test(pin)) return;
    setError("");
    setChecking(true);
    try {
      // Re-read on every attempt so a PIN changed by an admin works immediately.
      const profiles = await base44.entities.UserProfile.filter({ email: user.email }, "-updated_date", 1);
      const currentProfile = profiles[0];
      if (!currentProfile) {
        setError("Your PIN settings could not be found. Ask an administrator to check your account.");
        return;
      }
      setProfile(currentProfile);
      if (!currentProfile.session_pin || pin === String(currentProfile.session_pin).trim()) {
        setPin("");
        setLocked(false);
      } else {
        setError("Incorrect PIN for this account. Ask an administrator to reset it in Security → Session Control.");
        setPin("");
      }
    } catch (err) {
      setError("Unable to check your PIN. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <div role="status" className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Loading PIN settings…</div>;
  if (!locked) return children;

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-6 w-full max-w-xs text-center space-y-4">
          <Lock className="w-8 h-8 text-primary mx-auto" />
          <h2 className="font-heading text-sm uppercase tracking-wider text-white">Enter PIN to Continue</h2>
          {user && <p className="text-xs text-muted-foreground break-all">{user.full_name}<br />{user.email}</p>}
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="••••"
            className="text-center text-lg tracking-widest"
            autoFocus
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button onClick={handleSubmit} className="w-full" disabled={checking || !user || pin.length < 4}>
            {checking ? "Checking…" : "Unlock"}
          </Button>
          <Button variant="ghost" onClick={() => base44.auth.logout()} className="w-full">Sign out / Switch account</Button>
        </div>
      </div>
    </>
  );
}