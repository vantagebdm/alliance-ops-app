import { SectionTitle } from "./ProfileField";
import { Building2 } from "lucide-react";

export default function TabTradeRefs({ customer }) {
  const refs = (customer.trade_references || []).filter(r => r.business_name);

  return (
    <div className="space-y-4">
      <SectionTitle>Trade References</SectionTitle>
      {refs.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm p-8 text-center text-muted-foreground/50 text-xs font-heading uppercase tracking-wider">
          No trade references recorded
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
          {refs.map((ref, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Business</p>
                  <p className="text-sm font-semibold">{ref.business_name}</p>
                </div>
                {ref.address && (
                  <div>
                    <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Address</p>
                    <p className="text-sm">{ref.address}</p>
                  </div>
                )}
                {ref.contact && (
                  <div>
                    <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Contact</p>
                    <p className="text-sm">{ref.contact}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}