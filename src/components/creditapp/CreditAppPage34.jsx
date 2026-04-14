// Pages 3-4 — Terms and Conditions of Trade

const GREY_DARK = "#1a1a1a";
const GREY_MID = "#4a4a4a";
const BORDER = "#cccccc";

const TermsSection = ({ title, content }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontWeight: "bold", fontSize: 8.5, color: GREY_DARK, marginBottom: 2, fontFamily: "Arial, sans-serif" }}>{title}</div>
    <div style={{ fontSize: 7.5, lineHeight: 1.55, color: GREY_DARK, whiteSpace: "pre-wrap", fontFamily: "Arial, sans-serif" }}>{content}</div>
  </div>
);

export default function CreditAppPage34({ template: t }) {
  const coName = t?.company_name || "Alliance Priority Parts Pty. Ltd.";
  const logoUrl = t?.logo_url || "https://media.base44.com/images/public/69dccee2e4380f803487afa5/d6f3ce989_image.png";
  const coEmail = t?.company_email || "accounts@alliancepriorityparts.com.au";
  const coWeb = t?.company_web || "www.alliancepriorityparts.com.au";
  const coAbn = t?.company_abn || "33 697 061 279";
  const coAcn = t?.company_acn || "697 061 279";
  const coAddr = t?.company_address || "3873 Pemberton Way, Karratha Industrial Estate WA 6714";

  const sections = [
    { title: "1. Definitions", content: t?.terms_definitions },
    { title: "2. Acceptance", content: t?.terms_acceptance },
    { title: "3. Errors and Omissions", content: t?.terms_errors_omissions },
    { title: "6. Price and Payment", content: t?.terms_price_payment },
    { title: "7. Delivery of Goods", content: t?.terms_delivery },
    { title: "8. Risk", content: t?.terms_risk },
    { title: "11. Title", content: t?.terms_title },
    { title: "12. Personal Property Securities Act 2009 (\"PPSA\")", content: t?.terms_ppsa },
    { title: "13. Security and Charge", content: t?.terms_security_charge },
    { title: "14. Defects, Warranties and Returns", content: t?.terms_defects_warranties },
    { title: "16. Default and Consequences of Default", content: t?.terms_default },
    { title: "17. Cancellation", content: t?.terms_cancellation },
    { title: "18. Privacy Policy", content: t?.terms_privacy },
    { title: "20. Service of Notices", content: t?.terms_service_notices },
    { title: "21. Trusts", content: t?.terms_trusts },
    { title: "22. General", content: t?.terms_general },
  ];

  // Split into two pages
  const mid = Math.ceil(sections.length / 2);
  const page3Sections = sections.slice(0, mid);
  const page4Sections = sections.slice(mid);

  const PageHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, paddingBottom: 8, borderBottom: `1.5px solid ${GREY_DARK}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={logoUrl} alt="APP Logo" style={{ height: 40, objectFit: "contain" }} crossOrigin="anonymous" />
        <div>
          <div style={{ fontWeight: "bold", fontSize: 10, fontFamily: "Arial, sans-serif", color: GREY_DARK }}>{coName} – Terms &amp; Conditions of Trade</div>
          <div style={{ fontSize: 7.5, color: GREY_MID, fontFamily: "Arial, sans-serif" }}>ABN: {coAbn} | ACN: {coAcn} | {coAddr}</div>
        </div>
      </div>
    </div>
  );

  const PageFooter = ({ pageNum }) => (
    <div style={{ marginTop: 12, paddingTop: 6, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", fontSize: 7, color: GREY_MID, fontFamily: "Arial, sans-serif" }}>
      <span>{coName} — Terms &amp; Conditions of Trade — Page {pageNum} of 4</span>
      <span>These terms govern all transactions between {coName} and its Customers. Governing law: Western Australia.</span>
    </div>
  );

  return (
    <>
      {/* Page 3 */}
      <div className="pdf-page" style={{ width: 794, background: "white", padding: "24px 32px", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }}>
        <PageHeader />
        <div style={{ columns: 2, columnGap: 20 }}>
          {page3Sections.map(s => (
            <TermsSection key={s.title} title={s.title} content={s.content} />
          ))}
        </div>
        <PageFooter pageNum={3} />
      </div>

      {/* Page 4 */}
      <div className="pdf-page" style={{ width: 794, background: "white", padding: "24px 32px", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }}>
        <PageHeader />
        <div style={{ columns: 2, columnGap: 20 }}>
          {page4Sections.map(s => (
            <TermsSection key={s.title} title={s.title} content={s.content} />
          ))}
        </div>
        <PageFooter pageNum={4} />
      </div>
    </>
  );
}