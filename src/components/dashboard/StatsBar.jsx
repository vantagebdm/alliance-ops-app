export default function StatsBar({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-border/50">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-4">
          <div className="font-heading text-[11px] uppercase tracking-wider text-foreground/40 mb-1">
            {stat.label}
          </div>
          <div className={`font-heading text-2xl font-bold ${stat.color || "text-foreground"}`}>
            {stat.value}
          </div>
          {stat.subtext && (
            <div className="text-[11px] text-foreground/40 mt-0.5">{stat.subtext}</div>
          )}
        </div>
      ))}
    </div>
  );
}