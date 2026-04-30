import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";

export default function PartAutocomplete({ value, onSelect, onChange, placeholder, className }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [open]);

  const handleInputChange = async (val) => {
    onChange(val);
    
    if (!val || val.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const results = await base44.entities.Part.list(null, 500);
      const filtered = results.filter(item =>
        String(item.part_number || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.app_part_number || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.name || "").toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } catch (e) {
      setSuggestions([]);
      setOpen(false);
    }
    setLoading(false);
  };

  const handleSelect = (item) => {
    onChange(item.part_number);
    onSelect(item);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (!value) {
            base44.entities.Part.list(null, 500).then(results => {
              setSuggestions(results);
              setOpen(true);
            });
          }
        }}
        placeholder={placeholder}
        className={`flex h-9 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] text-foreground px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono font-semibold ${className}`}
      />
      {open && createPortal(
        <div style={dropdownStyle} className="bg-card border border-border rounded-md shadow-xl max-h-56 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm transition-colors flex items-baseline gap-2 border-b border-border/30 last:border-b-0"
              >
                <span className="font-mono font-semibold text-foreground">{item.part_number}</span>
                {item.name && <span className="text-xs text-muted-foreground truncate">— {item.name}</span>}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}