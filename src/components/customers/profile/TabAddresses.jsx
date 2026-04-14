import { MapPin } from "lucide-react";
import { SectionTitle } from "./ProfileField";

function AddressBlock({ title, line1, line2, state, postcode }) {
  if (!line1) return (
    <div className="border border-dashed border-border rounded-sm p-4 text-center text-muted-foreground/50 text-xs font-heading uppercase tracking-wider">
      No {title} recorded
    </div>
  );
  return (
    <div className="border border-border rounded-sm overflow-hidden">
      <div className="bg-muted/20 px-4 py-2 border-b border-border flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      <div className="p-4 space-y-0.5">
        <p className="text-sm text-foreground">{line1}</p>
        {line2 && <p className="text-sm text-foreground">{line2}</p>}
        {(state || postcode) && <p className="text-sm text-foreground">{[state, postcode].filter(Boolean).join(" ")}</p>}
      </div>
    </div>
  );
}

export default function TabAddresses({ customer }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Physical Address</SectionTitle>
        <AddressBlock
          title="Physical / Site Address"
          line1={customer.physical_address_1 || customer.address}
          line2={customer.physical_address_2}
          state={customer.physical_state || customer.state}
          postcode={customer.physical_postcode || customer.postcode}
        />
      </div>

      <div>
        <SectionTitle>Billing Address</SectionTitle>
        <AddressBlock
          title="Billing Address"
          line1={customer.billing_address_1}
          line2={customer.billing_address_2}
          state={customer.billing_state}
          postcode={customer.billing_postcode}
        />
      </div>

      <div>
        <SectionTitle>Delivery Sites</SectionTitle>
        <div className="border border-dashed border-border rounded-sm p-6 text-center text-muted-foreground/50 text-xs font-heading uppercase tracking-wider">
          No additional delivery sites recorded
        </div>
      </div>

      {customer.delivery_notes && (
        <div className="bg-muted/20 rounded-sm p-4">
          <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Delivery Notes</p>
          <p className="text-sm">{customer.delivery_notes}</p>
        </div>
      )}
    </div>
  );
}