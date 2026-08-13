import { Construction } from "lucide-react";

export default function ComingSoonPortal({ title }) {
  return (
    <div className="bg-card border border-border rounded-lg p-16 text-center">
      <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-foreground font-heading font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">This portal has been established — content coming soon.</p>
    </div>
  );
}