export default function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-primary/30">
      <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-sm flex-shrink-0">
        <span className="font-heading font-bold text-black text-xs">{number}</span>
      </div>
      <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">{title}</h3>
    </div>
  );
}