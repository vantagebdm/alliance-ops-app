import { useNavigate } from "react-router-dom";
import { Plus, FileText, ShoppingCart, Package, MessageSquare, Truck } from "lucide-react";

const ACTIONS = [
  { label: "New Enquiry", icon: MessageSquare, path: "/enquiries", color: "bg-primary" },
  { label: "New Quote", icon: FileText, path: "/quotes", color: "bg-blue-600" },
  { label: "New Order", icon: ShoppingCart, path: "/orders", color: "bg-amber-600" },
  { label: "Add Part", icon: Package, path: "/parts", color: "bg-purple-600" },
  { label: "New Dispatch", icon: Truck, path: "/dispatch", color: "bg-teal-600" },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
      <div className="bg-[hsl(0,0%,8%)] px-4 py-3">
        <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">
          Quick Actions
        </h3>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-4 border border-[hsl(0,0%,20%)] rounded-sm hover:bg-[hsl(0,0%,16%)] transition-colors group"
            >
              <div className={`w-10 h-10 ${action.color} rounded-sm flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-[10px] uppercase tracking-wider text-white/60 font-semibold">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}