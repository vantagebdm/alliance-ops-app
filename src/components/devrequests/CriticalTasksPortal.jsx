import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TriangleAlert } from "lucide-react";
import BDMDeliverableItem from "./BDMDeliverableItem";

export default function CriticalTasksPortal({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.BDMDeliverable.filter({ marked_critical: true }, "-critical_marked_at", 500);
    setTasks(data);
    setLoading(false);

    // Mark as viewed so the hazard badge clears
    const unviewed = data.filter((t) => !t.critical_viewed);
    if (unviewed.length) {
      await Promise.all(unviewed.map((t) => base44.entities.BDMDeliverable.update(t.id, { critical_viewed: true })));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onUpdated = (updated) => {
    if (!updated.marked_critical) {
      setTasks((prev) => prev.filter((t) => t.id !== updated.id));
    } else {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading critical tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-16 text-center">
        <TriangleAlert className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-heading font-semibold uppercase tracking-wider">Tasks Marked Critical</p>
        <p className="text-xs text-muted-foreground mt-1">
          No tasks have been shifted here yet. Use "Mark Critical" on a task in BDM Rollouts & Deliverables to move it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
        <TriangleAlert className="w-4 h-4 text-red-400" fill="currentColor" />
        <p className="text-xs text-red-400 font-heading font-semibold uppercase tracking-wider">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} marked critical
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {tasks.map((task) => (
          <BDMDeliverableItem key={task.id} task={task} user={user} onUpdated={onUpdated} />
        ))}
      </div>
    </div>
  );
}