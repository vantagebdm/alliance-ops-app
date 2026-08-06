import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, FileText, ShoppingCart,
  Package, Warehouse, ShoppingBag, Truck, Users,
  Receipt, BarChart3, Settings, X, Send, TrendingUp, ClipboardList, ArrowDownToLine, BarChart2, RefreshCw,
  BookOpen, Building2, Calculator, BookMarked, CreditCard, DollarSign, Code2, Boxes
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "Enquiries", icon: MessageSquare, path: "/enquiries" },
      { label: "Quotes", icon: FileText, path: "/quotes" },
      { label: "Sales Orders", icon: ShoppingCart, path: "/orders" },
      { label: "Distributions", icon: Boxes, path: "/distributions" },
    ]
  },
  {
    label: "Parts & Stock",
    items: [
      { label: "Parts Master", icon: Package, path: "/parts" },
      { label: "Inventory Control", icon: Warehouse, path: "/inventory" },
      { label: "Purchasing", icon: ShoppingBag, path: "/purchasing" },
      { label: "Receive Stock", icon: ArrowDownToLine, path: "/receive-stock" },
      { label: "Smart Reorder", icon: RefreshCw, path: "/smart-reorder" },
      { label: "Suppliers", icon: Truck, path: "/suppliers" },
    ]
  },
  {
    label: "Customers & Finance",
    items: [
      { label: "Customers", icon: Users, path: "/customers" },
      { label: "Dispatch", icon: Send, path: "/dispatch" },
      { label: "Invoices", icon: Receipt, path: "/invoices" },
      { label: "Cashflow", icon: TrendingUp, path: "/cashflow" },
      { label: "Credit Application", icon: ClipboardList, path: "/credit-application" },
    ]
  },
  {
    label: "Accounting",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/accounting?tab=dashboard" },
      { label: "Chart of Accounts", icon: BookOpen, path: "/accounting?tab=chart_of_accounts" },
      { label: "Bank & Recon", icon: Building2, path: "/accounting?tab=bank" },
      { label: "Accounts Receivable", icon: DollarSign, path: "/accounting?tab=ar" },
      { label: "Accounts Payable", icon: CreditCard, path: "/accounting?tab=ap" },
      { label: "Payroll", icon: Users, path: "/accounting?tab=payroll" },
      { label: "BAS Preparation", icon: Calculator, path: "/accounting?tab=bas" },
      { label: "Journals", icon: BookMarked, path: "/accounting?tab=journals" },
      { label: "Reports", icon: BarChart2, path: "/accounting?tab=reports" },
    ]
  },
  {
    label: "System",
    items: [
      { label: "Platform Development", icon: Code2, path: "/platform-development" },
      { label: "Reports", icon: BarChart3, path: "/reports" },
      { label: "Admin", icon: Settings, path: "/admin" },
    ]
  },
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

        <nav className="px-2 py-4 space-y-4 overflow-y-auto h-full pb-8">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              <div className="px-3 mb-1.5">
                <span className="font-heading text-[9px] uppercase tracking-widest text-white/25 font-semibold">{section.label}</span>
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const itemPath = item.path.split("?")[0];
                  const isActive = (location.pathname === itemPath && (!item.path.includes("?") || location.search === `?${item.path.split("?")[1]}`)) ||
                    (itemPath !== "/" && location.pathname.startsWith(itemPath) && !item.path.includes("?") && itemPath !== "/accounting");
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-100
                        ${
                          isActive
                            ? "bg-primary/15 text-primary border-l-2 border-primary pl-[10px]"
                            : "text-white/55 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-body text-xs uppercase tracking-wider">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}