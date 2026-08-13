import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function useCriticalTasksCount() {
  const [count, setCount] = useState(0);

  const refresh = async () => {
    const items = await base44.entities.BDMDeliverable.filter({ marked_critical: true, critical_viewed: false });
    setCount(items.length);
  };

  useEffect(() => {
    refresh();
    const unsubscribe = base44.entities.BDMDeliverable.subscribe(() => refresh());
    return unsubscribe;
  }, []);

  return count;
}