// Page 1 — Credit Account Application Form

const APP_GREEN = "#22c55e";
const GREY_DARK = "#1a1a1a";
const GREY_MID = "#4a4a4a";
const BORDER = "#cccccc";

const Row = ({ children, style }) => (
  <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, ...style }}>{children}</div>
);

const Cell = ({ children, style, width, label, boldLabel }) => (
  <div style={{ padding: "4px 7px", width: width || "auto", flex: width ? undefined : 1, borderRight: `1px solid ${BORDER}`, ...style }}>
    {label && <span style={{ fontSize: 8.5, color: GREY_MID, fontFamily: "Arial, sans-serif" }}>{boldLabel ? <strong>{label}</strong> : label}</span>}
    {label && <br />}
    <span style={{ fontSize: 9.5, fontFamily: "Arial, sans-serif", color: GREY_DARK }}>{children}</span>
  </div>
);

const Tick = ({ checked }) => (
  <span style={{ display: "inline-block", width: 10, height: 10, border: `1.5px solid ${GREY_MID}`, marginRight: 3, verticalAlign: "middle", background: "white" }} />
);

const SectionTitle = ({ children }) => (
  <div style={{ padding: "4px 7px", background: "#f5f5f5", borderBottom: `1px solid ${BORDER}`, fontSize: 9.5, fontFamily: "Arial, sans-serif", color: GREY_DARK }}>
    <strong>{children}</strong>
  </div>
);

const LineField = ({ label, w }) => (
  <div style={{ display: "inline-block", marginRight: 12, minWidth: w || 120 }}>
    <span style={{ fontSize: 9, color: GREY_MID, fontFamily: "Arial, sans-serif" }}>{label}: </span>
    <span style={{ display: "inline-block", borderBottom: `1px solid ${GREY_MID}`, width: w || 120, verticalAlign: "bottom" }}>&nbsp;</span>
  </div>
);

export default function CreditAppPage1({ template: t }) {
  const coName = t?.company_name || "Alliance Priority Parts Pty. Ltd.";
  const coAbn = t?.company_abn || "33 697 061 279";
  const coAcn = t?.company_acn || "697 061 279";
  const coAddr = t?.company_address || "3873 Pemberton Way, Karratha Industrial Estate WA 6714";
  const coPhone = t?.company_phone || "";
  const coEmail = t?.company_email || "accounts@alliancepriorityparts.com.au";
  const coWeb = t?.company_web || "www.alliancepriorityparts.com.au";
  const logoUrl = t?.logo_url || "https://media.base44.com/images/public/69dccee2e4380f803487afa5/d6f3ce989_image.png";
  const declaration = t?.declaration_text || "";

  return (
    <div className="pdf-page" style={{ width: 794, background: "white", padding: "28px 36px 28px 36px", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <img src={logoUrl} alt="APP Logo" style={{ height: 64, objectFit: "contain" }} crossOrigin="anonymous" />
        </div>
        <div style={{ textAlign: "right", fontSize: 9.5, lineHeight: 1.6, color: GREY_DARK }}>
          <strong style={{ fontSize: 11 }}>{coName}</strong><br />
          ABN: {coAbn}<br />
          ACN: {coAcn}<br />
          {coAddr}<br />
          {coPhone && <>Phone: {coPhone}<br /></>}
          Email: {coEmail}<br />
          Web: {coWeb}
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h1 style={{ fontSize: 20, fontWeight: "bold", fontFamily: "Arial, sans-serif", letterSpacing: 2, color: GREY_DARK, margin: 0, textTransform: "uppercase" }}>CREDIT ACCOUNT APPLICATION</h1>
        <p style={{ fontSize: 8.5, color: GREY_MID, margin: "4px 0 0 0" }}>To Be Completed By Applicants — Please complete all sections and read the Terms and Conditions of Trade overleaf or attached.</p>
      </div>

      {/* Main table */}
      <div style={{ border: `1.5px solid ${BORDER}`, fontSize: 9.5 }}>

        {/* Customer Type */}
        <Row>
          <Cell style={{ padding: "5px 7px" }}>
            <strong>Customer's Details:</strong>&nbsp;&nbsp;
            {["Individual", "Sole Trader", "Trust", "Partnership", "Company", "Other:"].map(t => (
              <span key={t} style={{ marginRight: 10, whiteSpace: "nowrap" }}><Tick />{t}</span>
            ))}
          </Cell>
        </Row>

        <Row><Cell label="Full or Legal Name:" style={{ minHeight: 22 }}> </Cell></Row>
        <Row><Cell label="Trading Name (if different from above):" style={{ minHeight: 22 }}> </Cell></Row>

        <Row>
          <Cell label="Physical Address:" style={{ flex: 3 }}> </Cell>
          <Cell label="State:" style={{ width: 90 }}> </Cell>
          <Cell label="Postcode:" style={{ width: 80, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Billing Address:" style={{ flex: 3 }}> </Cell>
          <Cell label="State:" style={{ width: 90 }}> </Cell>
          <Cell label="Postcode:" style={{ width: 80, borderRight: "none" }}> </Cell>
        </Row>

        <Row><Cell label="Email Address:" style={{ minHeight: 22 }}> </Cell></Row>

        <Row>
          <Cell label="Phone No:" style={{ flex: 1 }}> </Cell>
          <Cell label="Fax No:" style={{ flex: 1 }}> </Cell>
          <Cell label="Mobile No:" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>

        <SectionTitle>Personal Details: (please complete if you are an Individual)</SectionTitle>
        <Row>
          <Cell label="D.O.B." style={{ flex: 1 }}> </Cell>
          <Cell label="Driver's Licence No:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>

        <SectionTitle>Business Details: (please complete if you are a Sole Trader, Trust, Partnership, Company or Other — as specified)</SectionTitle>
        <Row>
          <Cell label="ABN:" style={{ flex: 1 }}> </Cell>
          <Cell label="ACN:" style={{ flex: 1 }}> </Cell>
          <Cell label="Date Established (current owners):" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row><Cell label="Nature of Business:" style={{ minHeight: 22 }}> </Cell></Row>
        <Row>
          <Cell label="Paid Up Capital: $" style={{ flex: 1 }}> </Cell>
          <Cell label="Estimated Monthly Purchases: $" style={{ flex: 1 }}> </Cell>
          <Cell label="Credit Limit Required: $" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell style={{ minHeight: 22 }}>
            <strong>Principal Place of Business is:</strong>&nbsp;&nbsp;
            {["Rented", "Owned", "Mortgaged (to whom):", "Other:"].map(t => (
              <span key={t} style={{ marginRight: 14 }}><Tick />{t}</span>
            ))}
          </Cell>
        </Row>

        <SectionTitle>Directors / Owners / Trustee (if more than two, please attach a separate sheet)</SectionTitle>
        {[1, 2].map(n => (
          <div key={n}>
            <Row>
              <Cell label={`(${n}) Full Name:`} style={{ flex: 3 }}> </Cell>
              <Cell label="D.O.B." style={{ flex: 1, borderRight: "none" }}> </Cell>
            </Row>
            <Row>
              <Cell label="Private Address:" style={{ flex: 3 }}> </Cell>
              <Cell label="State:" style={{ width: 90 }}> </Cell>
              <Cell label="Postcode:" style={{ width: 80, borderRight: "none" }}> </Cell>
            </Row>
            <Row>
              <Cell label="Driver's Licence No:" style={{ flex: 1 }}> </Cell>
              <Cell label="Phone No:" style={{ flex: 1 }}> </Cell>
              <Cell label="Mobile No:" style={{ flex: 1, borderRight: "none" }}> </Cell>
            </Row>
          </div>
        ))}

        <Row>
          <Cell style={{ minHeight: 20 }}>
            <strong>Account Terms:</strong>&nbsp;&nbsp;
            {["30 Days", "COD", "Other:"].map(t => (
              <span key={t} style={{ marginRight: 14 }}><Tick />{t}</span>
            ))}
          </Cell>
        </Row>

        <Row>
          <Cell style={{ flex: 1, minHeight: 20 }}>
            <strong>Purchase Order Required?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO
          </Cell>
          <Cell style={{ flex: 1, borderRight: "none", minHeight: 20 }}>
            <strong>Accounts to be emailed?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO
          </Cell>
        </Row>

        <Row><Cell label="Accounts Email Address:" style={{ minHeight: 22 }}> </Cell></Row>
        <Row>
          <Cell label="Accounts Contact:" style={{ flex: 2 }}> </Cell>
          <Cell label="Phone No:" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Bank and Branch:" style={{ flex: 2 }}> </Cell>
          <Cell label="Account No:" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>

        <SectionTitle>Trade References: (please provide companies that are willing to do trade references)</SectionTitle>
        <Row>
          <Cell style={{ width: 24, textAlign: "center" }}>&nbsp;</Cell>
          <Cell style={{ flex: 2 }}><strong>Name:</strong></Cell>
          <Cell style={{ flex: 3 }}><strong>Address:</strong></Cell>
          <Cell style={{ flex: 2, borderRight: "none" }}><strong>Phone / Fax / Email:</strong></Cell>
        </Row>
        {[1, 2, 3].map(n => (
          <Row key={n}>
            <Cell style={{ width: 24, textAlign: "center" }}>{n}.</Cell>
            <Cell style={{ flex: 2, minHeight: 20 }}> </Cell>
            <Cell style={{ flex: 3, minHeight: 20 }}> </Cell>
            <Cell style={{ flex: 2, minHeight: 20, borderRight: "none" }}> </Cell>
          </Row>
        ))}
      </div>

      {/* Declaration */}
      <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", padding: "8px 7px", fontSize: 8.5, lineHeight: 1.6, color: GREY_DARK }}>
        {declaration}
      </div>

      {/* Signatures */}
      <div style={{ display: "flex", gap: 24, marginTop: 10, fontSize: 8.5, color: GREY_DARK }}>
        {[{ label: "CUSTOMER", role: "customer" }, { label: coName.toUpperCase().split(" ")[0] + " REPRESENTATIVE", role: "app" }].map((s) => (
          <div key={s.role} style={{ flex: 1 }}>
            <div style={{ marginBottom: 6 }}><strong>SIGNED ({s.label}):</strong> <span style={{ display: "inline-block", borderBottom: `1px solid ${GREY_MID}`, width: 140 }}>&nbsp;</span></div>
            <div style={{ marginBottom: 6 }}>Name: <span style={{ display: "inline-block", borderBottom: `1px solid ${GREY_MID}`, width: 140 }}>&nbsp;</span></div>
            <div style={{ marginBottom: 6 }}>Position: <span style={{ display: "inline-block", borderBottom: `1px solid ${GREY_MID}`, width: 130 }}>&nbsp;</span></div>
            <div>Date: <span style={{ display: "inline-block", borderBottom: `1px solid ${GREY_MID}`, width: 145 }}>&nbsp;</span></div>
          </div>
        ))}
      </div>

      {/* Office Use */}
      <div style={{ marginTop: 10, border: `1.5px solid ${GREY_DARK}`, fontSize: 9 }}>
        <div style={{ background: GREY_DARK, color: "white", padding: "3px 7px", fontWeight: "bold", letterSpacing: 1, fontFamily: "Arial, sans-serif" }}>OFFICE USE ONLY</div>
        <div style={{ display: "flex", borderTop: `1px solid ${BORDER}` }}>
          {["Account / Ref. No.", "Credit Limit", "Approved By", "Data Inputted", "Date"].map((h, i) => (
            <div key={h} style={{ flex: 1, padding: "3px 6px", borderRight: i < 4 ? `1px solid ${BORDER}` : "none", fontFamily: "Arial, sans-serif" }}>
              <div style={{ fontSize: 8, color: GREY_MID }}>{h}</div>
              <div style={{ minHeight: 16 }}>{h === "Credit Limit" ? "$" : ""}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}