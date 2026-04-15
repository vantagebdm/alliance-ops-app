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

    // Build search query with primary identifiers
    const searchTerms = [
      customer.name,
      customer.trading_name,
      customer.abn,
      customer.acn,
      ...(customer.directors?.map(d => d.full_name) || []),
      customer.city && customer.state ? `${customer.city} ${customer.state}` : null
    ].filter(Boolean).join(' ');

    // Use LLM to search for external risk indicators
    const findings = await base44.integrations.Core.InvokeLLM({
      prompt: `Search for external risk indicators for a company with these details:
      
Company Name: ${customer.name}
Trading Name: ${customer.trading_name || 'N/A'}
ABN: ${customer.abn || 'N/A'}
ACN: ${customer.acn || 'N/A'}
Location: ${customer.city}, ${customer.state}
Directors: ${customer.directors?.map(d => d.full_name).join(', ') || 'N/A'}

Search for and identify:
1. Insolvency records (liquidation, administration, receivership, ASIC deregistration)
2. Legal actions or court judgments
3. Negative news articles or media mentions
4. Regulatory compliance issues
5. Public complaints or disputes
6. Payment defaults or financial distress indicators

For each finding, provide:
- Brief description of the issue
- Source type (ASIC/Regulatory, Legal Record, News Article, Public Listing, Other)
- Confidence level (High/Medium/Low) - based on how closely the match identifies this specific company
- Date if available

Return ONLY if you find relevant information. If no adverse records found, return: "NO_ADVERSE_RECORDS"
Format findings as bullet points.`,
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
                source_type: { type: "string" },
                confidence: { type: "string" },
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

      if (highConfidenceCount >= 2 || findings.findings.some(f => f.source_type === "asic_regulatory" && f.confidence === "high")) {
        riskLevel = "high";
        riskFlag = true;
      } else if (highConfidenceCount >= 1 || mediumConfidenceCount >= 2) {
        riskLevel = "medium";
        riskFlag = true;
      } else if (mediumConfidenceCount >= 1) {
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