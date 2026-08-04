// Supplier Account Application Form — Page 1

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

const Tick = () => (
  <span style={{ display: "inline-block", width: 10, height: 10, border: `1.5px solid ${GREY_MID}`, marginRight: 3, verticalAlign: "middle", background: "white" }} />
);

const SectionTitle = ({ children }) => (
  <div style={{ padding: "4px 7px", background: "#f5f5f5", borderBottom: `1px solid ${BORDER}`, fontSize: 9.5, fontFamily: "Arial, sans-serif", color: GREY_DARK }}>
    <strong>{children}</strong>
  </div>
);

export default function SupplierAppPage1({ logoUrl }) {
  const coName = "Alliance Priority Parts Pty. Ltd.";
  const coAbn = "33 697 061 279";
  const coAcn = "697 061 279";
  const coAddr = "3873 Pemberton Way, Karratha Industrial Estate WA 6714";
  const coEmail = "accounts@alliancepartsgroup.com.au";
  const coWeb = "www.alliancepartsgroup.com.au";
  const imgSrc = logoUrl || "https://media.base44.com/images/public/69dccee2e4380f803487afa5/d6f3ce989_image.png";

  return (
    <div className="pdf-page" style={{ width: 794, background: "white", padding: "28px 36px 28px 36px", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <img src={imgSrc} alt="APP Logo" style={{ height: 64, objectFit: "contain" }} />
        </div>
        <div style={{ textAlign: "right", fontSize: 9.5, lineHeight: 1.6, color: GREY_DARK }}>
          <strong style={{ fontSize: 11 }}>{coName}</strong><br />
          ABN: {coAbn}<br />
          ACN: {coAcn}<br />
          {coAddr}<br />
          Email: {coEmail}<br />
          Web: {coWeb}
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h1 style={{ fontSize: 20, fontWeight: "bold", fontFamily: "Arial, sans-serif", letterSpacing: 2, color: GREY_DARK, margin: 0, textTransform: "uppercase" }}>SUPPLIER ACCOUNT APPLICATION</h1>
        <p style={{ fontSize: 8.5, color: GREY_MID, margin: "4px 0 0 0" }}>To Be Completed By Supplier — Please complete all sections and return to accounts@alliancepartsgroup.com.au</p>
      </div>

      {/* Main table */}
      <div style={{ border: `1.5px solid ${BORDER}`, fontSize: 9.5 }}>

        {/* Supplier Type */}
        <Row>
          <Cell style={{ padding: "5px 7px" }}>
            <strong>Supplier Type:</strong>&nbsp;&nbsp;
            {["Sole Trader", "Partnership", "Company / Pty Ltd", "Trust", "Other:"].map(t => (
              <span key={t} style={{ marginRight: 10, whiteSpace: "nowrap" }}><Tick />{t}</span>
            ))}
          </Cell>
        </Row>

        {/* Company Details */}
        <SectionTitle>Section 1 — Company / Business Details</SectionTitle>
        <Row><Cell label="Full Legal / Company Name:" style={{ minHeight: 22 }}> </Cell></Row>
        <Row><Cell label="Trading Name (if different):" style={{ minHeight: 22 }}> </Cell></Row>
        <Row>
          <Cell label="ABN:" style={{ flex: 1 }}> </Cell>
          <Cell label="ACN:" style={{ flex: 1 }}> </Cell>
          <Cell label="Date Established:" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>
        <Row><Cell label="Nature / Type of Business:" style={{ minHeight: 22 }}> </Cell></Row>
        <Row>
          <Cell label="Head Office Address:" style={{ flex: 3 }}> </Cell>
          <Cell label="State:" style={{ width: 90 }}> </Cell>
          <Cell label="Postcode:" style={{ width: 80, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Warehouse / Dispatch Address (if different):" style={{ flex: 3 }}> </Cell>
          <Cell label="State:" style={{ width: 90 }}> </Cell>
          <Cell label="Postcode:" style={{ width: 80, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="General Phone:" style={{ flex: 1 }}> </Cell>
          <Cell label="General Email:" style={{ flex: 2 }}> </Cell>
          <Cell label="Website:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>

        {/* Primary Contact */}
        <SectionTitle>Section 2 — Primary Contact / Sales Representative</SectionTitle>
        <Row>
          <Cell label="Contact Name:" style={{ flex: 2 }}> </Cell>
          <Cell label="Position / Title:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Direct Phone:" style={{ flex: 1 }}> </Cell>
          <Cell label="Mobile:" style={{ flex: 1 }}> </Cell>
          <Cell label="Email:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>

        {/* Accounts Contact */}
        <SectionTitle>Section 3 — Accounts / Finance Contact</SectionTitle>
        <Row>
          <Cell label="Accounts Contact Name:" style={{ flex: 2 }}> </Cell>
          <Cell label="Position / Title:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Accounts Phone:" style={{ flex: 1 }}> </Cell>
          <Cell label="Accounts Email:" style={{ flex: 2 }}> </Cell>
          <Cell label="Statements Email:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Invoices Email:" style={{ flex: 2 }}> </Cell>
          <Cell label="Returns / Credits Email:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>

        {/* Additional Contacts */}
        <SectionTitle>Section 4 — Additional Contacts (Technical / Customer Service / After Hours)</SectionTitle>
        <Row>
          <Cell style={{ width: 24, textAlign: "center" }}>&nbsp;</Cell>
          <Cell style={{ flex: 2 }}><strong>Name / Role:</strong></Cell>
          <Cell style={{ flex: 1 }}><strong>Phone:</strong></Cell>
          <Cell style={{ flex: 2, borderRight: "none" }}><strong>Email:</strong></Cell>
        </Row>
        {[1, 2].map(n => (
          <Row key={n}>
            <Cell style={{ width: 24, textAlign: "center" }}>{n}.</Cell>
            <Cell style={{ flex: 2, minHeight: 20 }}> </Cell>
            <Cell style={{ flex: 1, minHeight: 20 }}> </Cell>
            <Cell style={{ flex: 2, minHeight: 20, borderRight: "none" }}> </Cell>
          </Row>
        ))}
        <Row>
          <Cell label="After Hours / Breakdown Emergency Contact Name:" style={{ flex: 2 }}> </Cell>
          <Cell label="Phone:" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Business Hours:" style={{ flex: 2 }}> </Cell>
          <Cell label="Sales Territory / Coverage Area:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>

      </div>

      {/* Footer note */}
      <div style={{ marginTop: 6, fontSize: 8, color: GREY_MID, fontFamily: "Arial, sans-serif" }}>
        Page 1 of 2 — Continue overleaf
      </div>
    </div>
  );
}