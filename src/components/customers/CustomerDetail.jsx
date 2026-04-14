import { useState } from "react";
import CustomerOnboardingForm from "./CustomerOnboardingForm";
import ProfileHeader from "./profile/ProfileHeader";
import TabOverview from "./profile/TabOverview";
import TabContacts from "./profile/TabContacts";
import TabAddresses from "./profile/TabAddresses";
import TabCredit from "./profile/TabCredit";
import TabDirectors from "./profile/TabDirectors";
import TabTradeRefs from "./profile/TabTradeRefs";
import TabDocuments from "./profile/TabDocuments";
import TabActivity from "./profile/TabActivity";
import TabHistory from "./profile/TabHistory";

const TABS = [
  { key: "overview",   label: "Overview" },
  { key: "contacts",   label: "Contacts" },
  { key: "addresses",  label: "Addresses" },
  { key: "credit",     label: "Credit & Terms" },
  { key: "directors",  label: "Directors" },
  { key: "refs",       label: "Trade References" },
  { key: "documents",  label: "Documents" },
  { key: "activity",   label: "Activity" },
  { key: "history",    label: "Orders & Invoices" },
];

export default function CustomerDetail({ customer: initialCustomer, onClose, onUpdated }) {
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [customer, setCustomer] = useState(initialCustomer);

  if (editing) {
    return (
      <CustomerOnboardingForm
        initial={customer}
        onClose={() => setEditing(false)}
        onSaved={(saved) => {
          setCustomer(saved);
          setEditing(false);
          onUpdated?.();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-4 pb-6 overflow-y-auto">
      <div className="bg-card w-full max-w-5xl rounded-sm shadow-2xl mx-4 mb-4">

        {/* Header */}
        <ProfileHeader
          customer={customer}
          onEdit={() => setEditing(true)}
          onClose={onClose}
        />

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border bg-muted/10 scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-3 font-heading text-[11px] uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[400px]">
          {tab === "overview"  && <TabOverview   customer={customer} />}
          {tab === "contacts"  && <TabContacts   customer={customer} />}
          {tab === "addresses" && <TabAddresses  customer={customer} />}
          {tab === "credit"    && <TabCredit     customer={customer} />}
          {tab === "directors" && <TabDirectors  customer={customer} />}
          {tab === "refs"      && <TabTradeRefs  customer={customer} />}
          {tab === "documents" && <TabDocuments  customer={customer} />}
          {tab === "activity"  && <TabActivity   customer={customer} />}
          {tab === "history"   && <TabHistory    customer={customer} />}
        </div>
      </div>
    </div>
  );
}