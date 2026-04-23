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

// Category badge colour classes
export const CATEGORY_COLORS = {
  engine:       "bg-slate-100 text-slate-700",
  transmission: "bg-slate-100 text-slate-700",
  brakes:       "bg-red-100 text-red-700",
  suspension:   "bg-slate-100 text-slate-700",
  electrical:   "bg-yellow-100 text-yellow-700",
  body:         "bg-gray-100 text-gray-600",
  filters:      "bg-blue-100 text-blue-700",
  hydraulic:    "bg-orange-100 text-orange-700",
  driveline:    "bg-slate-100 text-slate-700",
  cooling:      "bg-cyan-100 text-cyan-700",
  fuel:         "bg-orange-100 text-orange-700",
  tyres:        "bg-gray-100 text-gray-700",
  oils:         "bg-amber-100 text-amber-700",
  sprays:       "bg-purple-100 text-purple-700",
  consumables:  "bg-teal-100 text-teal-700",
  compliance:   "bg-green-100 text-green-700",
  chemicals:    "bg-rose-100 text-rose-700",
  get:          "bg-yellow-100 text-yellow-800",
  seals:        "bg-indigo-100 text-indigo-700",
  fasteners:    "bg-zinc-100 text-zinc-700",
  air_system:   "bg-sky-100 text-sky-700",
  final_drive:  "bg-violet-100 text-violet-700",
  other:        "bg-gray-100 text-gray-500",
};