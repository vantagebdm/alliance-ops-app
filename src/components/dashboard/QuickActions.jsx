import { useNavigate } from "react-router-dom";
import { ClipboardList, FileCheck, ShoppingBag, Wrench, PackageCheck } from "lucide-react";

const ACTIONS = [
  {
    label: "New Enquiry",
    icon: ClipboardList,
    path: "/enquiries",
    gradient: "from-emerald-500 to-green-600",
    glow: "shadow-emerald-500/30",
  },
  {
    label: "New Quote",
    icon: FileCheck,
    path: "/quotes",
    gradient: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/30",
  },
  {
    label: "New Order",
    icon: ShoppingBag,
    path: "/orders",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
  },
  {
    label: "Add Part",
    icon: Wrench,
    path: "/parts",
    gradient: "from-violet-500 to-purple-700",
    glow: "shadow-violet-500/30",
  },
  {
    label: "New Dispatch",
    icon: PackageCheck,
    path: "/dispatch",
    gradient: "from-teal-400 to-cyan-600",
    glow: "shadow-teal-500/30",
  },
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
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="group flex flex-col items-center gap-3 p-5 rounded-lg border border-[hsl(0,0%,20%)] bg-[hsl(0,0%,9%)] hover:border-[hsl(0,0%,28%)] hover:bg-[hsl(0,0%,13%)] transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg ${action.glow} group-hover:scale-110 group-hover:shadow-xl transition-all duration-200`}>
                <Icon className="w-5 h-5 text-white drop-shadow" strokeWidth={1.75} />
              </div>
              <span className="font-heading text-[10px] uppercase tracking-wider text-white/50 font-semibold group-hover:text-white/80 transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}