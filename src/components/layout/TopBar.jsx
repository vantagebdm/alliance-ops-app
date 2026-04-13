import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Plus, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlobalSearch from "./GlobalSearch";

export default function TopBar({ onToggleSidebar }) {
  const [searchOpen, setSearchOpen] = useState(false);

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
        <button className="relative p-2 text-white/60 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
        <Button size="sm" className="hidden sm:flex bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm h-8 px-3">
          <Plus className="w-4 h-4 mr-1" />
          Quick Add
        </Button>
        <button className="flex items-center gap-2 p-2 text-white/60 hover:text-white transition-colors">
          <div className="w-7 h-7 bg-[hsl(0,0%,20%)] rounded-sm flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}