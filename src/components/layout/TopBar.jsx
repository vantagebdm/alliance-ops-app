import { User, Menu } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import QuickAddButton from "@/components/QuickAdd/QuickAddButton";
import { useQuickAddContext } from "@/hooks/useQuickAddContext";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function TopBar({ onToggleSidebar }) {
  const contextData = useQuickAddContext();

  return (
    <header className="h-14 bg-[hsl(0,0%,4%)] border-b border-[hsl(0,0%,12%)] flex items-center px-4 gap-4 fixed top-0 left-0 right-0 z-50">
      {/* Mobile menu toggle */}
      <button onClick={onToggleSidebar} className="lg:hidden text-white/70 hover:text-white">
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-8 h-8 bg-primary flex items-center justify-center">
          <span className="font-heading font-bold text-black text-sm">AP</span>
        </div>
        <div className="hidden sm:block">
          <span className="font-heading text-white text-sm font-semibold tracking-wider uppercase">
            Alliance Priority
          </span>
          <span className="font-heading text-primary text-xs block tracking-widest uppercase">
            Parts ERP
          </span>
        </div>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <GlobalSearch />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="hidden sm:block">
          <QuickAddButton contextData={contextData} />
        </div>
        <button className="flex items-center gap-2 p-2 text-white/60 hover:text-white transition-colors">
          <div className="w-7 h-7 bg-[hsl(0,0%,20%)] rounded-sm flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}