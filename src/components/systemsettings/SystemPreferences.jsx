import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-[hsl(0,0%,14%)] last:border-0">
    <div className="flex-1 pr-4">
      <div className="text-xs font-heading uppercase tracking-wider text-white">{label}</div>
      {desc && <div className="text-[10px] text-white/30 mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 mt-0.5 ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

const SelectRow = ({ label, options, value, onChange }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-[hsl(0,0%,14%)] last:border-0">
    <span className="text-xs font-heading uppercase tracking-wider text-white/60">{label}</span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-52 bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm h-8"><SelectValue /></SelectTrigger>
      <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
        {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

export default function SystemPreferences() {
  const [s, setS] = useState({
    timezone: "Australia/Perth", date_format: "DD/MM/YYYY",
    time_format: "12h", measurement: "Metric",
    default_page: "Dashboard", rows_per_page: "25",
    global_search: true, quick_add: true,
    keyboard_shortcuts: true, dark_mode_lock: true,
    help_text: true, tooltips: true, activity_feed: true, internal_notes: true,
  });
  const [saved, setSaved] = useState(false);
  const toggle = (k) => (v) => setS(x => ({ ...x, [k]: v }));
  const set = (k) => (v) => setS(x => ({ ...x, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">System Preferences</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="p-3 bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm">
        <p className="text-[10px] font-heading uppercase text-primary mb-2">Australian Defaults Active</p>
        <div className="flex flex-wrap gap-3">
          {[["Timezone","Australia/Perth"],["Currency","AUD"],["Date Format","DD/MM/YYYY"],["GST Rate","10%"],["Financial Year","1 July"]].map(([k,v]) => (
            <span key={k} className="text-[10px] text-white/50"><span className="text-white/30">{k}:</span> {v}</span>
          ))}
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Locale & Format</h3>
        <SelectRow label="Timezone" options={["Australia/Perth","Australia/Sydney","Australia/Brisbane","Australia/Adelaide","UTC"]} value={s.timezone} onChange={set("timezone")} />
        <SelectRow label="Date Format" options={["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"]} value={s.date_format} onChange={set("date_format")} />
        <SelectRow label="Time Format" options={["12h","24h"]} value={s.time_format} onChange={set("time_format")} />
        <SelectRow label="Measurement Units" options={["Metric","Imperial"]} value={s.measurement} onChange={set("measurement")} />
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">Interface</h3>
        <SelectRow label="Default Landing Page" options={["Dashboard","Enquiries","Sales Orders","Parts","Inventory"]} value={s.default_page} onChange={set("default_page")} />
        <SelectRow label="Table Rows Per Page" options={["10","25","50","100"]} value={s.rows_per_page} onChange={set("rows_per_page")} />
        <Toggle label="Enable Global Search" value={s.global_search} onChange={toggle("global_search")} />
        <Toggle label="Enable Quick Add" value={s.quick_add} onChange={toggle("quick_add")} />
        <Toggle label="Enable Keyboard Shortcuts" value={s.keyboard_shortcuts} onChange={toggle("keyboard_shortcuts")} />
        <Toggle label="Lock Dark Mode" desc="Prevent users switching to light mode" value={s.dark_mode_lock} onChange={toggle("dark_mode_lock")} />
        <Toggle label="Enable Help Text" value={s.help_text} onChange={toggle("help_text")} />
        <Toggle label="Enable Tooltips" value={s.tooltips} onChange={toggle("tooltips")} />
        <Toggle label="Enable Activity Feed" value={s.activity_feed} onChange={toggle("activity_feed")} />
        <Toggle label="Enable Internal Notes" value={s.internal_notes} onChange={toggle("internal_notes")} />
      </div>
    </div>
  );
}