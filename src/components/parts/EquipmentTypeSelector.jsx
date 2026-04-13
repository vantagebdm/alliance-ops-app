import { Truck, Car, Container, Construction, Zap, Tractor, Anchor, Settings, Cpu, Package, HelpCircle } from "lucide-react";

const EQUIPMENT_TYPES = [
  {
    value: "light_vehicles",
    label: "Light Vehicles",
    code: "LV",
    icon: Car,
    description: "4WDs, utes, passenger vehicles, SUVs",
    color: "border-blue-500/40 hover:border-blue-500",
    iconColor: "text-blue-400",
    bg: "bg-blue-500/5",
  },
  {
    value: "light_trucks",
    label: "Light Trucks",
    code: "LT",
    icon: Truck,
    description: "Vans, cab-chassis, light commercials under 4.5T",
    color: "border-sky-500/40 hover:border-sky-500",
    iconColor: "text-sky-400",
    bg: "bg-sky-500/5",
  },
  {
    value: "heavy_trucks",
    label: "Heavy Trucks / Prime Movers",
    code: "HT",
    icon: Truck,
    description: "B-doubles, road trains, prime movers, semis",
    color: "border-amber-500/40 hover:border-amber-500",
    iconColor: "text-amber-400",
    bg: "bg-amber-500/5",
  },
  {
    value: "trailers",
    label: "Trailers",
    code: "TR",
    icon: Container,
    description: "Semi-trailers, flat decks, tippers, tankers",
    color: "border-orange-500/40 hover:border-orange-500",
    iconColor: "text-orange-400",
    bg: "bg-orange-500/5",
  },
  {
    value: "earthmoving",
    label: "Earthmoving Equipment",
    code: "EM",
    icon: Construction,
    description: "Excavators, dozers, graders, dump trucks, loaders",
    color: "border-yellow-500/40 hover:border-yellow-500",
    iconColor: "text-yellow-400",
    bg: "bg-yellow-500/5",
  },
  {
    value: "plant_equipment",
    label: "Plant & Equipment",
    code: "PE",
    icon: Settings,
    description: "Forklifts, compactors, telehandlers, cranes",
    color: "border-lime-500/40 hover:border-lime-500",
    iconColor: "text-lime-400",
    bg: "bg-lime-500/5",
  },
  {
    value: "fixed_plant",
    label: "Fixed Plant",
    code: "FP",
    icon: Cpu,
    description: "Conveyors, crushers, screens, fixed machinery",
    color: "border-green-500/40 hover:border-green-500",
    iconColor: "text-green-400",
    bg: "bg-green-500/5",
  },
  {
    value: "generators",
    label: "Generators & Lighting Towers",
    code: "GL",
    icon: Zap,
    description: "Diesel generators, light towers, mobile power",
    color: "border-primary/40 hover:border-primary",
    iconColor: "text-primary",
    bg: "bg-primary/5",
  },
  {
    value: "agricultural",
    label: "Agricultural Equipment",
    code: "AG",
    icon: Tractor,
    description: "Tractors, harvesters, headers, farm machinery",
    color: "border-emerald-500/40 hover:border-emerald-500",
    iconColor: "text-emerald-400",
    bg: "bg-emerald-500/5",
  },
  {
    value: "marine",
    label: "Marine",
    code: "MR",
    icon: Anchor,
    description: "Vessels, outboard, marine diesel, workboats",
    color: "border-cyan-500/40 hover:border-cyan-500",
    iconColor: "text-cyan-400",
    bg: "bg-cyan-500/5",
  },
  {
    value: "other",
    label: "Other / Uncategorised",
    code: "OT",
    icon: HelpCircle,
    description: "Parts not assigned to a specific equipment type",
    color: "border-gray-500/40 hover:border-gray-500",
    iconColor: "text-gray-400",
    bg: "bg-gray-500/5",
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
              className={`group text-left p-5 rounded-sm border-2 ${type.color} ${type.bg} transition-all duration-150`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 bg-black/5 rounded-sm flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${type.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground leading-tight">{type.label}</span>
                    <span className={`font-heading text-[10px] bg-black/5 px-1.5 py-0.5 rounded-sm font-bold ${type.iconColor}`}>{type.code}</span>
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