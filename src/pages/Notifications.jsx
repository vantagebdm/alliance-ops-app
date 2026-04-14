import { useState, useMemo } from "react";
import { Bell, Search, CheckCheck, Trash2, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import { FILTER_TABS, CATEGORY_CONFIG, PRIORITY_CONFIG } from "@/components/notifications/notificationConfig";

export default function Notifications() {
  const { notifications, loading, unreadCount, markRead, markAllRead, dismiss, dismissAll, reload } = useNotifications();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (tab === "unread" && n.is_read) return false;
      if (tab === "urgent" && n.priority !== "urgent" && n.priority !== "critical") return false;
      if (tab !== "all" && tab !== "unread" && tab !== "urgent" && n.category !== tab) return false;
      if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!n.title?.toLowerCase().includes(s) &&
            !n.description?.toLowerCase().includes(s) &&
            !n.entity_ref?.toLowerCase().includes(s) &&
            !n.customer_name?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [notifications, tab, priorityFilter, search]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map(n => n.id)));
  const clearSelect = () => setSelected(new Set());

  const bulkMarkRead = async () => {
    await Promise.all([...selected].map(id => markRead(id)));
    clearSelect();
  };

  const bulkDismiss = async () => {
    await Promise.all([...selected].map(id => dismiss(id)));
    clearSelect();
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={reload} className="rounded-sm font-heading text-xs uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllRead} className="rounded-sm font-heading text-xs uppercase tracking-wider">
                <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications..." className="pl-9 rounded-sm" />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36 rounded-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-0 border-b border-border">
          {FILTER_TABS.map(t => {
            const cnt = t.key === "unread"
              ? notifications.filter(n => !n.is_read).length
              : t.key === "urgent"
              ? notifications.filter(n => n.priority === "urgent" || n.priority === "critical").length
              : t.key !== "all"
              ? notifications.filter(n => n.category === t.key && !n.is_read).length
              : notifications.filter(n => !n.is_read).length;

            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-shrink-0 px-4 py-2.5 text-xs font-heading uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {cnt > 0 && (
                  <span className="ml-1.5 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm">{cnt}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-sm px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-heading uppercase tracking-wider text-primary">{selected.size} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={bulkMarkRead} className="rounded-sm font-heading text-xs uppercase tracking-wider">
                <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark Read
              </Button>
              <Button size="sm" variant="outline" onClick={bulkDismiss} className="rounded-sm font-heading text-xs uppercase tracking-wider text-red-400 hover:text-red-400 border-red-500/30">
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Dismiss
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelect} className="rounded-sm font-heading text-xs uppercase tracking-wider">Cancel</Button>
            </div>
          </div>
        )}

        {/* Select all / count bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded-sm" checked={selected.size === filtered.length} onChange={e => e.target.checked ? selectAll() : clearSelect()} />
              <span className="text-xs text-muted-foreground font-heading uppercase tracking-wider">
                {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            {notifications.filter(n => n.is_read).length > 0 && (
              <Button size="sm" variant="ghost" onClick={dismissAll} className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Read
              </Button>
            )}
          </div>
        )}

        {/* Notification list */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-sm">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-heading text-lg uppercase tracking-wider text-foreground/40">No notifications found</p>
          </div>
        ) : (
          <div className="border border-border rounded-sm overflow-hidden">
            {filtered.map(n => (
              <div key={n.id} className="flex items-stretch">
                <div className="flex items-center px-3 border-r border-border/40 bg-muted/10 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="rounded-sm"
                    checked={selected.has(n.id)}
                    onChange={() => toggleSelect(n.id)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <NotificationItem
                    notification={n}
                    onMarkRead={markRead}
                    onDismiss={dismiss}
                    compact={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}