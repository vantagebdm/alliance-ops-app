// Central category definitions for the Alliance Priority Parts ERP
// All modules must import from here to ensure consistency

export const PART_CATEGORIES = [
  { value: "engine",       label: "Engine" },
  { value: "transmission", label: "Transmission" },
  { value: "brakes",       label: "Brakes" },
  { value: "suspension",   label: "Suspension" },
  { value: "electrical",   label: "Electrical" },
  { value: "body",         label: "Body" },
  { value: "filters",      label: "Filters" },
  { value: "hydraulic",    label: "Hydraulic" },
  { value: "driveline",    label: "Driveline" },
  { value: "cooling",      label: "Cooling" },
  { value: "fuel",         label: "Fuel" },
  { value: "tyres",        label: "Tyres" },
  { value: "oils",         label: "Oils" },
  { value: "sprays",       label: "Sprays" },
  { value: "consumables",  label: "Consumables" },
  { value: "compliance",   label: "Compliance" },
  { value: "chemicals",    label: "Chemicals" },
  { value: "get",          label: "G.E.T" },
  { value: "seals",        label: "Seals" },
  { value: "fasteners",    label: "Fasteners" },
  { value: "air_system",   label: "Air System" },
  { value: "final_drive",  label: "Final Drive" },
  { value: "other",        label: "Other" },
];

export const CATEGORY_VALUES = PART_CATEGORIES.map(c => c.value);

export const CATEGORY_LABEL = Object.fromEntries(PART_CATEGORIES.map(c => [c.value, c.label]));

// Subcategories for new operational categories
export const SUBCATEGORIES = {
  oils: [
    "Engine Oil", "Hydraulic Oil", "Gear Oil", "Transmission Fluid",
    "Grease", "Coolant", "AdBlue", "Other",
  ],
  sprays: [
    "Brake Cleaner", "Penetrating Spray", "Silicone Spray", "Lubricant Spray",
    "Degreaser Spray", "Contact Cleaner", "Paint / Marking Spray", "Other",
  ],
  consumables: [
    "Rags / Wipes", "Fasteners", "Cable Ties", "Sealants", "Gaskets",
    "O-rings", "Workshop Consumables", "PPE", "Other",
  ],
  compliance: [
    "Safety Tags", "Inspection Tags", "Lockout / Tagout", "Signage",
    "SDS / Labels", "Spill Kit Components", "Fire Safety Items", "First Aid Compliance", "Other",
  ],
  chemicals: [
    "Degreasers", "Solvents", "Coolants", "Cleaning Chemicals", "Battery Chemicals",
    "Adhesives", "Sealants", "Treatment Fluids", "Other",
  ],
  seals: [
    "O-Rings", "Oil Seals", "Dust Seals", "Hydraulic Seals", "Gaskets", "Other",
  ],
  fasteners: [
    "Bolts", "Nuts", "Washers", "Studs", "Pins", "Clips", "Other",
  ],
  air_system: [
    "Air Dryers", "Valves", "Compressors", "Air Lines", "Fittings", "Filters", "Other",
  ],
  final_drive: [
    "Drive Shafts", "Hubs", "Wheel Motors", "Gearboxes", "Other",
  ],
  get: [
    "Teeth", "Adapters", "Shrouds", "Side Cutters", "Pins & Retainers", "Other",
  ],
};

// Categories that have subcategories
export const EXTENDED_CATEGORIES = ["oils", "sprays", "consumables", "compliance", "chemicals", "seals", "fasteners", "air_system", "final_drive", "get"];

// Categories requiring dangerous goods / hazmat fields
export const HAZMAT_CATEGORIES = ["oils", "sprays", "chemicals"];

// Category badge colour classes — dark theme safe
export const CATEGORY_COLORS = {
  engine:       "bg-slate-500/15 text-slate-300",
  transmission: "bg-slate-500/15 text-slate-300",
  brakes:       "bg-red-500/15 text-red-400",
  suspension:   "bg-slate-500/15 text-slate-300",
  electrical:   "bg-yellow-500/15 text-yellow-400",
  body:         "bg-gray-500/15 text-gray-400",
  filters:      "bg-blue-500/15 text-blue-400",
  hydraulic:    "bg-orange-500/15 text-orange-400",
  driveline:    "bg-slate-500/15 text-slate-300",
  cooling:      "bg-cyan-500/15 text-cyan-400",
  fuel:         "bg-orange-500/15 text-orange-400",
  tyres:        "bg-gray-500/15 text-gray-400",
  oils:         "bg-amber-500/15 text-amber-400",
  sprays:       "bg-purple-500/15 text-purple-400",
  consumables:  "bg-teal-500/15 text-teal-400",
  compliance:   "bg-green-500/15 text-green-400",
  chemicals:    "bg-rose-500/15 text-rose-400",
  get:          "bg-yellow-500/15 text-yellow-400",
  seals:        "bg-indigo-500/15 text-indigo-400",
  fasteners:    "bg-zinc-500/15 text-zinc-400",
  air_system:   "bg-sky-500/15 text-sky-400",
  final_drive:  "bg-violet-500/15 text-violet-400",
  other:        "bg-gray-500/15 text-gray-400",
};