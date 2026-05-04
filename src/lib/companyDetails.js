const STORAGE_KEY = "app_company_profile";

const DEFAULTS = {
  legal_name: "Alliance Priority Parts Pty Ltd",
  trading_name: "Alliance Priority Parts",
  abn: "12 345 678 901",
  acn: "345 678 901",
  reg_address: "14 Industrial Drive, Karratha WA 6714",
  postal_address: "PO Box 123, Karratha WA 6714",
  phone: "(08) 9144 1234",
  email: "accounts@alliancepartsgroup.com.au",
  website: "www.allianceparts.com.au",
  footer_text: "Alliance Priority Parts Pty Ltd | ABN 12 345 678 901 | All prices are in AUD and include GST where applicable.",
  bank_name: "ANZ Bank",
  bank_bsb: "016-123",
  bank_account: "1234 5678",
  bank_account_name: "Alliance Priority Parts Pty Ltd",
  remittance_email: "accounts@alliancepartsgroup.com.au",
  business_hours: "Mon–Fri 7:00am–5:00pm AWST",
  afterhours_contact: "0400 000 000",
};

export function getCompanyProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveCompanyProfile(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Legacy COMPANY constant — reads live from storage for PDF generators
export const COMPANY = (() => {
  const p = getCompanyProfile();
  return {
    name: p.trading_name || p.legal_name,
    address: p.reg_address,
    city: "",
    state: "",
    postcode: "",
    phone: p.phone,
    email: p.email,
    website: p.website,
    hours: p.business_hours,
    abn: p.abn,
  };
})();