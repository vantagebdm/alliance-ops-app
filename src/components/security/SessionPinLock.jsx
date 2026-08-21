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
  const idleTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      const p = profiles[0] || null;
      setProfile(p);
      // Only lock if an admin has assigned this user a PIN in Security > Session Control.
      setLocked(!!p?.session_pin);
      setLoading(false);
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

  const handleSubmit = () => {
    setError("");
    if (pin === profile?.session_pin) {
      setPin("");
      setLocked(false);
    } else {
      setError("Incorrect PIN");
      setPin("");
    }
  };

  if (loading || !locked) return children;

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-6 w-full max-w-xs text-center space-y-4">
          <Lock className="w-8 h-8 text-primary mx-auto" />
          <h2 className="font-heading text-sm uppercase tracking-wider text-white">Enter PIN to Continue</h2>
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
          <Button onClick={handleSubmit} className="w-full" disabled={pin.length < 4}>
            Unlock
          </Button>
        </div>
      </div>
    </>
  );
}