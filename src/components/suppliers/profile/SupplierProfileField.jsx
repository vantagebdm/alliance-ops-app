export default function SupplierProfileField({ label, value, className = "" }) {
  if (!value && value !== 0 && value !== false) return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className={className}>
      <p className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  );
}

export function ProfileSection({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground mb-3 pb-1.5 border-b border-border">{title}</h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {children}
      </div>
    </div>
  );
}

export function TagList({ label, items = [] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="col-span-2">
      <p className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map(t => (
          <span key={t} className="px-2 py-0.5 text-[10px] font-heading uppercase tracking-wider bg-muted border border-border rounded-sm text-foreground/70">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}