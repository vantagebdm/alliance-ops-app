import { AlertTriangle, AlertCircle, CheckCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CONFIDENCE_COLORS = {
  high: "bg-red-500/10 border-red-500/30 text-red-700",
  medium: "bg-amber-500/10 border-amber-500/30 text-amber-700",
  low: "bg-blue-500/10 border-blue-500/30 text-blue-700"
};

const SOURCE_LABELS = {
  asic_regulatory: "ASIC / Regulatory",
  legal_record: "Legal Record",
  news_article: "News Article",
  public_listing: "Public Listing",
  other: "Other"
};

const RISK_LEVELS = {
  none: { icon: CheckCircle, color: "bg-green-500/10 border-green-500/20", banner: "No adverse records found", text: "text-green-700" },
  low: { icon: AlertCircle, color: "bg-blue-500/10 border-blue-500/20", banner: "Minor concerns identified", text: "text-blue-700" },
  medium: { icon: AlertTriangle, color: "bg-amber-500/10 border-amber-500/20", banner: "Moderate external risk detected", text: "text-amber-700" },
  high: { icon: AlertTriangle, color: "bg-red-500/10 border-red-500/20", banner: "High external risk detected", text: "text-red-700" }
};

export default function ExternalRiskPanel({ external_risk_level = "none", external_findings_summary, external_findings = [], external_assessment_date, onRunAssessment, isAssessing }) {
  const [expanded, setExpanded] = useState(false);
  const config = RISK_LEVELS[external_risk_level] || RISK_LEVELS.none;
  const Icon = config.icon;

  return (
    <div className="space-y-3">
      {/* Summary Banner */}
      <div className={`border rounded-sm p-4 ${config.color}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`font-heading text-sm uppercase tracking-wider font-semibold ${config.text}`}>
                External Risk Intelligence
              </p>
              <p className={`text-sm mt-1 ${config.text}/70`}>{config.banner}</p>
            </div>
          </div>
          {external_findings.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 px-2"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Findings List */}
      {expanded && external_findings.length > 0 && (
        <div className="border border-border rounded-sm p-3 space-y-2 bg-muted/30">
          {external_findings.map((finding, idx) => (
            <div key={idx} className="text-sm space-y-1 pb-2 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground">{finding.finding}</p>
                <div className="flex gap-1 flex-shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-heading uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {SOURCE_LABELS[finding.source_type] || finding.source_type}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-heading uppercase tracking-wider border ${CONFIDENCE_COLORS[finding.confidence]}`}>
                    {finding.confidence}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{finding.description}</p>
              {finding.date && <p className="text-xs text-muted-foreground">Date: {finding.date}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer and Action */}
      <div className="flex items-center justify-between gap-2 p-2 bg-muted/40 rounded-sm">
        <p className="text-xs text-muted-foreground">
          <span className="font-heading">⚠ Disclaimer:</span> External data sourced from public information. Use for internal guidance only.
        </p>
        {onRunAssessment && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRunAssessment}
            disabled={isAssessing}
            className="text-xs"
          >
            {isAssessing ? "Assessing..." : "Re-assess"}
          </Button>
        )}
      </div>

      {external_assessment_date && (
        <p className="text-xs text-muted-foreground text-right">
          Assessed: {new Date(external_assessment_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}