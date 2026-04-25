import { AlertTriangle, Clock } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function UrgentPanel({ title, icon, items, emptyText, basePath }) {
  const navigate = useNavigate();
  const Icon = icon || AlertTriangle;

  return (
    <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
      <div className="bg-[hsl(0,0%,8%)] px-4 py-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">
          {title}
        </h3>
        {items && items.length > 0 && (
          <span className="ml-auto bg-primary/20 text-primary text-[10px] font-heading font-bold px-2 py-0.5 rounded-sm">
            {items.length}
          </span>
        )}
      </div>
      <div className="divide-y divide-[hsl(0,0%,16%)]">
        {(!items || items.length === 0) ? (
          <div className="p-6 text-center text-white/30 text-sm">{emptyText || "No items"}</div>
        ) : (
          items.slice(0, 6).map((item, i) => (
            <button
              key={item.id || i}
              onClick={() => basePath && navigate(`${basePath}/${item.id}`)}
              className="w-full text-left px-4 py-3 hover:bg-[hsl(0,0%,14%)] transition-colors flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{item.title}</div>
                <div className="text-xs text-white/40 mt-0.5">{item.subtitle}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.badge && <StatusBadge status={item.badge} />}
                {item.time && (
                  <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {moment(item.time).fromNow()}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}