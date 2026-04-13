import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, FileText, ShoppingCart,
  Package, Warehouse, ShoppingBag, Truck as TruckIcon, Users,
  Receipt, BarChart3, Settings, X, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Enquiries", icon: MessageSquare, path: "/enquiries" },
  { label: "Quotes", icon: FileText, path: "/quotes" },
  { label: "Sales Orders", icon: ShoppingCart, path: "/orders" },
  { type: "divider" },
  { label: "Parts Master", icon: Package, path: "/parts" },
  { label: "Inventory", icon: Warehouse, path: "/inventory" },
  { label: "Purchasing", icon: ShoppingBag, path: "/purchasing" },
  { label: "Suppliers", icon: TruckIcon, path: "/suppliers" },
  { type: "divider" },
  { label: "Customers", icon: Users, path: "/customers" },
  { label: "Dispatch", icon: TruckIcon, path: "/dispatch" },
  { label: "Invoices", icon: Receipt, path: "/invoices" },
  { type: "divider" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
  { label: "Admin", icon: Settings, path: "/admin" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-14 left-0 bottom-0 w-56 bg-[hsl(0,0%,8%)] border-r border-[hsl(0,0%,14%)] z-40
        transition-transform duration-200 ease-out
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Mobile close */}
        <div className="lg:hidden flex justify-end p-2">
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-2 py-3 space-y-0.5 overflow-y-auto h-full">
          {NAV_ITEMS.map((item, i) => {
            if (item.type === "divider") {
              return <div key={i} className="h-px bg-[hsl(0,0%,14%)] my-2 mx-2" />;
            }
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-100
                  ${isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-white/60 hover:text-white hover:bg-[hsl(0,0%,12%)] border-l-2 border-transparent"
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-body text-xs uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}