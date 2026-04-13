import { X } from "lucide-react";

export default function Autocomplete({
  value,
  suggestions,
  open,
  loading,
  onInputChange,
  onSelect,
  placeholder = "Type to search...",
  className = "",
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={placeholder}
        className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full text-left px-3 py-2 hover:bg-accent text-sm transition-colors"
              >
                {item.name || item.customer_name || item.supplier_name || item.part_number || "N/A"}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
          )}
        </div>
      )}
    </div>
  );
}