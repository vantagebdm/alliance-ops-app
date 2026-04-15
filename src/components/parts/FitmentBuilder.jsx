import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: "light_vehicles", label: "Light Vehicles" },
  { value: "light_trucks", label: "Light Trucks" },
  { value: "heavy_trucks", label: "Heavy Trucks / Prime Movers" },
  { value: "trailers", label: "Trailers" },
  { value: "earthmoving", label: "Earthmoving Equipment" },
  { value: "plant_equipment", label: "Plant & Equipment" },
  { value: "fixed_plant", label: "Fixed Plant" },
  { value: "generators", label: "Generators & Lighting Towers" },
  { value: "agricultural", label: "Agricultural Equipment" },
  { value: "marine", label: "Marine" },
  { value: "other", label: "Other" },
];

const MANUFACTURER_OPTIONS = [
  "Toyota", "Ford", "Holden", "Nissan", "Isuzu", "Mitsubishi", "Mazda", "Hino",
  "Mercedes-Benz", "Volvo", "Mack", "Kenworth", "Peterbilt", "Scania", "MAN",
  "CAT", "Komatsu", "Hitachi", "Liebherr", "JCB", "Doosan", "Hyundai",
  "Cummins", "Perkins", "Detroit Diesel", "Deutz", "Yanmar",
  "John Deere", "Case IH", "New Holland", "Kubota",
  "Atlas Copco", "Sandvik", "Metso", "Other",
];

const FITMENT_TYPE_OPTIONS = [
  { value: "year_based", label: "Year Based" },
  { value: "range_based", label: "Range Based" },
  { value: "specification_based", label: "Specification Based" },
  { value: "all_models", label: "All Models" },
  { value: "unknown_manual", label: "Unknown / Manual" },
];

const YEARS = Array.from({ length: 55 }, (_, i) => String(2024 - i));

// Reusable multi-select dropdown with search
function MultiSelectDropdown({ options, value = [], onChange, placeholder, allowCustom = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => {
    const label = typeof o === "string" ? o : o.label;
    return label.toLowerCase().includes(search.toLowerCase()) && !value.includes(typeof o === "string" ? o : o.value);
  });

  const toggle = (val) => {
    if (value.includes(val)) onChange(value.filter(v => v !== val));
    else onChange([...value, val]);
  };

  const toggleAll = () => {
    if (value.length === filtered.length && filtered.length > 0) {
      onChange(value.filter(v => !filtered.map(o => typeof o === "string" ? o : o.value).includes(v)));
    } else {
      const allVals = filtered.map(o => typeof o === "string" ? o : o.value);
      const newSelection = [...new Set([...value, ...allVals])];
      onChange(newSelection);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !value.includes(trimmed)) { onChange([...value, trimmed]); }
    setCustomInput("");
  };

  const getLabel = (val) => {
    const found = options.find(o => (typeof o === "string" ? o : o.value) === val);
    return found ? (typeof found === "string" ? found : found.label) : val;
  };

  return (
    <div className="relative" ref={ref}>
      <div
        className="border border-input rounded-sm px-2 py-1.5 min-h-[36px] bg-transparent cursor-pointer focus-within:ring-1 focus-within:ring-ring"
        onClick={() => setOpen(o => !o)}
      >
        {value.length === 0 ? (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {value.map(v => (
              <span key={v} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm">
                {getLabel(v)}
                <button type="button" onClick={e => { e.stopPropagation(); toggle(v); }} className="text-primary/60 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
      </div>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-sm shadow-lg max-h-52 flex flex-col">
          <div className="p-2 border-b border-border space-y-2">
            <input
              autoFocus
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            {filtered.length > 0 && (
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); toggleAll(); }}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-sm font-heading uppercase tracking-wider"
              >
                <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center ${value.length === filtered.length && filtered.length > 0 ? "bg-primary border-primary" : "border-input"}`}>
                  {value.length === filtered.length && filtered.length > 0 && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                </div>
                All
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map(o => {
              const val = typeof o === "string" ? o : o.value;
              const label = typeof o === "string" ? o : o.label;
              const selected = value.includes(val);
              return (
                <div
                  key={val}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${selected ? "bg-primary/5 text-primary" : ""}`}
                  onMouseDown={e => { e.preventDefault(); toggle(val); }}
                >
                  <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary border-primary" : "border-input"}`}>
                    {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  {label}
                </div>
              );
            })}
            {filtered.length === 0 && !allowCustom && (
              <div className="px-3 py-2 text-xs text-muted-foreground">No results</div>
            )}
          </div>
          {allowCustom && (
            <div className="p-2 border-t border-border flex gap-1">
              <input
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                placeholder="Add custom entry..."
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                onClick={e => e.stopPropagation()}
              />
              {customInput && <button type="button" className="text-primary text-xs font-heading" onMouseDown={e => { e.preventDefault(); addCustom(); }}>Add</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const emptyFitment = () => ({
  _id: Math.random().toString(36).slice(2),
  equipment_types: [],
  manufacturers: [],
  model: "",
  series_variant: "",
  fitment_type: "",
  year_from: "",
  year_to: "",
  specific_years: [],
  engine_spec: "",
  serial_from: "",
  serial_to: "",
  vin_from: "",
  vin_to: "",
  fitment_notes: "",
});

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };
  return (
    <div className="border border-input rounded-sm px-2 py-1.5 min-h-[36px] bg-transparent focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap gap-1 mb-1">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="text-primary/60 hover:text-red-500">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
        />
        {input && (
          <button type="button" onClick={addTag} className="text-primary text-xs">Add</button>
        )}
      </div>
    </div>
  );
}

function YearMultiSelect({ value = [], onChange }) {
  return (
    <div className="border border-input rounded-sm p-2 bg-transparent focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap gap-1 mb-1">
        {value.map(y => (
          <span key={y} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 text-[10px] font-heading px-2 py-0.5 rounded-sm">
            {y}
            <button type="button" onClick={() => onChange(value.filter(x => x !== y))} className="text-primary/60 hover:text-red-500">×</button>
          </span>
        ))}
      </div>
      <select
        className="w-full bg-transparent text-sm outline-none text-muted-foreground"
        onChange={e => { if (e.target.value && !value.includes(e.target.value)) onChange([...value, e.target.value]); e.target.value = ""; }}
      >
        <option value="">Select year...</option>
        {YEARS.filter(y => !value.includes(y)).map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

function FitmentCard({ fitment, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(true);
  const u = (k, v) => onChange({ ...fitment, [k]: v });
  const eqTypes = fitment.equipment_types || (fitment.equipment_type ? [fitment.equipment_type] : []);
  const mfrs = fitment.manufacturers || (fitment.manufacturer ? [fitment.manufacturer] : []);
  const displayEq = eqTypes.map(v => EQUIPMENT_TYPE_OPTIONS.find(e => e.value === v)?.label).filter(Boolean).join(", ");
  const summary = [mfrs.join(", "), fitment.model, fitment.series_variant].filter(Boolean).join(" • ");

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-muted/30 cursor-pointer select-none"
        onClick={() => setExpanded(x => !x)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {displayEq && (
            <span className="text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-sm flex-shrink-0">
              {displayEq}
            </span>
          )}
          <span className="text-xs text-foreground/70 truncate">{summary || "New Fitment"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="text-red-400 hover:text-red-600 p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="p-3 grid grid-cols-2 gap-3 bg-white">
          {/* Equipment Type */}
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Equipment Type *</label>
            <MultiSelectDropdown
              options={EQUIPMENT_TYPE_OPTIONS}
              value={eqTypes}
              onChange={v => u("equipment_types", v)}
              placeholder="Select equipment types..."
            />
          </div>

          {/* Manufacturer */}
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Manufacturer *</label>
            <MultiSelectDropdown
              options={MANUFACTURER_OPTIONS}
              value={mfrs}
              onChange={v => u("manufacturers", v)}
              placeholder="Select manufacturers..."
              allowCustom
            />
          </div>

          {/* Model */}
          <div className="col-span-2">
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Model / Machine Type * <span className="text-muted-foreground normal-case">(comma separated or press Enter)</span></label>
            <TagInput value={fitment.model ? fitment.model.split(",").map(s => s.trim()).filter(Boolean) : []} onChange={tags => u("model", tags.join(", "))} placeholder="e.g. Hilux, LandCruiser, PC200..." />
          </div>

          {/* Series / Variant */}
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Series / Variant</label>
            <Input className="rounded-sm h-8 text-xs" placeholder="e.g. 79 Series, PX2, Tier 4..." value={fitment.series_variant} onChange={e => u("series_variant", e.target.value)} />
          </div>

          {/* Fitment Type */}
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Fitment Type *</label>
            <Select value={fitment.fitment_type} onValueChange={v => u("fitment_type", v)}>
              <SelectTrigger className="rounded-sm h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {FITMENT_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Year Logic */}
          {fitment.fitment_type === "year_based" && (
            <div className="col-span-2">
              <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Specific Years</label>
              <YearMultiSelect value={fitment.specific_years || []} onChange={v => u("specific_years", v)} />
            </div>
          )}
          {fitment.fitment_type === "range_based" && (
            <>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Year From</label>
                <Select value={fitment.year_from} onValueChange={v => u("year_from", v)}>
                  <SelectTrigger className="rounded-sm h-8 text-xs"><SelectValue placeholder="From..." /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Year To</label>
                <Select value={fitment.year_to} onValueChange={v => u("year_to", v)}>
                  <SelectTrigger className="rounded-sm h-8 text-xs"><SelectValue placeholder="To..." /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Engine / Spec */}
          <div className="col-span-2">
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Engine / Specification</label>
            <Input className="rounded-sm h-8 text-xs" placeholder="e.g. 4JJ1 Diesel, C15 Engine, 6 Cyl Turbo..." value={fitment.engine_spec} onChange={e => u("engine_spec", e.target.value)} />
          </div>

          {/* Serial / VIN Range */}
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Serial From</label>
            <Input className="rounded-sm h-8 text-xs" placeholder="Serial from..." value={fitment.serial_from} onChange={e => u("serial_from", e.target.value)} />
          </div>
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Serial To</label>
            <Input className="rounded-sm h-8 text-xs" placeholder="Serial to..." value={fitment.serial_to} onChange={e => u("serial_to", e.target.value)} />
          </div>
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">VIN From</label>
            <Input className="rounded-sm h-8 text-xs" placeholder="VIN from..." value={fitment.vin_from} onChange={e => u("vin_from", e.target.value)} />
          </div>
          <div>
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">VIN To</label>
            <Input className="rounded-sm h-8 text-xs" placeholder="VIN to..." value={fitment.vin_to} onChange={e => u("vin_to", e.target.value)} />
          </div>

          {/* Fitment Notes */}
          <div className="col-span-2">
            <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">Fitment Notes</label>
            <Textarea className="rounded-sm text-xs" rows={2} placeholder="e.g. Front axle only, excludes facelift models, mining spec..." value={fitment.fitment_notes} onChange={e => u("fitment_notes", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FitmentBuilder({ value = [], onChange }) {
  const addFitment = () => onChange([...value, emptyFitment()]);
  const updateFitment = (idx, updated) => onChange(value.map((f, i) => i === idx ? updated : f));
  const removeFitment = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {value.map((fitment, idx) => (
        <FitmentCard
          key={fitment._id || idx}
          fitment={fitment}
          onChange={updated => updateFitment(idx, updated)}
          onRemove={() => removeFitment(idx)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addFitment}
        className="w-full rounded-sm border-dashed border-primary/40 text-primary hover:bg-primary/5 font-heading text-xs uppercase tracking-wider"
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Fitment
      </Button>
    </div>
  );
}