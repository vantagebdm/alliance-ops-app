import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput, FToggle, FTextarea } from "./SupplierField";

export default function S8Operations({ form, update }) {
  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Operating Details" subtitle="Business hours, ordering systems and portal access." />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Sales Territory / Region" value={form.sales_territory} onChange={e => update("sales_territory", e.target.value)} />
        <FInput label="Business Hours" value={form.business_hours} onChange={e => update("business_hours", e.target.value)} />
        <FInput label="After-Hours Contact" value={form.afterhours_contact} onChange={e => update("afterhours_contact", e.target.value)} />
        <FInput label="Breakdown Contact Number" value={form.breakdown_contact} onChange={e => update("breakdown_contact", e.target.value)} />
        <FInput label="Minimum Order Value ($)" value={form.min_order_value} onChange={e => update("min_order_value", e.target.value)} />
      </div>
      <FTextarea label="MOQ by Item / Category Notes" value={form.moq_notes} onChange={e => update("moq_notes", e.target.value)} />

      <div className="flex flex-wrap gap-6 py-1">
        <FToggle label="Price File Available" checked={!!form.price_file_available} onChange={v => update("price_file_available", v)} />
        <FToggle label="Live Stock Feed Available" checked={!!form.live_stock_feed} onChange={v => update("live_stock_feed", v)} />
        <FToggle label="API / Portal Available" checked={!!form.api_portal_available} onChange={v => update("api_portal_available", v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FInput label="Supplier Login URL (paste link here)" className="col-span-2" value={form.portal_url} onChange={e => update("portal_url", e.target.value)} placeholder="https://supplier-portal.com/login" />
        {form.api_portal_available && (
          <>
            <FInput label="Portal Username" value={form.portal_username} onChange={e => update("portal_username", e.target.value)} />
            <FTextarea label="Internal Portal Notes" className="col-span-2" value={form.portal_notes} onChange={e => update("portal_notes", e.target.value)} />
          </>
        )}
      </div>
    </div>
  );
}