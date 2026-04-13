export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="bg-[hsl(0,0%,8%)] border-b border-[hsl(0,0%,14%)] px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white uppercase tracking-wider">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/40 text-sm mt-1 font-body">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}