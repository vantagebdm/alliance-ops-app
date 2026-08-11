import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  ChevronDown, Loader2, Bell, Search, CheckCircle2, ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BDMDeliverableItem from "./BDMDeliverableItem";
import { BDM_SEED_SECTIONS } from "@/lib/bdmSeedData";

export default function BDMRolloutsPortal({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.BDMDeliverable.list("-section_number", 2000);
    setTasks(data);

    // Auto-seed if empty
    if (data.length === 0) {
      await seedAll();
    }
    setLoading(false);
  };

  const seedAll = async () => {
    setSeeding(true);
    const records = [];
    let sortOrder = 0;
    for (const section of BDM_SEED_SECTIONS) {
      for (const task of section.tasks) {
        if (task && typeof task === "object" && task.heading) continue; // skip headings
        records.push({
          section_number: section.number,
          section_title: section.title,
          task_text: String(task),
          status: "not_started",
          completed: false,
          sort_order: sortOrder++,
        });
      }
    }
    // Bulk create in batches of 100
    for (let i = 0; i < records.length; i += 100) {
      await base44.entities.BDMDeliverable.bulkCreate(records.slice(i, i + 100));
    }
    const data = await base44.entities.BDMDeliverable.list("-section_number", 2000);
    setTasks(data);
    setSeeding(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const toggleSection = (num) => {
    setExpandedSections((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  // Group tasks by section number, preserve seed order
  const sections = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      if (!map[t.section_number]) map[t.section_number] = { title: t.section_title, tasks: [] };
      map[t.section_number].tasks.push(t);
    }
    return Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b)
      .map((num) => ({ number: num, title: map[num].title, tasks: map[num].tasks }));
  }, [tasks]);

  // Overall stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const unreadCount = tasks.filter((t) => t.has_unread_comments || t.has_unread_edits).length;
  const approvedCount = tasks.filter((t) => t.approved).length;
  const progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter
  const filteredSections = useMemo(() => {
    if (!search && filter === "all") return sections;
    const q = search.toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        tasks: s.tasks.filter((t) => {
          const matchSearch = !q ||
            t.task_text?.toLowerCase().includes(q) ||
            t.owner?.toLowerCase().includes(q) ||
            t.notes?.toLowerCase().includes(q);
          const matchFilter = filter === "all" ||
            (filter === "unread" && (t.has_unread_comments || t.has_unread_edits)) ||
            (filter === "open" && !t.completed) ||
            (filter === "done" && t.completed) ||
            (filter === "approved" && t.approved) ||
            t.status === filter;
          return matchSearch && matchFilter;
        }),
      }))
      .filter((s) => s.tasks.length > 0);
  }, [sections, search, filter]);

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "unread", label: `Unread${unreadCount ? ` (${unreadCount})` : ""}` },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "blocked", label: "Blocked" },
    { value: "awaiting_approval", label: "Awaiting Approval" },
    { value: "approved", label: "Approved" },
    { value: "done", label: "Done" },
  ];

  if (loading || seeding) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">
          {seeding ? "Seeding deliverables..." : "Loading deliverables..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Tasks</p>
          <p className="text-xl font-heading font-bold text-foreground mt-0.5">{totalTasks}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Completed</p>
          <p className="text-xl font-heading font-bold text-green-400 mt-0.5">{completedTasks}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Approved</p>
          <p className="text-xl font-heading font-bold text-primary mt-0.5">{approvedCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unread Activity</p>
          <p className="text-xl font-heading font-bold text-amber-400 mt-0.5 flex items-center gap-1">
            {unreadCount > 0 && <Bell className="w-4 h-4 animate-bounce" fill="currentColor" />}
            {unreadCount}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Progress</p>
          <p className="text-xl font-heading font-bold text-foreground mt-0.5">{progressPct}%</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-2">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, owners, notes..."
            className="pl-9 rounded-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-2.5 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                filter === f.value ? "bg-primary text-black" : "bg-[hsl(0,0%,14%)] text-white/50 hover:text-white hover:bg-[hsl(0,0%,18%)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {filteredSections.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <ListChecks className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tasks match your filters.</p>
          </div>
        )}
        {filteredSections.map((section) => {
          const sectionTotal = section.tasks.length;
          const sectionDone = section.tasks.filter((t) => t.completed).length;
          const sectionPct = sectionTotal ? Math.round((sectionDone / sectionTotal) * 100) : 0;
          const sectionUnread = section.tasks.filter((t) => t.has_unread_comments || t.has_unread_edits).length;
          const isExpanded = expandedSections[section.number] ?? true;

          return (
            <div key={section.number} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.number)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                <span className="font-heading text-xs font-bold text-primary uppercase tracking-wider">
                  {section.number}.
                </span>
                <span className="font-heading text-sm font-semibold text-white uppercase tracking-wide flex-1 text-left">
                  {section.title}
                </span>
                {sectionUnread > 0 && (
                  <Bell className="w-4 h-4 text-amber-400 animate-bounce" fill="currentColor" />
                )}
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-[hsl(0,0%,14%)] rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${sectionPct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-16 text-right">
                    {sectionDone}/{sectionTotal}
                  </span>
                  {sectionPct === 100 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {section.tasks.map((task) => (
                    <BDMDeliverableItem
                      key={task.id}
                      task={task}
                      user={user}
                      onUpdated={onUpdated}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}