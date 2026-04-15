import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, X } from "lucide-react";

export default function POSelector({ onSelect, selectedPO }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const all = await base44.entities.PurchaseOrder.list("-created_date", 50);
      const open = all.filter(po =>
        ["draft", "sent", "confirmed", "partial"].includes(po.status)
      );
      setResults(open);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = results.filter(po => {
    const q = search.toLowerCase();
    return (
      !q ||
      po.po_number?.toLowerCase().includes(q) ||
      po.supplier_name?.toLowerCase().includes(q)
    );
  });

  if (selectedPO) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Selected Purchase Order</h3>
          <button onClick={() => onSelect(null)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
            <X className="w-3 h-3" /> Change PO
          </button>
        </div>
        <div className="bg-muted/20 border border-border rounded-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">PO Number</div>
            <div className="font-heading font-bold text-primary">{selectedPO.po_number}</div>
          </div>
          <div>
            <div className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Supplier</div>
            <div className="font-bold text-sm">{selectedPO.supplier_name}</div>
          </div>
          <div>
            <div className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Status</div>
            <div className="text-sm capitalize">{selectedPO.status}</div>
          </div>
          <div>
            <div className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Total Value</div>
            <div className="text-sm font-bold">${(selectedPO.total || 0).toFixed(2)}</div>
          </div>
          {selectedPO.expected_date && (
            <div>
              <div className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Expected Date</div>
              <div className="text-sm">{selectedPO.expected_date}</div>
            </div>
          )}
          {selectedPO.notes && (
            <div className="col-span-2 md:col-span-3">
              <div className="font-heading text-[9px] uppercase tracking-wider text-muted-foreground">Notes</div>
              <div className="text-xs text-muted-foreground">{selectedPO.notes}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="font-heading text-base font-bold uppercase tracking-wider mb-1">Select Purchase Order</h2>
      <p className="text-xs text-muted-foreground mb-4">Search and select an open PO to receive against.</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by PO number or supplier..."
          className="w-full h-9 pl-9 pr-3 border border-input rounded-sm text-sm bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-4 text-center">Loading purchase orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">No open purchase orders found.</div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(0,0%,8%)] text-white">
              <tr>
                {["PO Number", "Supplier", "Status", "Items", "Total", "Expected"].map(h => (
                  <th key={h} className="font-heading text-[10px] uppercase tracking-wider px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((po, i) => (
                <tr
                  key={po.id}
                  onClick={() => onSelect(po)}
                  className={`cursor-pointer border-b border-border hover:bg-primary/5 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-muted/10"}`}
                >
                  <td className="px-3 py-2 font-heading font-bold text-primary">{po.po_number}</td>
                  <td className="px-3 py-2">{po.supplier_name}</td>
                  <td className="px-3 py-2 capitalize">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading font-bold uppercase ${
                      po.status === "partial" ? "bg-yellow-100 text-yellow-800" :
                      po.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                      "bg-muted text-muted-foreground"
                    }`}>{po.status}</span>
                  </td>
                  <td className="px-3 py-2">{(po.items || []).length}</td>
                  <td className="px-3 py-2 font-bold">${(po.total || 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{po.expected_date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}