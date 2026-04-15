import { SectionTitle } from "./ProfileField";
import ProfileField from "./ProfileField";
import { FileSearch, AlertTriangle } from "lucide-react";
import moment from "moment";
import ExternalRiskPanel from "../actions/ExternalRiskPanel";
import { base44 } from "@/api/base44Client";
import { useState } from "react";

const ACCOUNT_STATUS_LABELS = {
  cash_sale: "Cash Sale", credit_pending: "Credit Pending", under_review: "Under Review",
  active_credit: "Active Credit", on_hold: "On Hold", declined: "Declined",
};
const ACCOUNT_STATUS_COLORS = {
  cash_sale: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  credit_pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  under_review: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  active_credit: "text-green-400 bg-green-500/10 border-green-500/20",
  on_hold: "text-red-400 bg-red-500/10 border-red-500/20",
  declined: "text-red-600 bg-red-900/20 border-red-700/30",
};

export default function TabCredit({ customer }) {
  const acctColor = ACCOUNT_STATUS_COLORS[customer.account_status] || ACCOUNT_STATUS_COLORS.cash_sale;
  const isOnHold = customer.account_status === "on_hold";
  const [isAssessing, setIsAssessing] = useState(false);

  const handleRunAssessment = async () => {
    setIsAssessing(true);
    try {
      await base44.functions.invoke("assessExternalRisk", { customer_id: customer.id });
    } catch (err) {
      console.error("Assessment failed:", err);
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {isOnHold && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400 font-heading uppercase tracking-wider">Account is on hold</p>
        </div>
      )}

      <div>
        <SectionTitle>Credit Status</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Account Status</p>
            <span className={`inline-block text-xs font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm border ${acctColor}`}>
              {ACCOUNT_STATUS_LABELS[customer.account_status] || customer.account_status}
            </span>
          </div>
          <ProfileField label="Payment Terms" value={customer.payment_terms?.replace(/_/g, " ")} />
          <ProfileField label="Pricing Tier" value={customer.pricing_tier} />
          <ProfileField label="Credit Limit Required" value={customer.credit_limit_required} />
          <ProfileField label="Account Terms" value={customer.account_terms?.replace(/_/g, " ")} />
          <ProfileField label="PO Required" value={customer.po_required} />
        </div>
      </div>

      {customer.pdf_attachment_url && (
        <div>
          <SectionTitle>Credit Application</SectionTitle>
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="bg-muted/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSearch className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Credit Application PDF</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {moment(customer.created_date).format("DD/MM/YYYY")} &nbsp;•&nbsp;
                    {customer.created_by_method === "pdf_extraction" ? "Extracted & reviewed" : "Manually attached"}
                  </p>
                </div>
              </div>
              <a
                href={customer.pdf_attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-heading uppercase tracking-wider text-primary hover:underline border border-primary/30 px-3 py-1.5 rounded-sm hover:bg-primary/10 transition-colors"
              >
                View / Download
              </a>
            </div>
          </div>
        </div>
      )}

      {(customer.external_risk_level || customer.external_findings?.length > 0) && (
        <div>
          <SectionTitle>External Risk Intelligence</SectionTitle>
          <ExternalRiskPanel
            external_risk_level={customer.external_risk_level}
            external_findings_summary={customer.external_findings_summary}
            external_findings={customer.external_findings}
            external_assessment_date={customer.external_assessment_date}
            onRunAssessment={handleRunAssessment}
            isAssessing={isAssessing}
          />
        </div>
      )}

      {(customer.credit_risk_notes || customer.special_pricing_notes) && (
        <div>
          <SectionTitle>Risk & Pricing Notes</SectionTitle>
          <div className="space-y-3">
            {customer.credit_risk_notes && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-sm p-4">
                <p className="font-heading text-[10px] uppercase tracking-widest text-red-400 mb-1">Credit Risk Notes</p>
                <p className="text-sm whitespace-pre-wrap">{customer.credit_risk_notes}</p>
              </div>
            )}
            {customer.special_pricing_notes && (
              <div className="bg-muted/20 rounded-sm p-4">
                <p className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Special Pricing Notes</p>
                <p className="text-sm whitespace-pre-wrap">{customer.special_pricing_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}