export default function SupplierSectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}