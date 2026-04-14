import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await base44.entities.Notification.filter(
      { is_dismissed: false },
      "-created_date",
      100
    );
    setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create") {
        setNotifications(prev => [event.data, ...prev]);
      } else if (event.type === "update") {
        setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      } else if (event.type === "delete") {
        setNotifications(prev => prev.filter(n => n.id !== event.id));
      }
    });
    return unsub;
  }, [load]);

  const unreadCount = notifications.filter(n => !n.is_read && !n.is_dismissed).length;
  const hasUrgent = notifications.some(n => !n.is_read && (n.priority === "urgent" || n.priority === "critical"));
  const hasCritical = notifications.some(n => !n.is_read && n.priority === "critical");

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true, read_at: new Date().toISOString() });
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString() })));
  };

  const dismiss = async (id) => {
    await base44.entities.Notification.update(id, { is_dismissed: true, dismissed_at: new Date().toISOString() });
  };

  const dismissAll = async () => {
    const read = notifications.filter(n => n.is_read);
    await Promise.all(read.map(n => base44.entities.Notification.update(n.id, { is_dismissed: true, dismissed_at: new Date().toISOString() })));
  };

  return { notifications, loading, unreadCount, hasUrgent, hasCritical, markRead, markAllRead, dismiss, dismissAll, reload: load };
}

// Helper to create notifications from anywhere in the app
export async function createNotification(data) {
  return base44.entities.Notification.create({
    is_read: false,
    is_dismissed: false,
    is_pinned: false,
    escalated: false,
    priority: "normal",
    ...data
  });
}