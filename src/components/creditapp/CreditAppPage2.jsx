// Page 2 — Personal / Directors Guarantee and Indemnity

const GREY_DARK = "#1a1a1a";
const GREY_MID = "#4a4a4a";
const BORDER = "#cccccc";

const SignBlock = ({ n }) => (
  <div style={{ flex: 1, border: `1px solid ${BORDER}`, padding: "7px 10px", fontSize: 8.5, fontFamily: "Arial, sans-serif", lineHeight: 2.1 }}>
    <div style={{ fontWeight: "bold", marginBottom: 4 }}>GUARANTOR-{n}</div>
    {["SIGNED:", "FULL NAME:", "HOME ADDRESS:", "DATE OF BIRTH:", "SIGNATURE OF WITNESS:", "NAME OF WITNESS:", "OCCUPATION:", "PRESENT ADDRESS:"].map(f => (
      <div key={f} style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, paddingBottom: 2, marginBottom: 2 }}>
        <span style={{ minWidth: 110, color: GREY_MID }}>{f}</span>
        <span style={{ flex: 1 }}>&nbsp;</span>
      </div>
    ))}
    <div style={{ marginTop: 4, fontSize: 8 }}>
      EXECUTED as a Deed this __________ day of __________________ 20____
    </div>
  </div>
);

export default function CreditAppPage2({ template: t }) {
  const coName = t?.company_name || "Alliance Priority Parts Pty. Ltd.";
  const coAbn = t?.company_abn || "33 697 061 279";
  const coAcn = t?.company_acn || "697 061 279";
  const coAddr = t?.company_address || "3873 Pemberton Way, Karratha Industrial Estate WA 6714";
  const coEmail = t?.company_email || "accounts@alliancepriorityparts.com.au";
  const coWeb = t?.company_web || "www.alliancepriorityparts.com.au";
  const logoUrl = t?.logo_url || "https://media.base44.com/images/public/69dccee2e4380f803487afa5/d6f3ce989_image.png";
  const introText = t?.guarantee_intro_text || `IN CONSIDERATION of ${coName} and its successors and assigns ("Alliance Priority Parts") at the request of the Guarantor (as is now acknowledged) supplying and continuing to supply goods and/or services to`;
  const clauses = t?.guarantee_clauses || "";

  return (
    <div className="pdf-page" style={{ width: 794, background: "white", padding: "28px 36px", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }}>
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

      {/* Title */}
      <h2 style={{ fontSize: 16, fontWeight: "bold", color: GREY_DARK, margin: "0 0 8px 0", fontFamily: "Arial, sans-serif" }}>
        Personal/Directors Guarantee and Indemnity
      </h2>

      {/* Intro */}
      <p style={{ fontSize: 8.5, lineHeight: 1.6, color: GREY_DARK, marginBottom: 8 }}>
        <u>IN CONSIDERATION</u> of {coName} and its successors and assigns ("{coName.split(" ")[0]} {coName.split(" ")[1]}") at the request of the Guarantor (as is now acknowledged) supplying and continuing to supply goods and/or services to
      </p>

      {/* Customer name box */}
      <div style={{ border: `1.5px solid ${GREY_DARK}`, padding: "6px 10px", marginBottom: 8, minHeight: 28, fontSize: 9 }}>
        <span style={{ color: GREY_MID, fontSize: 8 }}>Customer's Full Legal Name / Company Name:</span>
        <span style={{ fontStyle: "italic", fontSize: 8.5, marginLeft: 4 }}>("the Customer") [Insert Company Name In Box Provided]</span>
      </div>

      {/* Clauses */}
      <div style={{ fontSize: 8, lineHeight: 1.55, color: GREY_DARK, whiteSpace: "pre-wrap", marginBottom: 10 }}>
        <strong>I/WE (also referred to as the "Guarantor/s") UNCONDITIONALLY AND IRREVOCABLY:</strong>
        {"\n\n"}
        {clauses}
      </div>

      {/* For and on behalf */}
      <p style={{ fontSize: 8.5, lineHeight: 1.6, color: GREY_DARK, margin: "8px 0" }}>
        <strong>For and on behalf of the Customer I/We confirm I/We have read, understood and accept the terms of this Guarantee and Indemnity and I/We agree to be bound by this Guarantee and Indemnity.</strong>
      </p>

      {/* Notes */}
      <div style={{ fontSize: 7.5, color: GREY_MID, marginBottom: 8, lineHeight: 1.55 }}>
        <div>Note: 1. If the Customer is a proprietary limited company, the Guarantor(s) must be the director(s) of the company.</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. If the Customer is a limited partnership, the Guarantor(s) must be the general partners.</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. If the Customer is a sole trader or partnership the Guarantor(s) should be some other suitable person(s).</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4. If the Customer is a club or incorporated society the Guarantor(s) should be the president and secretary or another committee member.</div>
      </div>

      {/* Warning */}
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 9, color: GREY_DARK, marginBottom: 10, border: `1.5px solid ${GREY_DARK}`, padding: "5px 10px" }}>
        WARNING: THIS IS AN IMPORTANT DOCUMENT. YOU SHOULD SEE YOUR OWN LAWYER OR ADVISOR BEFORE SIGNING IT.
      </div>

      {/* Signature blocks */}
      <div style={{ display: "flex", gap: 10 }}>
        <SignBlock n={1} />
        <SignBlock n={2} />
      </div>
    </div>
  );
}