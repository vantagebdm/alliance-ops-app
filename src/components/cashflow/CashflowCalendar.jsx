import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const TYPE_COLORS = {
  outgoing: "bg-red-500/20 text-red-300 border-l-2 border-red-500",
  incoming: "bg-green-500/20 text-green-300 border-l-2 border-green-500",
};

const CAT_COLORS = {
  wages: "bg-orange-500/20 text-orange-300 border-l-2 border-orange-500",
  supplier_payment: "bg-purple-500/20 text-purple-300 border-l-2 border-purple-500",
  cogs: "bg-purple-600/20 text-purple-300 border-l-2 border-purple-600",
  sales_revenue: "bg-green-500/20 text-green-300 border-l-2 border-green-500",
  invoice_payment: "bg-green-600/20 text-green-300 border-l-2 border-green-600",
};

function getColor(entry) {
  if (entry.type === "incoming") return TYPE_COLORS.incoming;
  return CAT_COLORS[entry.category] || TYPE_COLORS.outgoing;
}

export default function CashflowCalendar({ entries, onEntryClick, onDayClick }) {
  const [current, setCurrent] = useState(moment().startOf("month"));

  const weeks = useMemo(() => {
    const start = current.clone().startOf("month").startOf("isoWeek");
    const end = current.clone().endOf("month").endOf("isoWeek");
    const days = [];
    let d = start.clone();
    while (d.isSameOrBefore(end, "day")) {
      days.push(d.clone());
      d.add(1, "day");
    }
    const result = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [current]);

  const byDate = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const key = e.due_date;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [entries]);

  const periodTotal = useMemo(() => {
    return entries
      .filter(e => {
        const d = moment(e.due_date);
        return d.isSameOrAfter(current, "month") && d.isSameOrBefore(current.clone().endOf("month"), "day");
      })
      .reduce((acc, e) => acc + (e.type === "incoming" ? e.amount : -e.amount) * (e.status !== "cancelled" ? 1 : 0), 0);
  }, [entries, current]);

  const DAY_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const today = moment().startOf("day");

  return (
    <div className="space-y-3">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrent(c => c.clone().subtract(1, "month"))} className="rounded-sm h-8 w-8">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-heading text-base font-bold uppercase tracking-wider">{current.format("MMMM YYYY")}</h3>
        <Button variant="outline" size="icon" onClick={() => setCurrent(c => c.clone().add(1, "month"))} className="rounded-sm h-8 w-8">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Period total */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{entries.filter(e => moment(e.due_date).isSame(current, "month")).length} entries this month</span>
        <span className="font-heading font-bold text-sm">
          Period Net: <span className={periodTotal >= 0 ? "text-primary" : "text-red-400"}>{periodTotal >= 0 ? "+" : ""}${periodTotal.toLocaleString()}</span>
        </span>
      </div>

      {/* Calendar grid */}
      <div className="border border-border rounded-sm overflow-hidden">
        {/* Headers */}
        <div className="grid grid-cols-7 bg-[hsl(0,0%,12%)]">
          {DAY_HEADERS.map(d => (
            <div key={d} className="py-2 text-center font-heading text-[10px] uppercase tracking-widest text-muted-foreground">{d}</div>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t border-border">
            {week.map((day, di) => {
              const key = day.format("YYYY-MM-DD");
              const dayEntries = byDate[key] || [];
              const isToday = day.isSame(today, "day");
              const isCurrentMonth = day.isSame(current, "month");
              const dayTotal = dayEntries.reduce((a, e) => a + (e.type === "incoming" ? e.amount : -e.amount), 0);

              const hasMixed = dayEntries.length > 0;
              const dayBg = !isCurrentMonth
                ? ""
                : hasMixed && dayTotal > 0
                ? "bg-green-500/10"
                : hasMixed && dayTotal < 0
                ? "bg-red-500/10"
                : hasMixed
                ? "bg-yellow-500/10"
                : "";

              return (
                <div
                  key={di}
                  onClick={() => isCurrentMonth && onDayClick && onDayClick(key)}
                  className={`min-h-[90px] p-1.5 border-r border-border last:border-r-0 transition-colors
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${dayBg}
                    ${isCurrentMonth && onDayClick ? "cursor-pointer hover:brightness-110" : ""}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-heading text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? "bg-primary text-black" : "text-muted-foreground"}`}>
                      {day.format("D")}
                    </span>
                    {dayEntries.length > 0 && (
                      <span className={`font-heading text-[9px] font-bold ${dayTotal >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {dayTotal >= 0 ? "+" : "-"}${Math.abs(dayTotal).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayEntries.slice(0, 3).map((e, i) => (
                      <button key={i} onClick={ev => { ev.stopPropagation(); onEntryClick(e); }}
                        className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded-sm truncate font-medium ${getColor(e)}`}>
                        {e.title}
                      </button>
                    ))}
                    {dayEntries.length > 3 && (
                      <span className="text-[9px] text-muted-foreground pl-1">+{dayEntries.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}