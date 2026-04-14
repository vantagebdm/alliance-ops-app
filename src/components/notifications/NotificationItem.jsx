import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare, AlertTriangle, UserCheck, ArrowRight, Clock, Zap, AlertOctagon,
  FileText, CheckCircle, XCircle, ShoppingCart, RefreshCw, Package, Receipt,
  TrendingDown, AlertCircle, BarChart2, ShoppingBag, Truck, Send, Mail,
  DollarSign, Upload, FileSearch, Eye, ClipboardList, Settings, Lock, WifiOff
} from "lucide-react";
import { PRIORITY_CONFIG, CATEGORY_CONFIG, TYPE_TO_ICON } from "./notificationConfig";

const ICON_MAP = {
  MessageSquare, AlertTriangle, UserCheck, ArrowRight, Clock, Zap, AlertOctagon,
  FileText, CheckCircle, XCircle, ShoppingCart, RefreshCw, Package, Receipt,
  TrendingDown, AlertCircle, BarChart: BarChart2, ShoppingBag, Truck, Send, Mail,
  DollarSign, Upload, FileSearch, Eye, ClipboardList, Settings, Lock, WifiOff
};

export default function NotificationItem({ notification: n, onMarkRead, onDismiss, compact = false }) {
  const iconName = TYPE_TO_ICON[n.type] || "Settings";
  const Icon = ICON_MAP[iconName] || Settings;
  const priority = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.normal;
  const category = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.admin;
  const timeAgo = n.created_date ? formatDistanceToNow(new Date(n.created_date), { addSuffix: true }) : "";

  const isCritical = n.priority === "critical";
  const isUrgent = n.priority === "urgent";

  return (
    <div
      className={`
        relative border-b border-border/40 transition-colors
        ${!n.is_read ? "bg-primary/[0.04]" : "bg-transparent"}
        ${isCritical ? "border-l-2 border-l-red-500" : isUrgent ? "border-l-2 border-l-amber-500" : "border-l-2 border-l-transparent"}
        hover:bg-muted/30
      `}
      onClick={() => !n.is_read && onMarkRead(n.id)}
    >
      <div className={`flex gap-3 ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}>
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-sm flex items-center justify-center ${category.bg}`}>
          <Icon className={`w-3.5 h-3.5 ${category.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`font-heading text-xs uppercase tracking-wide leading-tight ${!n.is_read ? "text-foreground" : "text-foreground/70"}`}>
                {n.title}
              </p>
              {n.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {n.entity_ref && (
                  <span className="font-mono text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-sm">{n.entity_ref}</span>
                )}
                {n.customer_name && (
                  <span className="text-[10px] text-muted-foreground">{n.customer_name}</span>
                )}
                <span className={`text-[10px] font-heading uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${priority.bg} ${priority.color}`}>
                  {priority.label}
                </span>
                <span className="text-[10px] text-muted-foreground/60">{timeAgo}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!n.is_read && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Quick action buttons */}
          {!compact && (
            <div className="flex gap-1.5 mt-2">
              {!n.is_read && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
                  className="text-[10px] font-heading uppercase tracking-wide text-muted-foreground hover:text-foreground border border-border/50 px-2 py-0.5 rounded-sm hover:bg-muted/50 transition-colors"
                >
                  Mark Read
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                className="text-[10px] font-heading uppercase tracking-wide text-muted-foreground hover:text-red-400 border border-border/50 px-2 py-0.5 rounded-sm hover:bg-red-500/10 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}