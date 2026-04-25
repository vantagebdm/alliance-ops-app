import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function DataTable({ columns, data, onRowClick, emptyMessage = "No records found", rowClassName }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (col) => {
    if (sortCol === col.key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col.key);
      setSortDir("asc");
    }
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol] ?? "";
    const bVal = b[sortCol] ?? "";
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortDir === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  if (!data || data.length === 0) {
    return (
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm">
        <div className="p-12 text-center text-white/40 text-sm">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[hsl(0,0%,9%)] border-b border-[hsl(0,0%,18%)]">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col)}
                  className={`
                    text-left px-4 py-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-white/40
                    ${col.sortable !== false ? "cursor-pointer hover:text-white select-none" : ""}
                    ${col.width || ""}
                  `}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortCol === col.key && (
                      sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  border-b border-[hsl(0,0%,16%)] last:border-0 transition-colors
                  ${onRowClick ? "cursor-pointer hover:bg-[hsl(0,0%,14%)]" : ""}
                  ${rowClassName ? rowClassName(row) : ""}
                `}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm font-body text-white/80">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}