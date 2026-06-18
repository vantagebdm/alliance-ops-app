import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Autocomplete({
  value,
  suggestions,
  open,
  loading,
  onInputChange,
  onSelect,
  onShowAll,
  placeholder = "Type to search...",
  className = "",
}) {
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const maxH = 220;
      const vh = window.innerHeight;
      const below = vh - rect.bottom - 8;
      const above = rect.top - 8;
      const fitsBelow = below >= maxH;
      const fitsAbove = above >= maxH;

      if (fitsBelow || !fitsAbove) {
        setDropdownStyle({
          position: "fixed",
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(rect.width, 260),
          maxHeight: Math.min(maxH, below - 4),
          zIndex: 9999,
        });
      } else {
        setDropdownStyle({
          position: "fixed",
          bottom: vh - rect.top + 4,
          left: rect.left,
          width: Math.max(rect.width, 260),
          maxHeight: Math.min(maxH, above - 4),
          zIndex: 9999,
        });
      }
    }
  }, [open]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        onFocus={() => { if (!value && onShowAll) onShowAll(); }}
        onKeyDown={(e) => { if (e.key === "ArrowDown" && onShowAll) onShowAll(); }}
        placeholder={placeholder}
        className={`flex h-9 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] text-foreground px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      {open && createPortal(
        <div style={dropdownStyle} className="bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,22%)] rounded-md shadow-2xl overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, idx) => {
              const isPart = !!(item.part_number && (item.app_part_number || item.name));
              const primary = isPart
                ? (item.part_number || item.app_part_number)
                : (item.name || item.customer_name || item.supplier_name || item.part_number || "N/A");
              const secondary = isPart
                ? [item.app_part_number && item.app_part_number !== primary ? item.app_part_number : null, item.name].filter(Boolean).join(" — ")
                : (item.company && item.company !== primary ? item.company : (item.trading_name && item.trading_name !== primary ? item.trading_name : null));
              return (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
                  className="w-full text-left px-3 py-2 hover:bg-accent text-sm transition-colors flex items-baseline gap-2"
                >
                  <span className="font-mono font-semibold">{primary}</span>
                  {secondary && <span className="text-xs text-muted-foreground truncate">— {secondary}</span>}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}