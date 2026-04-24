// Supplier Account Application Form — Page 2

const GREY_DARK = "#1a1a1a";
const GREY_MID = "#4a4a4a";
const BORDER = "#cccccc";

const Row = ({ children, style }) => (
  <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, ...style }}>{children}</div>
);

const Cell = ({ children, style, width, label }) => (
  <div style={{ padding: "4px 7px", width: width || "auto", flex: width ? undefined : 1, borderRight: `1px solid ${BORDER}`, ...style }}>
    {label && <span style={{ fontSize: 8.5, color: GREY_MID, fontFamily: "Arial, sans-serif" }}>{label}</span>}
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

export default function SupplierAppPage2() {
  const coName = "Alliance Priority Parts Pty. Ltd.";
  const coAbn = "33 697 061 279";
  const coAcn = "697 061 279";
  const coAddr = "3873 Pemberton Way, Karratha Industrial Estate WA 6714";
  const coEmail = "accounts@alliancepartsgroup.com.au";
  const coWeb = "www.alliancepartsgroup.com.au";
  const logoUrl = "https://media.base44.com/images/public/69dccee2e4380f803487afa5/d6f3ce989_image.png";

  return (
    <div className="pdf-page" style={{ width: 794, background: "white", padding: "28px 36px 28px 36px", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <img src={logoUrl} alt="APP Logo" style={{ height: 52, objectFit: "contain" }} crossOrigin="anonymous" />
        <div style={{ textAlign: "right", fontSize: 9, lineHeight: 1.6, color: GREY_DARK }}>
          <strong style={{ fontSize: 10 }}>{coName}</strong><br />
          ABN: {coAbn} | ACN: {coAcn}<br />
          {coAddr}<br />
          Email: {coEmail} | Web: {coWeb}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: "bold", fontFamily: "Arial, sans-serif", letterSpacing: 1, color: GREY_DARK, margin: 0, textTransform: "uppercase" }}>SUPPLIER ACCOUNT APPLICATION — CONTINUED</h2>
      </div>

      {/* Main table */}
      <div style={{ border: `1.5px solid ${BORDER}`, fontSize: 9.5 }}>

        {/* Payment Terms */}
        <SectionTitle>Section 5 — Payment Terms &amp; Financial Details</SectionTitle>
        <Row>
          <Cell style={{ padding: "5px 7px" }}>
            <strong>Payment Terms Offered:</strong>&nbsp;&nbsp;
            {["COD", "7 Days", "14 Days", "30 Days", "30 Days EOM", "60 Days", "Other:"].map(t => (
              <span key={t} style={{ marginRight: 10, whiteSpace: "nowrap" }}><Tick />{t}</span>
            ))}
          </Cell>
        </Row>
        <Row>
          <Cell label="Credit Limit Offered to APP: $" style={{ flex: 1 }}> </Cell>
          <Cell label="Currency:" style={{ flex: 1 }}> </Cell>
          <Cell label="GST Registered?" style={{ flex: 1, borderRight: "none" }}>
            &nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO
          </Cell>
        </Row>
        <Row>
          <Cell label="Account / Customer Number Assigned to APP:" style={{ flex: 2 }}> </Cell>
          <Cell label="Pricing Basis (Trade / Wholesale / List):" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell style={{ padding: "5px 7px" }}>
            <strong>Accepts Credit Card?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO&nbsp;&nbsp;&nbsp;
            <strong>Card Surcharge %:</strong>&nbsp;
            <span style={{ display: "inline-block", borderBottom: `1px solid ${GREY_MID}`, width: 50, verticalAlign: "bottom" }}>&nbsp;</span>&nbsp;&nbsp;&nbsp;
            <strong>Rebate / Volume Agreement Available?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO
          </Cell>
        </Row>
        <Row><Cell label="Discount / Rebate Notes:" style={{ minHeight: 24 }}> </Cell></Row>
        <Row><Cell label="Special Contract Terms / Notes:" style={{ minHeight: 24 }}> </Cell></Row>

        {/* Bank Details */}
        <SectionTitle>Section 6 — Banking / Remittance Details</SectionTitle>
        <Row>
          <Cell label="Bank Name:" style={{ flex: 2 }}> </Cell>
          <Cell label="BSB:" style={{ flex: 1 }}> </Cell>
          <Cell label="Account Number:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Account Name:" style={{ flex: 2 }}> </Cell>
          <Cell label="Branch:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Remittance Advice Email:" style={{ flex: 2 }}> </Cell>
          <Cell label="SWIFT / BIC (if applicable):" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>

        {/* Ordering Details */}
        <SectionTitle>Section 7 — Ordering &amp; Procurement Details</SectionTitle>
        <Row>
          <Cell style={{ padding: "5px 7px" }}>
            <strong>Preferred Order Method:</strong>&nbsp;&nbsp;
            {["Phone", "Email", "Online Portal / Web Order", "EDI", "Sales Rep Visit", "Other:"].map(t => (
              <span key={t} style={{ marginRight: 10, whiteSpace: "nowrap" }}><Tick />{t}</span>
            ))}
          </Cell>
        </Row>
        <Row>
          <Cell label="Orders / Purchase Orders Email:" style={{ flex: 2 }}> </Cell>
          <Cell label="Order Confirmation Email:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Online Portal URL:" style={{ flex: 2 }}> </Cell>
          <Cell label="Portal Login / Username:" style={{ flex: 1 }}> </Cell>
          <Cell label="Cut-off Time for Same Day:" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell label="Standard Lead Time (days):" style={{ flex: 1 }}> </Cell>
          <Cell label="Express Lead Time (days):" style={{ flex: 1 }}> </Cell>
          <Cell label="Minimum Order Value: $" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>
        <Row>
          <Cell style={{ padding: "5px 7px" }}>
            <strong>Ships to Karratha / Pilbara?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO&nbsp;&nbsp;&nbsp;
            <strong>Emergency / After Hours Supply?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO&nbsp;&nbsp;&nbsp;
            <strong>Price File Available?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO
          </Cell>
        </Row>
        <Row>
          <Cell style={{ padding: "5px 7px" }}>
            <strong>Freight Account Options:</strong>&nbsp;&nbsp;
            {["APP Freight Account", "Supplier Freight Account", "Third Party", "Free Freight (above threshold)"].map(t => (
              <span key={t} style={{ marginRight: 10, whiteSpace: "nowrap" }}><Tick />{t}</span>
            ))}
          </Cell>
        </Row>
        <Row><Cell label="Freight / Dispatch Notes:" style={{ minHeight: 24 }}> </Cell></Row>

        {/* Returns & Warranty */}
        <SectionTitle>Section 8 — Returns, Warranty &amp; Claims</SectionTitle>
        <Row>
          <Cell style={{ padding: "5px 7px" }}>
            <strong>Returns Accepted?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO&nbsp;&nbsp;&nbsp;
            <strong>RMA Required?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO&nbsp;&nbsp;&nbsp;
            <strong>Core / Exchange Program?</strong>&nbsp;&nbsp;<Tick />YES&nbsp;&nbsp;<Tick />NO
          </Cell>
        </Row>
        <Row>
          <Cell label="Return Window:" style={{ flex: 1 }}> </Cell>
          <Cell label="Restocking Fee %:" style={{ flex: 1 }}> </Cell>
          <Cell label="Returns / Credits Contact:" style={{ flex: 2, borderRight: "none" }}> </Cell>
        </Row>
        <Row><Cell label="Warranty Claim Notes / Procedure:" style={{ minHeight: 24 }}> </Cell></Row>
        <Row><Cell label="Dangerous Goods / Hazmat Notes:" style={{ minHeight: 24 }}> </Cell></Row>

        {/* Products Supplied */}
        <SectionTitle>Section 9 — Products &amp; Categories Supplied</SectionTitle>
        <Row>
          <Cell style={{ padding: "5px 7px", fontSize: 8.5 }}>
            <strong>Categories Supplied:</strong>&nbsp;&nbsp;
            {["Engine", "Transmission", "Brakes", "Suspension", "Electrical", "Filters", "Hydraulic", "Cooling", "Fuel", "Driveline", "Tyres", "Oils & Fluids", "Chemicals", "Consumables", "Compliance", "Fasteners", "Other:"].map(t => (
              <span key={t} style={{ marginRight: 8, whiteSpace: "nowrap" }}><Tick />{t}</span>
            ))}
          </Cell>
        </Row>
        <Row>
          <Cell label="Brands / Manufacturers Supplied:" style={{ flex: 3 }}> </Cell>
          <Cell label="OEM / Aftermarket / Both:" style={{ flex: 1, borderRight: "none" }}> </Cell>
        </Row>
        <Row><Cell label="Additional Product Notes:" style={{ minHeight: 20 }}> </Cell></Row>

      </div>

      {/* Declaration & Signatures */}
      <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", padding: "8px 7px", fontSize: 8.5, lineHeight: 1.6, color: GREY_DARK }}>
        The undersigned confirms that all information provided in this Supplier Account Application is true and correct. I/We authorise Alliance Priority Parts Pty. Ltd. to use this information for the purpose of establishing a supplier account and agree to comply with Alliance Priority Parts' standard purchase and payment terms as communicated.
      </div>

      {/* Signatures */}
      <div style={{ display: "flex", gap: 24, marginTop: 10, fontSize: 8.5, color: GREY_DARK }}>
        {[{ label: "SUPPLIER AUTHORISED REPRESENTATIVE", role: "supplier" }, { label: "ALLIANCE PRIORITY PARTS — AUTHORISED BY", role: "app" }].map((s) => (
          <div key={s.role} style={{ flex: 1 }}>
            <div style={{ marginBottom: 6 }}><strong>SIGNED ({s.label}):</strong> <span style={{ display: "inline-block", borderBottom: `1px solid ${GREY_MID}`, width: 120 }}>&nbsp;</span></div>
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
          {["Supplier Code", "Credit Limit Approved", "Payment Terms Confirmed", "Approved By", "Date"].map((h, i) => (
            <div key={h} style={{ flex: 1, padding: "3px 6px", borderRight: i < 4 ? `1px solid ${BORDER}` : "none", fontFamily: "Arial, sans-serif" }}>
              <div style={{ fontSize: 8, color: GREY_MID }}>{h}</div>
              <div style={{ minHeight: 16 }}>{h === "Credit Limit Approved" ? "$" : ""}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 6, fontSize: 8, color: GREY_MID, fontFamily: "Arial, sans-serif" }}>
        Page 2 of 2 — Alliance Priority Parts Pty. Ltd. | ABN: 33 697 061 279 | accounts@alliancepartsgroup.com.au
      </div>
    </div>
  );
}