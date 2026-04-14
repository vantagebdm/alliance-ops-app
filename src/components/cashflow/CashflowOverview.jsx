import { useMemo } from "react";
import { AlertTriangle, Clock, Calendar, TrendingDown } from "lucide-react";
import moment from "moment";

export default function CashflowOverview({ entries }) {
  const today = moment().startOf("day");
  const endOfWeek = moment().endOf("week");
  const endOfMonth = moment().endOf("month");

  const stats = useMemo(() => {
    const active = entries.filter(e => e.status !== "cancelled" && e.status !== "paid");

    const dueToday = active.filter(e => moment(e.due_date).isSame(today, "day"));
    const dueThisWeek = active.filter(e => moment(e.due_date).isBetween(today, endOfWeek, "day", "[]"));
    const dueThisMonth = active.filter(e => moment(e.due_date).isBetween(today, endOfMonth, "day", "[]"));
    const overdue = active.filter(e => moment(e.due_date).isBefore(today, "day") || e.status === "overdue");

    const sum = (arr) => arr.reduce((acc, e) => acc + (e.amount || 0), 0);

    const totalIncoming = entries.filter(e => e.type === "incoming" && e.status !== "cancelled").reduce((a, e) => a + (e.amount || 0), 0);
    const totalOutgoing = entries.filter(e => e.type === "outgoing" && e.status !== "cancelled").reduce((a, e) => a + (e.amount || 0), 0);

    return {
      dueToday: { count: dueToday.length, amount: sum(dueToday) },
      dueThisWeek: { count: dueThisWeek.length, amount: sum(dueThisWeek) },
      dueThisMonth: { count: dueThisMonth.length, amount: sum(dueThisMonth) },
      overdue: { count: overdue.length, amount: sum(overdue) },
      totalIncoming,
      totalOutgoing,
      net: totalIncoming - totalOutgoing,
    };
  }, [entries]);

  const fmt = (n) => `$${n.toLocaleString()}`;

  const cards = [
    { label: "Due Today", amount: stats.dueToday.amount, sub: `${stats.dueToday.count} payment(s)`, icon: Clock, color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
    { label: "Due This Week", amount: stats.dueThisWeek.amount, sub: `${stats.dueThisWeek.count} item(s)`, icon: Calendar, color: "border-orange-500/40 bg-orange-500/10 text-orange-400" },
    { label: "Due This Month", amount: stats.dueThisMonth.amount, sub: `${stats.dueThisMonth.count} item(s)`, icon: TrendingDown, color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
    { label: "Overdue", amount: stats.overdue.amount, sub: `${stats.overdue.count} overdue item(s)`, icon: AlertTriangle, color: "border-red-500/40 bg-red-600/15 text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`rounded-sm border p-5 ${c.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4" />
                <span className="font-heading text-[10px] uppercase tracking-widest font-semibold opacity-80">{c.label}</span>
              </div>
              <div className="font-heading text-3xl font-bold">{fmt(c.amount)}</div>
              <div className="text-xs mt-1 opacity-70">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Net Position */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-sm p-4 text-green-400">
          <p className="font-heading text-[10px] uppercase tracking-widest mb-1">Total Incoming</p>
          <p className="font-heading text-2xl font-bold">{fmt(stats.totalIncoming)}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 text-red-400">
          <p className="font-heading text-[10px] uppercase tracking-widest mb-1">Total Outgoing</p>
          <p className="font-heading text-2xl font-bold">{fmt(stats.totalOutgoing)}</p>
        </div>
        <div className={`border rounded-sm p-4 ${stats.net >= 0 ? "bg-primary/10 border-primary/30 text-primary" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          <p className="font-heading text-[10px] uppercase tracking-widest mb-1">Net Position</p>
          <p className="font-heading text-2xl font-bold">{stats.net >= 0 ? "+" : ""}{fmt(stats.net)}</p>
        </div>
      </div>
    </div>
  );
}