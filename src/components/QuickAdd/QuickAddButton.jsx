import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickAddMenu from "./QuickAddMenu";
import QuickQuoteForm from "./forms/QuickQuoteForm";
import QuickOrderForm from "./forms/QuickOrderForm";
import QuickEnquiryForm from "./forms/QuickEnquiryForm";
import QuickCustomerForm from "./forms/QuickCustomerForm";
import PartForm from "@/components/parts/PartForm";
import QuickPOForm from "./forms/QuickPOForm";
import QuickSupplierForm from "./forms/QuickSupplierForm";
import QuickInvoiceForm from "./forms/QuickInvoiceForm";

export default function QuickAddButton({ contextData = {} }) {
  const [open, setOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const formComponents = {
    quote: QuickQuoteForm,
    order: QuickOrderForm,
    enquiry: QuickEnquiryForm,
    customer: QuickCustomerForm,
    part: PartForm,
    po: QuickPOForm,
    supplier: QuickSupplierForm,
    invoice: QuickInvoiceForm,
  };

  const ActiveForm = formComponents[activeForm];

  if (activeForm && ActiveForm) {
    return (
      <ActiveForm
        onClose={() => setActiveForm(null)}
        onSaved={() => setActiveForm(null)}
        contextData={contextData}
      />
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        onClick={() => setOpen(!open)}
        className="bg-primary text-black hover:bg-primary/90 font-heading text-xs uppercase tracking-wider gap-2 rounded-sm"
      >
        <Plus className="w-4 h-4" />
        Quick Add
      </Button>
      {open && (
        <div className="absolute top-full right-0 mt-2 z-50">
          <QuickAddMenu
            onSelect={(action) => setActiveForm(action)}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}