export default function FieldLabel({ children, required, extracted }) {
  return (
    <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/55 mb-1 flex items-center gap-1.5 block">
      {children}
      {required && <span className="text-red-500">*</span>}
      {extracted && (
        <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded font-heading tracking-wider">EXTRACTED</span>
      )}
    </label>
  );
}