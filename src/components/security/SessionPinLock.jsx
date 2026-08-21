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
  const [mode, setMode] = useState("enter"); // "enter" | "set" | "confirm"
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const idleTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      const p = profiles[0] || null;
      setProfile(p);
      setMode(p?.session_pin ? "enter" : "set");
      setLocked(true);
      setLoading(false);
    })();
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setError("");
      setPin("");
      setMode(profile?.session_pin ? "enter" : "set");
      setLocked(true);
    }, IDLE_LIMIT_MS);
  }, [profile]);

  useEffect(() => {
    if (loading || locked) return;
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [loading, locked, resetIdleTimer]);

  const handleSubmit = async () => {
    setError("");
    if (mode === "enter") {
      if (pin === profile?.session_pin) {
        setPin("");
        setLocked(false);
      } else {
        setError("Incorrect PIN");
        setPin("");
      }
      return;
    }
    if (mode === "set") {
      if (pin.length < 4) {
        setError("PIN must be at least 4 digits");
        return;
      }
      setFirstPin(pin);
      setPin("");
      setMode("confirm");
      return;
    }
    if (mode === "confirm") {
      if (pin !== firstPin) {
        setError("PINs didn't match, try again");
        setPin("");
        setFirstPin("");
        setMode("set");
        return;
      }
      let updated;
      if (profile) {
        updated = await base44.entities.UserProfile.update(profile.id, { session_pin: pin });
      } else {
        const user = await base44.auth.me();
        const [first_name, ...rest] = (user.full_name || "").split(" ");
        updated = await base44.entities.UserProfile.create({
          email: user.email,
          first_name: first_name || "",
          last_name: rest.join(" "),
          session_pin: pin,
        });
      }
      setProfile(updated);
      setPin("");
      setFirstPin("");
      setMode("enter");
      setLocked(false);
    }
  };

  if (loading) return children;

  return (
    <>
      {children}
      {locked && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-xs text-center space-y-4">
            <Lock className="w-8 h-8 text-primary mx-auto" />
            <h2 className="font-heading text-sm uppercase tracking-wider text-white">
              {mode === "enter" && "Enter PIN to Continue"}
              {mode === "set" && "Create a Session PIN"}
              {mode === "confirm" && "Confirm Your PIN"}
            </h2>
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
              {mode === "enter" ? "Unlock" : "Continue"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}