import CustomerOnboardingForm from "@/components/customers/CustomerOnboardingForm";

export default function QuickCustomerForm({ onClose, onSaved }) {
  return (
    <CustomerOnboardingForm
      onClose={onClose}
      onSaved={(saved, opts) => {
        onSaved?.();
      }}
    />
  );
}