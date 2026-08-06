import React, { useState, useMemo } from "react";
import { Plus, Search, PackageX } from "lucide-react";
import { TOTAL_ENERGIES_PRODUCTS, TOTAL_ENERGIES_CATEGORIES, DISTRIBUTION_SUPPLIERS, productUnitPrice } from "@/lib/distributionData";

const fmt = (n) => (n == null ? "—" : `$${Number(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

export default function DistributionCatalog({ supplierId, onAddToProposal }) {
  const supplier = DISTRIBUTION_SUPPLIERS.find((s) => s.id === supplierId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const products = supplierId === "total_energies" ? TOTAL_ENERGIES_PRODUCTS : [];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchQ = !q || p.sku.toLowerCase().includes(q) || p.product.toLowerCase().includes(q) || p.family.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, query, category]);

  if (!supplier?.loaded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageX className="w-12 h-12 text-white/20 mb-3" />
        <h3 className="font-heading text-lg text-white/70 uppercase tracking-wider">{supplier?.name || "Supplier"} — Coming Soon</h3>
        <p className="text-white/40 text-sm mt-1">Product catalog for this supplier has not been loaded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code, product or family..."
            className="w-full h-9 pl-8 pr-3 rounded-md border border-input bg-[hsl(0,0%,10%)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 rounded-md border border-input bg-[hsl(0,0%,10%)] text-sm px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Categories</option>
          {TOTAL_ENERGIES_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-xs text-white/40">{filtered.length} products</span>
      </div>

      <div className="overflow-auto rounded-md border border-[hsl(0,0%,14%)] max-h-[calc(100vh-280px)]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[hsl(0,0%,12%)] z-10">
            <tr className="text-left">
              <th className="px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-white/50">Code</th>
              <th className="px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-white/50">Product</th>
              <th className="px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-white/50">Family</th>
              <th className="px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-white/50">Category</th>
              <th className="px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-white/50">Pack Size</th>
              <th className="px-3 py-2 text-right font-heading text-[10px] uppercase tracking-wider text-white/50">List Price</th>
              <th className="px-3 py-2 text-right font-heading text-[10px] uppercase tracking-wider text-white/50">Unit Price</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.sku + i} className="border-t border-[hsl(0,0%,14%)] hover:bg-white/5">
                <td className="px-3 py-2 font-mono text-xs text-white/80">{p.sku}</td>
                <td className="px-3 py-2 text-white/90">{p.product}</td>
                <td className="px-3 py-2 text-white/60">{p.family}</td>
                <td className="px-3 py-2 text-white/60 text-xs">{p.category}</td>
                <td className="px-3 py-2 text-white/80">{p.pack_size}</td>
                <td className="px-3 py-2 text-right text-white/90">{fmt(p.list_price)}</td>
                <td className="px-3 py-2 text-right text-white/60 whitespace-nowrap">{(() => { const pu = productUnitPrice(p); return `${fmt(pu.price)} ${pu.label}`; })()}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => onAddToProposal(p)}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded text-xs bg-primary/15 text-primary hover:bg-primary/25"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}