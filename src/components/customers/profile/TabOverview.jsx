import ProfileField, { SectionTitle } from "./ProfileField";
import StatusBadge from "@/components/ui/StatusBadge";

export default function TabOverview({ customer }) {
  return (
    <div className="space-y-6">
      {/* Business Details */}
      <div>
        <SectionTitle>Business Details</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ProfileField label="Legal Name" value={customer.name} />
          <ProfileField label="Trading Name" value={customer.trading_name} />
          <ProfileField label="Customer Type" value={customer.customer_type?.replace(/_/g, " ")} />
          <ProfileField label="ABN" value={customer.abn} mono />
          <ProfileField label="ACN" value={customer.acn} mono />
          <ProfileField label="Date Established" value={customer.date_established} />
          <ProfileField label="Nature of Business" value={customer.nature_of_business} span />
          <ProfileField label="Paid Up Capital" value={customer.paid_up_capital} />
          <ProfileField label="Est. Monthly Purchases" value={customer.estimated_monthly_purchases} />
          <ProfileField label="Credit Limit Required" value={customer.credit_limit_required} />
          <ProfileField label="Premises Type" value={customer.premises_type?.replace(/_/g, " ")} />
        </div>
      </div>

      {/* Account Info */}
      <div>
        <SectionTitle>Account Information</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ProfileField label="Account Status" value={customer.account_status?.replace(/_/g, " ")} />
          <ProfileField label="Payment Terms" value={customer.payment_terms?.replace(/_/g, " ")} />
          <ProfileField label="Pricing Tier" value={customer.pricing_tier} />
          <ProfileField label="Account Manager" value={customer.account_manager} />
          <ProfileField label="Service Region" value={customer.service_region?.replace(/_/g, " ")} />
          <ProfileField label="PO Required" value={customer.po_required} />
          <ProfileField label="Accounts Emailed" value={customer.accounts_emailed} />
          <ProfileField label="Accounts Email" value={customer.accounts_email} />
          <ProfileField label="Accounts Contact" value={customer.accounts_contact_name} />
          <ProfileField label="Accounts Phone" value={customer.accounts_contact_phone} />
        </div>
      </div>

      {/* Banking */}
      {(customer.bank_branch || customer.bank_account_number) && (
        <div>
          <SectionTitle>Banking Details</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="Bank & Branch" value={customer.bank_branch} />
            <ProfileField label="Account Number" value={customer.bank_account_number} mono />
          </div>
        </div>
      )}

      {/* Notes */}
      {(customer.internal_notes || customer.notes) && (
        <div>
          <SectionTitle>Notes</SectionTitle>
          <div className="space-y-3">
            {customer.internal_notes && (
              <div className="bg-muted/30 rounded-sm p-3">
                <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Internal Notes</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{customer.internal_notes}</p>
              </div>
            )}
            {customer.notes && (
              <div className="bg-muted/30 rounded-sm p-3">
                <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">General Notes</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}