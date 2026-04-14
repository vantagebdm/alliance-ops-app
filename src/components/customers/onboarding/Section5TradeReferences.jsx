import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "./SectionHeader";
import FieldLabel from "./FieldLabel";

const emptyRef = () => ({ business_name: "", address: "", contact: "" });

export default function Section5TradeReferences({ form, update, extracted = {} }) {
  const refs = form.trade_references || [emptyRef(), emptyRef(), emptyRef()];
  const setRefs = (r) => update("trade_references", r);
  const updateRef = (i, k, v) => setRefs(refs.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addRef = () => setRefs([...refs, emptyRef()]);
  const removeRef = (i) => refs.length > 1 && setRefs(refs.filter((_, idx) => idx !== i));

  const E = (i, k) => extracted[`ref_${i}_${k}`];

  return (
    <div>
      <SectionHeader number="5" title="Trade References" />
      <p className="text-xs text-muted-foreground mb-3">Please provide companies that are willing to do trade references.</p>

      <div className="border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50 w-6">#</th>
              <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Business Name</th>
              <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Address</th>
              <th className="text-left px-3 py-2 font-heading text-[10px] uppercase tracking-wider text-foreground/50">Phone / Fax / Email</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {refs.map((r, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="px-3 py-2 text-xs text-muted-foreground font-heading">{i + 1}.</td>
                <td className="px-2 py-1.5">
                  <Input value={r.business_name} onChange={e => updateRef(i, "business_name", e.target.value)}
                    className={`rounded-sm h-8 text-xs ${E(i, "business_name") ? "ring-1 ring-primary/40" : ""}`} />
                </td>
                <td className="px-2 py-1.5">
                  <Input value={r.address} onChange={e => updateRef(i, "address", e.target.value)}
                    className={`rounded-sm h-8 text-xs ${E(i, "address") ? "ring-1 ring-primary/40" : ""}`} />
                </td>
                <td className="px-2 py-1.5">
                  <Input value={r.contact} onChange={e => updateRef(i, "contact", e.target.value)}
                    className={`rounded-sm h-8 text-xs ${E(i, "contact") ? "ring-1 ring-primary/40" : ""}`} placeholder="Phone / Fax / Email" />
                </td>
                <td className="px-2 py-1.5">
                  {refs.length > 1 && (
                    <button onClick={() => removeRef(i)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={addRef} className="mt-2 rounded-sm font-heading text-xs uppercase tracking-wider">
        <Plus className="w-3 h-3 mr-1" /> Add Additional Trade Reference
      </Button>
    </div>
  );
}