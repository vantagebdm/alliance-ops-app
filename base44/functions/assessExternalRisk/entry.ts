import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customer_id } = await req.json();

    if (!customer_id) {
      return Response.json({ error: 'customer_id required' }, { status: 400 });
    }

    const customer = await base44.entities.Customer.get(customer_id);
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Format directors info
    const directorsInfo = customer.directors?.map(d => {
      let info = d.full_name;
      if (d.dob) info += ` (DOB: ${d.dob})`;
      return info;
    }).join('; ') || 'N/A';

    // Use LLM to search for external risk indicators with deeper analysis
    const findings = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform a comprehensive credit risk assessment for a company with these details:
       
Company Name: ${customer.name}
Trading Name: ${customer.trading_name || 'N/A'}
ABN: ${customer.abn || 'N/A'}
ACN: ${customer.acn || 'N/A'}
Location: ${customer.city}, ${customer.state}
Date Established: ${customer.date_established || 'N/A'}
Nature of Business: ${customer.nature_of_business || 'N/A'}
Directors: ${directorsInfo}
Estimated Monthly Purchases: ${customer.estimated_monthly_purchases || 'N/A'}

SEARCH FOR AND ANALYZE:

1. INSOLVENCY & DEREGISTRATION (Critical)
   - Liquidation, administration, receivership, court-ordered wind-ups
   - ASIC deregistration or strike-off
   - Voluntary agreements or creditor schemes

2. DIRECTOR HISTORY (Important)
   - Directors with history of failed companies
   - Directors disqualified or banned
   - Frequent director changes (instability indicator)
   - Directors involved in previous insolvencies

3. LEGAL & REGULATORY (Important)
   - Court judgments, writs, or liens
   - Tax office pursuit or unpaid ATO debts
   - Fair Work breaches or underpayment claims
   - ASIC enforcement actions
   - Consumer complaints or business disputes

4. FINANCIAL DISTRESS SIGNALS
   - Payment defaults or court-ordered recovery actions
   - Asset seizure or repossession
   - Breached payment agreements with creditors
   - Multiple creditor claims

5. REPUTATIONAL & MARKET SIGNALS
   - Negative media coverage (fraud, disputes, quality issues)
   - Public complaints or blacklist mentions
   - Poor online reviews or industry warnings
   - Warnings from industry bodies

6. STRUCTURAL CHANGES (Caution flag)
   - Recent sudden changes in ownership or structure
   - Frequent trading name changes
   - Recent address changes suggesting relocation
   - Unusual company restructures

7. BUSINESS VIABILITY
   - Newly established companies (under 12 months)
   - Industry sector challenges or downturns
   - Geographic market issues

For EACH finding identified, provide:
- Specific issue description
- Source type: asic_regulatory, legal_record, news_article, public_listing, director_history, financial_distress, or other
- Confidence: High (verified official record), Medium (credible source), Low (unverified)
- Date if available
- Brief context

ONLY return findings if they are RELEVANT and VERIFIABLE. If no adverse records found, return: "NO_ADVERSE_RECORDS"

Rate overall risk considering:
- None: No adverse indicators found
- Low: Minor concerns, unlikely to affect creditworthiness
- Medium: Moderate concerns requiring attention, manageable risk
- High: Significant concerns, substantial credit risk
Provide a concise executive summary (2-3 sentences) of the company's credit risk profile.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          has_findings: {
            type: "boolean"
          },
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                finding: { type: "string" },
                category: { type: "string", enum: ["insolvency", "director_history", "legal_regulatory", "financial_distress", "reputational", "structural", "viability"] },
                source_type: { type: "string", enum: ["asic_regulatory", "legal_record", "news_article", "public_listing", "director_history", "financial_distress", "other"] },
                confidence: { type: "string", enum: ["high", "medium", "low"] },
                date: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          overall_risk_level: {
            type: "string",
            enum: ["none", "low", "medium", "high"]
          },
          summary: {
            type: "string"
          }
        }
      }
    });

    // Determine risk level and update customer
    let riskLevel = "none";
    let riskFlag = false;

    if (findings.has_findings && findings.findings.length > 0) {
      const highConfidenceCount = findings.findings.filter(f => f.confidence === "high").length;
      const mediumConfidenceCount = findings.findings.filter(f => f.confidence === "medium").length;
      const criticalFinding = findings.findings.some(f => f.category === "insolvency" && f.confidence === "high");

      if (criticalFinding || highConfidenceCount >= 2 || findings.findings.some(f => f.source_type === "asic_regulatory" && f.confidence === "high")) {
        riskLevel = "high";
        riskFlag = true;
      } else if (highConfidenceCount >= 1 || mediumConfidenceCount >= 2) {
        riskLevel = "medium";
        riskFlag = true;
      } else if (mediumConfidenceCount >= 1 || findings.findings.some(f => f.category === "director_history")) {
        riskLevel = "low";
        riskFlag = true;
      }
    }

    // Update customer with external risk findings
    const updatedCustomer = await base44.entities.Customer.update(customer_id, {
      external_risk_flag: riskFlag,
      external_risk_level: riskLevel,
      external_findings_summary: findings.summary || "No adverse records found",
      external_confidence_level: findings.findings?.length > 0 ? "medium" : "high",
      external_assessment_date: new Date().toISOString(),
      external_findings: findings.findings || []
    });

    return Response.json({
      success: true,
      customer_id,
      external_risk_level: riskLevel,
      external_risk_flag: riskFlag,
      findings: findings.findings || [],
      summary: findings.summary
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});