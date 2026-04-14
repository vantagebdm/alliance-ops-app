import SupplierSectionHeader from "./SuplierSectionHeader";
import { FInput } from "./SupplierField";

export default function S3AccountsContact({ form, update }) {
  return (
    <div className="space-y-4">
      <SupplierSectionHeader title="Accounts / Commercial Contact" subtitle="Dedicated contacts for invoicing, orders, and returns." />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Accounts Contact Name" className="col-span-2" value={form.accounts_contact_name} onChange={e => update("accounts_contact_name", e.target.value)} />
        <FInput label="Accounts Phone" value={form.accounts_phone} onChange={e => update("accounts_phone", e.target.value)} />
        <FInput label="Accounts Email" value={form.accounts_email} onChange={e => update("accounts_email", e.target.value)} />
        <FInput label="Statement Email" value={form.statement_email} onChange={e => update("statement_email", e.target.value)} />
        <FInput label="Orders Email" value={form.orders_email} onChange={e => update("orders_email", e.target.value)} />
        <FInput label="Returns / Warranty Email" value={form.returns_email} onChange={e => update("returns_email", e.target.value)} />
        <FInput label="Invoice Receipt Email" value={form.invoice_email} onChange={e => update("invoice_email", e.target.value)} />
      </div>
    </div>
  );
}