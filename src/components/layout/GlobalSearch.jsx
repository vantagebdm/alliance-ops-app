import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Package, Users, FileText, ShoppingCart, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";

const SEARCH_CATEGORIES = [
  { key: "parts", label: "PARTS", icon: Package, entity: "Part", fields: ["part_number", "name"], path: "/parts" },
  { key: "customers", label: "CUSTOMERS", icon: Users, entity: "Customer", fields: ["name", "company"], path: "/customers" },
  { key: "enquiries", label: "ENQUIRIES", icon: FileText, entity: "Enquiry", fields: ["enquiry_number", "customer_name"], path: "/enquiries" },
  { key: "orders", label: "ORDERS", icon: ShoppingCart, entity: "SalesOrder", fields: ["order_number", "customer_name"], path: "/orders" },
];

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const doSearch = useCallback(
    debounce(async (q) => {
      if (!q || q.length < 2) { setResults({}); return; }
      setLoading(true);
      const res = {};
      for (const cat of SEARCH_CATEGORIES) {
        try {
          const items = await base44.entities[cat.entity].list("-created_date", 50);
          const lq = q.toLowerCase();
          res[cat.key] = items.filter(item =>
            cat.fields.some(f => item[f] && item[f].toLowerCase().includes(lq))
          ).slice(0, 5);
        } catch {
          res[cat.key] = [];
        }
      }
      setResults(res);
      setLoading(false);
    }, 300),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    doSearch(e.target.value);
  };

  const hasResults = Object.values(results).some(r => r && r.length > 0);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,20%)] rounded-sm px-3 h-9">
        <Search className="w-4 h-4 text-white/40 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search parts, customers, orders..."
          className="bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none w-full font-body"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults({}); setOpen(false); }}>
            <X className="w-4 h-4 text-white/40" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,18%)] rounded-sm shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-white/40 text-sm">Searching...</div>
          )}
          {!loading && !hasResults && (
            <div className="p-4 text-center text-white/40 text-sm">No results found</div>
          )}
          {!loading && SEARCH_CATEGORIES.map(cat => {
            const items = results[cat.key];
            if (!items || items.length === 0) return null;
            const Icon = cat.icon;
            return (
              <div key={cat.key}>
                <div className="px-3 py-2 bg-[hsl(0,0%,6%)] flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="font-heading text-xs text-white/60 uppercase tracking-wider">{cat.label}</span>
                </div>
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(`${cat.path}/${item.id}`);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[hsl(0,0%,14%)] flex items-center gap-3 transition-colors"
                  >
                    <span className="text-white text-sm font-medium">
                      {item[cat.fields[0]]}
                    </span>
                    {item[cat.fields[1]] && (
                      <span className="text-white/40 text-xs">{item[cat.fields[1]]}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}