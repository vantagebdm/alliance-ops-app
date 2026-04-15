import {
  FileText, ShoppingCart, MessageSquare, Users, Package,
  Truck, RotateCcw, Zap, Receipt, BarChart2, ClipboardList,
} from "lucide-react";

const MENU_SECTIONS = [
  {
    name: "PRIMARY ACTIONS",
    items: [
      { id: "quote", label: "New Quote", icon: FileText, action: "quote" },
      { id: "order", label: "New Sales Order", icon: ShoppingCart, action: "order" },
      { id: "enquiry", label: "New Enquiry", icon: MessageSquare, action: "enquiry" },
      { id: "customer", label: "Add New Customer", icon: Users, action: "customer" },
      { id: "part", label: "Add New Part", icon: Package, action: "part" },
    ],
  },
  {
    name: "PROCUREMENT",
    items: [
      { id: "po", label: "Create Purchase Order", icon: Truck, action: "po" },
      { id: "supplier", label: "Add Supplier", icon: Users, action: "supplier" },
    ],
  },
  {
    name: "INVENTORY",
    items: [
      { id: "receive", label: "Receive Stock", icon: RotateCcw, action: "receive" },
      { id: "adjustment", label: "Stock Adjustment", icon: BarChart2, action: "adjustment" },
    ],
  },
  {
    name: "FINANCIAL",
    items: [
      { id: "invoice", label: "Create Invoice", icon: Receipt, action: "invoice" },
    ],
  },
];

export default function QuickAddMenu({ onSelect, onClose }) {
  return (
    <div className="bg-white border border-border rounded-sm shadow-2xl w-80 max-h-96 overflow-y-auto">
      {MENU_SECTIONS.map((section, sidx) => (
        <div key={sidx}>
          {sidx > 0 && <div className="border-t border-border/50" />}
          <div className="px-3 py-2">
            <div className="font-heading text-[10px] uppercase tracking-wider text-foreground/40 font-semibold px-1 py-1">
              {section.name}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item.action);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-primary/10 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-primary flex-shrink-0 group-hover:text-primary" />
                    <span className="text-sm font-body text-foreground group-hover:text-foreground">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}