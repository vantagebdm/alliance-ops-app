import { useState } from "react";
import QuickOrderForm from "@/components/QuickAdd/forms/QuickOrderForm";
import QuickQuoteForm from "@/components/QuickAdd/forms/QuickQuoteForm";
import QuickInvoiceForm from "@/components/QuickAdd/forms/QuickInvoiceForm";
import CustomerDocumentUpload from "./CustomerDocumentUpload";
import CreditApplicationHandler from "./CreditApplicationHandler";

export default function CustomerActionHandler({ customer, action, onClose, onUpdated }) {
  switch (action) {
    case "new-order":
      return (
        <QuickOrderForm
          prefillCustomer={customer}
          onClose={onClose}
          onSaved={onUpdated}
        />
      );
    case "new-quote":
      return (
        <QuickQuoteForm
          prefillCustomer={customer}
          onClose={onClose}
          onSaved={onUpdated}
        />
      );
    case "new-invoice":
      return (
        <QuickInvoiceForm
          prefillCustomer={customer}
          onClose={onClose}
          onSaved={onUpdated}
        />
      );
    case "upload-doc":
      return (
        <CustomerDocumentUpload
          customer={customer}
          onClose={onClose}
          onUploaded={onUpdated}
        />
      );
    case "credit-app":
      return (
        <CreditApplicationHandler
          customer={customer}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      );
    default:
      return null;
  }
}