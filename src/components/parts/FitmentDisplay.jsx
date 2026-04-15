import { EQUIPMENT_TYPE_OPTIONS } from "./FitmentBuilder";
import { Cpu } from "lucide-react";

function formatYearRange(fitment) {
  if (fitment.fitment_type === "range_based" && (fitment.year_from || fitment.year_to)) {
    return `${fitment.year_from || "?"} – ${fitment.year_to || "Present"}`;
  }
  if (fitment.fitment_type === "year_based" && fitment.specific_years?.length) {
    return fitment.specific_years.join(", ");
  }
  if (fitment.fitment_type === "all_models") return "All Models";
  return null;
}

export default function FitmentDisplay({ fitments = [] }) {
  if (!fitments.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-primary" />
        <span className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground/60">
          Compatible Fitments / Applications
        </span>
        <span className="text-[10px] font-heading text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
          {fitments.length}
        </span>
      </div>
      <div className="space-y-2">
        {fitments.map((f, i) => {
          const eqLabel = EQUIPMENT_TYPE_OPTIONS.find(e => e.value === f.equipment_type)?.label;
          const mfr = f.manufacturer === "Other" && f.manufacturer_custom ? f.manufacturer_custom : f.manufacturer;
          const yearRange = formatYearRange(f);

          return (
            <div key={f._id || i} className="border border-border rounded-sm p-3 bg-muted/20">
              <div className="flex items-start gap-2 flex-wrap">
                {eqLabel && (
                  <span className="text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-sm flex-shrink-0">
                    {eqLabel}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {mfr && <span className="font-heading font-semibold text-sm text-foreground">{mfr}</span>}
                    {f.model && <span className="text-sm text-foreground/80">{f.model}</span>}
                    {f.series_variant && <span className="text-xs text-muted-foreground">{f.series_variant}</span>}
                    {yearRange && (
                      <span className="text-xs text-primary font-heading font-semibold">{yearRange}</span>
                    )}
                  </div>
                  {f.engine_spec && (
                    <div className="text-xs text-muted-foreground mt-0.5">⚙ {f.engine_spec}</div>
                  )}
                  {(f.serial_from || f.serial_to) && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Serial: {f.serial_from || "?"} – {f.serial_to || "?"}
                    </div>
                  )}
                  {f.fitment_notes && (
                    <div className="text-xs text-amber-600/80 mt-0.5 italic">{f.fitment_notes}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}