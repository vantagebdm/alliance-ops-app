import { useState } from "react";
import SupplierProfileHeader from "./profile/SupplierProfileHeader";
import SupplierProfileField, { ProfileSection, TagList } from "./profile/SupplierProfileField";
import { Star, FileText, ExternalLink, ShoppingCart, Package } from "lucide-react";

const TABS = ["Overview","Contacts","Addresses","Commercial","Procurement","Returns","Documents","Activity"];

export default function SupplierDetail({ supplier, onClose, onEdit, onStatusChanged }) {
  const [tab, setTab] = useState("Overview");
  const s = supplier;

  const renderTab = () => {
    switch (tab) {
      case "Overview":
        return (
          <div className="space-y-1">
            <ProfileSection title="Identity">
              <SupplierProfileField label="Legal Name" value={s.name} />
              <SupplierProfileField label="Trading Name" value={s.trading_name} />
              <SupplierProfileField label="Supplier Code" value={s.supplier_code} />
              <SupplierProfileField label="ABN" value={s.abn} />
              <SupplierProfileField label="ACN" value={s.acn} />
              <SupplierProfileField label="Website" value={s.website} />
              <SupplierProfileField label="Main Phone" value={s.phone} />
              <SupplierProfileField label="Main Email" value={s.email} />
            </ProfileSection>
            <ProfileSection title="Account Summary">
              <SupplierProfileField label="Account Number" value={s.account_number} />
              <SupplierProfileField label="Payment Terms" value={(s.payment_terms || "").replace(/_/g, " ")} />
              <SupplierProfileField label="Currency" value={s.currency} />
              <SupplierProfileField label="Credit Limit" value={s.credit_limit} />
              <SupplierProfileField label="Preferred Supplier" value={s.preferred_supplier} />
              <SupplierProfileField label="Preferred for Breakdown" value={s.preferred_breakdown} />
              <SupplierProfileField label="Standard Lead Time" value={s.lead_time_standard ? `${s.lead_time_standard} days` : null} />
              <SupplierProfileField label="Express Lead Time" value={s.lead_time_express ? `${s.lead_time_express} days` : null} />
              <SupplierProfileField label="Managed By" value={s.managed_by} />
              <SupplierProfileField label="Last Review" value={s.last_review_date} />
            </ProfileSection>
            {(s.categories_supplied?.length > 0 || s.brands_supplied?.length > 0) && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <TagList label="Categories Supplied" items={s.categories_supplied} />
                <TagList label="Brands Supplied" items={s.brands_supplied} />
              </div>
            )}
          </div>
        );

      case "Contacts":
        return (
          <div className="space-y-4">
            <ProfileSection title="Primary Contact">
              <SupplierProfileField label="Name" value={s.contact_person} />
              <SupplierProfileField label="Position" value={s.contact_position} />
              <SupplierProfileField label="Phone" value={s.contact_phone} />
              <SupplierProfileField label="Mobile" value={s.contact_mobile} />
              <SupplierProfileField label="Email" value={s.contact_email} />
              <SupplierProfileField label="Preferred Method" value={s.contact_method} />
            </ProfileSection>
            <ProfileSection title="Accounts Contact">
              <SupplierProfileField label="Name" value={s.accounts_contact_name} />
              <SupplierProfileField label="Phone" value={s.accounts_phone} />
              <SupplierProfileField label="Email" value={s.accounts_email} />
              <SupplierProfileField label="Statement Email" value={s.statement_email} />
              <SupplierProfileField label="Orders Email" value={s.orders_email} />
              <SupplierProfileField label="Returns Email" value={s.returns_email} />
              <SupplierProfileField label="Invoice Email" value={s.invoice_email} />
            </ProfileSection>
            {s.returns_contact && (
              <ProfileSection title="Returns & Warranty Contacts">
                <SupplierProfileField label="Returns Contact" value={s.returns_contact} />
                <SupplierProfileField label="Warranty Contact" value={s.warranty_contact} />
                <SupplierProfileField label="Breakdown Contact" value={s.breakdown_contact} />
                <SupplierProfileField label="After-Hours Contact" value={s.afterhours_contact} />
              </ProfileSection>
            )}
            {(s.additional_contacts || []).map((c, i) => (
              <ProfileSection key={i} title={`Additional Contact ${i + 1}`}>
                <SupplierProfileField label="Name" value={c.name} />
                <SupplierProfileField label="Position" value={c.position} />
                <SupplierProfileField label="Phone" value={c.phone} />
                <SupplierProfileField label="Mobile" value={c.mobile} />
                <SupplierProfileField label="Email" value={c.email} />
              </ProfileSection>
            ))}
          </div>
        );

      case "Addresses":
        return (
          <div className="space-y-4">
            <ProfileSection title="Head Office / Main Address">
              <SupplierProfileField label="Address" value={[s.address, s.address2].filter(Boolean).join(", ")} className="col-span-2" />
              <SupplierProfileField label="City / Suburb" value={s.city} />
              <SupplierProfileField label="State" value={s.state} />
              <SupplierProfileField label="Postcode" value={s.postcode} />
              <SupplierProfileField label="Country" value={s.country} />
            </ProfileSection>
            {s.warehouse_same_as_head === false ? (
              <ProfileSection title="Warehouse / Dispatch Address">
                <SupplierProfileField label="Address" value={[s.warehouse_address, s.warehouse_address2].filter(Boolean).join(", ")} className="col-span-2" />
                <SupplierProfileField label="City" value={s.warehouse_city} />
                <SupplierProfileField label="State" value={s.warehouse_state} />
                <SupplierProfileField label="Postcode" value={s.warehouse_postcode} />
              </ProfileSection>
            ) : (
              <div className="text-xs text-muted-foreground font-heading uppercase tracking-wider">Warehouse = Head Office</div>
            )}
            {s.returns_same_as_warehouse === false && (
              <ProfileSection title="Returns Address">
                <SupplierProfileField label="Address" value={[s.returns_address, s.returns_address2].filter(Boolean).join(", ")} className="col-span-2" />
                <SupplierProfileField label="City" value={s.returns_city} />
                <SupplierProfileField label="State" value={s.returns_state} />
                <SupplierProfileField label="Postcode" value={s.returns_postcode} />
              </ProfileSection>
            )}
          </div>
        );

      case "Commercial":
        return (
          <div className="space-y-4">
            <ProfileSection title="Payment & Account">
              <SupplierProfileField label="Payment Terms" value={(s.payment_terms || "").replace(/_/g, " ")} />
              <SupplierProfileField label="Credit Limit" value={s.credit_limit} />
              <SupplierProfileField label="Currency" value={s.currency} />
              <SupplierProfileField label="GST Registered" value={s.gst_registered} />
              <SupplierProfileField label="Purchase Method" value={s.purchase_method} />
              <SupplierProfileField label="Accepts Credit Card" value={s.accepts_credit_card} />
              {s.accepts_credit_card && <SupplierProfileField label="Card Surcharge" value={s.card_surcharge ? `${s.card_surcharge}%` : null} />}
            </ProfileSection>
            <ProfileSection title="Pricing">
              <SupplierProfileField label="Pricing Basis" value={s.pricing_basis} />
              <SupplierProfileField label="Competitive Position" value={s.competitive_position} />
              <SupplierProfileField label="Rebate Agreement" value={s.rebate_agreement} />
              <SupplierProfileField label="Volume Agreement" value={s.volume_agreement} />
              <SupplierProfileField label="Discount Notes" value={s.discount_notes} className="col-span-2" />
              <SupplierProfileField label="Contract Terms" value={s.special_contract_terms} className="col-span-2" />
              <SupplierProfileField label="Margin Notes" value={s.margin_notes} className="col-span-2" />
            </ProfileSection>
            <ProfileSection title="Freight">
              <SupplierProfileField label="Freight Account" value={s.freight_account_option} />
              <SupplierProfileField label="Free Freight Threshold" value={s.free_freight_threshold ? `$${s.free_freight_threshold}` : null} />
              <SupplierProfileField label="Min Order Value" value={s.min_order_value ? `$${s.min_order_value}` : null} />
              <SupplierProfileField label="Ships to Karratha" value={s.ships_karratha} />
              <SupplierProfileField label="Ships to Pilbara / Regional WA" value={s.ships_pilbara} />
              <SupplierProfileField label="Cutoff Time" value={s.cutoff_time} />
              <SupplierProfileField label="Dispatch Origin" value={s.dispatch_origin} />
              <TagList label="Freight Methods" items={s.freight_methods} />
            </ProfileSection>
          </div>
        );

      case "Procurement":
        return (
          <div className="space-y-4">
            <ProfileSection title="Supply Capabilities">
              <SupplierProfileField label="OEM / Aftermarket" value={s.oem_aftermarket} />
              <SupplierProfileField label="Warranty Support" value={s.warranty_support} />
              <SupplierProfileField label="Returns Accepted" value={s.returns_accepted} />
              <SupplierProfileField label="Core Exchange" value={s.core_exchange} />
              <SupplierProfileField label="Emergency Supply" value={s.emergency_supply} />
              <SupplierProfileField label="Price File Available" value={s.price_file_available} />
              <SupplierProfileField label="Live Stock Feed" value={s.live_stock_feed} />
              <SupplierProfileField label="API / Portal Available" value={s.api_portal_available} />
              {s.portal_url && <SupplierProfileField label="Portal URL" value={s.portal_url} className="col-span-2" />}
            </ProfileSection>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <TagList label="Categories Supplied" items={s.categories_supplied} />
              <TagList label="Equipment Types Supported" items={s.equipment_types} />
              <TagList label="Brands Supplied" items={s.brands_supplied} />
            </div>
            <ProfileSection title="Ordering">
              <SupplierProfileField label="Sales Territory" value={s.sales_territory} />
              <SupplierProfileField label="Business Hours" value={s.business_hours} />
              <SupplierProfileField label="MOQ Notes" value={s.moq_notes} className="col-span-2" />
            </ProfileSection>
          </div>
        );

      case "Returns":
        return (
          <ProfileSection title="Returns, Warranty & Claims">
            <SupplierProfileField label="Return Window" value={s.return_window} />
            <SupplierProfileField label="Restocking Fee" value={s.restocking_fee ? `${s.restocking_fee}%` : null} />
            <SupplierProfileField label="RMA Required" value={s.rma_required} />
            <SupplierProfileField label="Returns Contact" value={s.returns_contact} />
            <SupplierProfileField label="Warranty Contact" value={s.warranty_contact} />
            <SupplierProfileField label="Warranty Claim Process" value={s.warranty_claim_notes} className="col-span-2" />
            <SupplierProfileField label="Core Return Process" value={s.core_return_notes} className="col-span-2" />
            <SupplierProfileField label="Faulty Goods Escalation" value={s.faulty_goods_notes} className="col-span-2" />
          </ProfileSection>
        );

      case "Documents":
        const attachments = s.attachments || [];
        return (
          <div>
            {attachments.length > 0 ? (
              <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{att.filename}</p>
                        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">{att.doc_type} · {att.upload_date}</p>
                      </div>
                    </div>
                    <a href={att.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-sm p-8 text-center text-muted-foreground/40 text-xs font-heading uppercase tracking-wider">
                No documents attached
              </div>
            )}
          </div>
        );

      case "Activity":
        return (
          <div className="space-y-4">
            <ProfileSection title="Performance & Review">
              <SupplierProfileField label="Supplier Rating" value={s.rating ? `${s.rating}/5 stars` : null} />
              <SupplierProfileField label="Preferred Ranking" value={s.preferred_ranking} />
              <SupplierProfileField label="Last Review Date" value={s.last_review_date} />
              <SupplierProfileField label="Review Frequency" value={s.review_frequency} />
              <SupplierProfileField label="Approved By" value={s.approved_by} />
              <SupplierProfileField label="Managed By" value={s.managed_by} />
              <SupplierProfileField label="Procurement Notes" value={s.internal_notes} className="col-span-2" />
              <SupplierProfileField label="Reliability Notes" value={s.reliability_notes} className="col-span-2" />
              <SupplierProfileField label="Risk Notes" value={s.risk_notes} className="col-span-2" />
            </ProfileSection>
            <div className="border border-dashed border-border rounded-sm p-6 text-center text-muted-foreground/40 text-xs font-heading uppercase tracking-wider">
              Purchase history and open POs will appear here once linked
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-6 pb-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl flex flex-col" style={{ minHeight: "min(90vh, 800px)" }}>
        <SupplierProfileHeader supplier={s} onEdit={onEdit} onClose={onClose} onStatusChanged={onStatusChanged} />

        {/* Tab nav */}
        <div className="bg-[hsl(0,0%,96%)] border-b border-border flex gap-0 overflow-x-auto flex-shrink-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-[10px] font-heading uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                tab === t
                  ? "border-primary text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}