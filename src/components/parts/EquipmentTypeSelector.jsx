import { Truck, Car, Container, Construction, Zap, Tractor, Anchor, Settings, Cpu, Package, HelpCircle } from "lucide-react";

const EQUIPMENT_TYPES = [
  {
    value: "light_vehicles",
    label: "Light Vehicles",
    code: "LV",
    icon: Car,
    description: "4WDs, utes, passenger vehicles, SUVs",
    iconColor: "text-blue-400",
  },
  {
    value: "light_trucks",
    label: "Light Trucks",
    code: "LT",
    icon: Truck,
    description: "Vans, cab-chassis, light commercials under 4.5T",
    iconColor: "text-sky-400",
  },
  {
    value: "heavy_trucks",
    label: "Heavy Trucks / Prime Movers",
    code: "HT",
    icon: Truck,
    description: "B-doubles, road trains, prime movers, semis",
    iconColor: "text-amber-400",
  },
  {
    value: "trailers",
    label: "Trailers",
    code: "TR",
    icon: Container,
    description: "Semi-trailers, flat decks, tippers, tankers",
    iconColor: "text-orange-400",
  },
  {
    value: "earthmoving",
    label: "Earthmoving Equipment",
    code: "EM",
    icon: Construction,
    description: "Excavators, dozers, graders, dump trucks, loaders",
    iconColor: "text-yellow-400",
  },
  {
    value: "plant_equipment",
    label: "Plant & Equipment",
    code: "PE",
    icon: Settings,
    description: "Forklifts, compactors, telehandlers, cranes",
    iconColor: "text-lime-400",
  },
  {
    value: "fixed_plant",
    label: "Fixed Plant",
    code: "FP",
    icon: Cpu,
    description: "Conveyors, crushers, screens, fixed machinery",
    iconColor: "text-green-400",
  },
  {
    value: "generators",
    label: "Generators & Lighting Towers",
    code: "GL",
    icon: Zap,
    description: "Diesel generators, light towers, mobile power",
    iconColor: "text-primary",
  },
  {
    value: "agricultural",
    label: "Agricultural Equipment",
    code: "AG",
    icon: Tractor,
    description: "Tractors, harvesters, headers, farm machinery",
    iconColor: "text-emerald-400",
  },
  {
    value: "marine",
    label: "Marine",
    code: "MR",
    icon: Anchor,
    description: "Vessels, outboard, marine diesel, workboats",
    iconColor: "text-cyan-400",
  },
  {
    value: "other",
    label: "Other / Uncategorised",
    code: "OT",
    icon: HelpCircle,
    description: "Parts not assigned to a specific equipment type",
    iconColor: "text-gray-400",
  },
];

export { EQUIPMENT_TYPES };

export default function EquipmentTypeSelector({ onSelect, counts = {} }) {
  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-foreground mb-1">
          Select Equipment Type
        </h2>
        <p className="text-sm text-muted-foreground font-body">
          Choose a category to view and manage parts for that equipment type
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* All Parts card first */}
        <button
          onClick={() => onSelect("all")}
          className="group text-left p-5 rounded-sm border-2 border-primary/30 hover:border-primary bg-primary/5 transition-all duration-150"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/15 rounded-sm flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">All Parts</span>
                <span className="font-heading text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-sm font-bold">ALL</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">View entire parts catalogue across all equipment types</p>
              {counts["all"] > 0 && (
                <div className="mt-2 font-heading text-xs font-bold text-primary">{counts["all"]} parts</div>
              )}
            </div>
          </div>
        </button>

        {EQUIPMENT_TYPES.map(type => {
          const Icon = type.icon;
          const count = counts[type.value] || 0;
          return (
            <button
              key={type.value}
              onClick={() => onSelect(type.value)}
              className="group text-left p-5 rounded-sm border-2 border-[hsl(0,0%,28%)] hover:border-[hsl(0,0%,38%)] bg-[hsl(0,0%,18%)] transition-all duration-150"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[hsl(0,0%,16%)] rounded-sm flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${type.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground leading-tight">{type.label}</span>
                    <span className="font-heading text-[10px] bg-[hsl(0,0%,16%)] text-white/50 px-1.5 py-0.5 rounded-sm font-bold">{type.code}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{type.description}</p>
                  {count > 0 && (
                    <div className={`mt-2 font-heading text-xs font-bold ${type.iconColor}`}>{count} parts</div>
                  )}
                  {count === 0 && (
                    <div className="mt-2 font-heading text-[10px] text-muted-foreground/50 uppercase tracking-wider">No parts yet</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}