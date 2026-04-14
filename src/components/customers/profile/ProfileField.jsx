export default function ProfileField({ label, value, mono = false, span = false }) {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div className={`flex flex-col gap-0.5 ${span ? "col-span-2" : ""}`}>
      <span className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </span>
    </div>
  );
}

export function SectionTitle({ children, border = true }) {
  return (
    <div className={`${border ? "border-b border-border pb-2 mb-4" : "mb-4"}`}>
      <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-foreground/60">{children}</h3>
    </div>
  );
}