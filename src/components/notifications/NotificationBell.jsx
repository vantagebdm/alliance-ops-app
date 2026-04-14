import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck, Settings, ArrowRight } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import { FILTER_TABS } from "./notificationConfig";
import { Link } from "react-router-dom";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const panelRef = useRef();
  const { notifications, unreadCount, hasUrgent, hasCritical, markRead, markAllRead, dismiss } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    if (activeTab === "urgent") return n.priority === "urgent" || n.priority === "critical";
    return n.category === activeTab;
  });

  const bellColor = hasCritical
    ? "text-red-400 hover:text-red-300"
    : hasUrgent
    ? "text-amber-400 hover:text-amber-300"
    : "text-white/60 hover:text-white";

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative p-2 transition-colors ${bellColor}`}
      >
        <Bell className={`w-5 h-5 ${hasCritical ? "animate-pulse" : ""}`} />
        {unreadCount > 0 && (
          <span className={`
            absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center
            text-[10px] font-heading font-bold rounded-full px-1
            ${hasCritical ? "bg-red-500 text-white" : hasUrgent ? "bg-amber-500 text-black" : "bg-primary text-black"}
          `}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[420px] bg-card border border-border rounded-sm shadow-2xl z-50 flex flex-col max-h-[80vh]">

          {/* Header */}
          <div className="bg-[hsl(0,0%,8%)] px-4 py-3 flex items-center justify-between rounded-t-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-primary/20 text-primary font-heading text-xs px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-white font-heading uppercase tracking-wide"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> All Read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex overflow-x-auto border-b border-border bg-muted/20 flex-shrink-0 scrollbar-none">
            {FILTER_TABS.map(tab => {
              const count = tab.key === "unread"
                ? notifications.filter(n => !n.is_read).length
                : tab.key === "urgent"
                ? notifications.filter(n => n.priority === "urgent" || n.priority === "critical").length
                : tab.key !== "all"
                ? notifications.filter(n => n.category === tab.key && !n.is_read).length
                : 0;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 px-3 py-2 text-[10px] font-heading uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-1 text-[9px] bg-primary/20 text-primary px-1 rounded-sm">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-heading text-xs uppercase tracking-wider text-muted-foreground">No notifications</p>
              </div>
            ) : (
              filtered.slice(0, 30).map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markRead}
                  onDismiss={dismiss}
                  compact
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/10 flex-shrink-0 rounded-b-sm">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider text-primary hover:text-primary/80"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/notifications/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}