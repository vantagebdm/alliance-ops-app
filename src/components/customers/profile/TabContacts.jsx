import { SectionTitle } from "./ProfileField";
import { Phone, Mail, Smartphone } from "lucide-react";

export default function TabContacts({ customer }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Primary Contact</SectionTitle>
        <div className="border border-border rounded-sm overflow-hidden">
          <div className="bg-primary/5 px-4 py-2 border-b border-border flex items-center gap-2">
            <span className="font-heading text-xs uppercase tracking-wider text-primary">Primary</span>
            <span className="font-semibold text-sm text-foreground">{customer.name}</span>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-sm text-primary hover:underline">{customer.email}</a>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Phone</p>
                  <a href={`tel:${customer.phone}`} className="text-sm">{customer.phone}</a>
                </div>
              </div>
            )}
            {customer.mobile && (
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Mobile</p>
                  <a href={`tel:${customer.mobile}`} className="text-sm">{customer.mobile}</a>
                </div>
              </div>
            )}
            {customer.fax && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Fax</p>
                  <span className="text-sm">{customer.fax}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(customer.accounts_contact_name || customer.accounts_email) && (
        <div>
          <SectionTitle>Accounts Contact</SectionTitle>
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="bg-muted/20 px-4 py-2 border-b border-border">
              <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">Accounts / Billing</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {customer.accounts_contact_name && (
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Name</p>
                  <p className="text-sm">{customer.accounts_contact_name}</p>
                </div>
              )}
              {customer.accounts_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Email</p>
                    <a href={`mailto:${customer.accounts_email}`} className="text-sm text-primary hover:underline">{customer.accounts_email}</a>
                  </div>
                </div>
              )}
              {customer.accounts_contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">Phone</p>
                    <span className="text-sm">{customer.accounts_contact_phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-center py-4 text-muted-foreground/50 text-xs font-heading uppercase tracking-wider border border-dashed border-border rounded-sm">
        Additional contacts can be added in a future update
      </div>
    </div>
  );
}