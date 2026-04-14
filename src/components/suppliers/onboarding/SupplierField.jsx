import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FL({ label, required, children, className = "" }) {
  return (
    <div className={className}>
      <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function FInput({ label, required, className, value, onChange, placeholder, type = "text" }) {
  return (
    <FL label={label} required={required} className={className}>
      <Input type={type} value={value || ""} onChange={onChange} placeholder={placeholder} className="rounded-sm h-8 text-sm" />
    </FL>
  );
}

export function FTextarea({ label, required, className, value, onChange, rows = 2 }) {
  return (
    <FL label={label} required={required} className={className}>
      <Textarea value={value || ""} onChange={onChange} className="rounded-sm text-sm" rows={rows} />
    </FL>
  );
}

export function FSelect({ label, required, className, value, onChange, options }) {
  return (
    <FL label={label} required={required} className={className}>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="rounded-sm h-8 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value || o} value={o.value || o}>{o.label || o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FL>
  );
}

export function FToggle({ label, checked, onChange, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-primary" : "bg-gray-300"} relative`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
      <span className="font-heading text-[10px] uppercase tracking-wider text-foreground/60">{label}</span>
    </div>
  );
}

export function FMultiCheck({ label, options, selected = [], onChange, className = "" }) {
  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val));
    else onChange([...selected, val]);
  };
  return (
    <div className={className}>
      <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-2 py-1 text-[10px] font-heading uppercase tracking-wider rounded-sm border transition-colors ${
              selected.includes(opt)
                ? "bg-primary/10 border-primary text-primary"
                : "border-border text-muted-foreground hover:border-foreground/40"
            }`}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}

export function FTagInput({ label, tags = [], onChange, className = "", placeholder = "Type and press Enter" }) {
  const handleKey = (e) => {
    if ((e.key === "Enter" || e.key === ",") && e.target.value.trim()) {
      e.preventDefault();
      const val = e.target.value.trim();
      if (!tags.includes(val)) onChange([...tags, val]);
      e.target.value = "";
    }
  };
  const remove = (t) => onChange(tags.filter(x => x !== t));
  return (
    <div className={className}>
      <label className="font-heading text-[10px] uppercase tracking-wider text-foreground/50 mb-1 block">{label}</label>
      <div className="border border-input rounded-sm p-2 min-h-[36px] flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-heading bg-primary/10 text-primary border border-primary/30 rounded-sm">
            {t}
            <button type="button" onClick={() => remove(t)} className="hover:text-red-500">×</button>
          </span>
        ))}
        <input
          type="text"
          onKeyDown={handleKey}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}