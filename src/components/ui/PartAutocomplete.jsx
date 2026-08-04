import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { Wrench } from "lucide-react";
import PartInfoPopover from "@/components/ui/PartInfoPopover";

export default function PartAutocomplete({ value, onSelect, onChange, placeholder, className }) {
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const [serviceMode, setServiceMode] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // In service mode show all matches (full search); normal mode caps at 6
  const suggestions = serviceMode ? allSuggestions : allSuggestions.slice(0, 6);

  // Look up part details for cost/stock info when a value is present (e.g. editing existing line)
  useEffect(() => {
    if (!value || selectedPart) return;
    let active = true;
    base44.entities.Part.list(null, 500).then(results => {
      if (!active) return;
      const match = results.find(p =>
        p.part_number === value || p.app_part_number === value || p.supplier_sku === value
      );
      if (match) setSelectedPart(match);
    });
    return () => { active = false; };
  }, [value, selectedPart]);

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: serviceMode ? Math.max(rect.width, 480) : rect.width,
        zIndex: 10000,
      });
    }
  }, [open, serviceMode]);

  const handleInputChange = async (val) => {
    onChange(val);
    
    if (!val || val.length < 1) {
      setAllSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const results = await base44.entities.Part.list(null, 500);
      const filtered = results.filter(item =>
        String(item.part_number || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.supplier_sku || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.app_part_number || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.oem_number || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.aftermarket_number || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.cross_references || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.name || "").toLowerCase().includes(val.toLowerCase()) ||
        String(item.brand || "").toLowerCase().includes(val.toLowerCase())
      );
      setAllSuggestions(filtered);
      setOpen(filtered.length > 0);
    } catch (e) {
      setAllSuggestions([]);
      setOpen(false);
    }
    setLoading(false);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSelectedPart(item);
    setDisplayValue(item.app_part_number || item.part_number || "");
    setAllSuggestions([]);
    setOpen(false);
  };

  const handleDismiss = () => {
    setAllSuggestions([]);
    setOpen(false);
    setServiceMode(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={displayValue || value}
        onChange={(e) => { setDisplayValue(e.target.value); handleInputChange(e.target.value); }}
        onFocus={() => {
          if (!value) {
            base44.entities.Part.list(null, 500).then(results => {
              setAllSuggestions(results);
              setOpen(true);
            });
          }
        }}
        placeholder={placeholder}
        className={`flex h-9 w-full rounded-md border border-input bg-[hsl(0,0%,10%)] text-foreground px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono font-semibold ${selectedPart ? "pr-8" : ""} ${className}`}
      />
      <PartInfoPopover part={selectedPart} />
      {open && createPortal(
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9999 }}
            onClick={handleDismiss}
          />
          <div style={dropdownStyle} className="bg-card border border-border rounded-md shadow-2xl overflow-y-auto max-h-80">
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                    className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm transition-colors border-b border-border/30 last:border-b-0 ${serviceMode ? "py-2.5" : ""}`}
                  >
                    <div className="font-mono font-semibold text-primary">{item.app_part_number || item.part_number}</div>
                    {serviceMode ? (
                      <div className="text-xs text-foreground/80 mt-1 whitespace-normal break-words leading-snug">
                        {item.description || item.name}{item.supplier_sku ? ` · SKU: ${item.supplier_sku}` : ""}{item.brand ? ` · ${item.brand}` : ""}{item.make ? ` · ${item.make}` : ""}{item.model ? ` · ${item.model}` : ""}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground truncate">{item.name}{item.supplier_sku ? ` · ${item.supplier_sku}` : ""}</div>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setServiceMode(s => !s); }}
                  className={`w-full text-left px-3 py-2 text-xs font-heading font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 sticky bottom-0 ${serviceMode ? "bg-primary text-black" : "bg-[hsl(0,0%,14%)] text-primary hover:bg-[hsl(0,0%,18%)]"}`}
                >
                  <Wrench className="w-3 h-3" /> {serviceMode ? "Service Part Mode: On" : "Service Part"}
                </button>
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}