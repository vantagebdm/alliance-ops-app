export const CATEGORIES = [
  "Engine","Filters","Brakes","Suspension","Electrical","Hydraulic",
  "Cooling","Fuel","Driveline","Tyres","Undercarriage","Trailer Parts",
  "LV Parts","Truck Parts","Plant Parts","Fixed Plant","Generator Parts","Other"
];

export const EQUIPMENT_TYPES = [
  "Light Vehicles","Light Trucks","Heavy Trucks / Prime Movers","Trailers",
  "Earthmoving Equipment","Plant & Equipment","Fixed Plant",
  "Generators & Lighting Towers","Agricultural","Marine","Other"
];

export const FREIGHT_METHODS = [
  "Road Freight","Air Freight","Express","Overnight",
  "Customer Collection","Supplier Delivery","Other"
];

export const DOC_TYPES = [
  "Supplier Price List","Trading Terms","Credit Application / Account Form",
  "Freight Schedule","Warranty Policy","Catalogue PDF",
  "Product List Spreadsheet","Account Statement Sample","Other"
];

export const DEFAULT_SUPPLIER = {
  name: "", trading_name: "", supplier_code: "", abn: "", acn: "",
  website: "", phone: "", email: "", status: "active",
  contact_person: "", contact_position: "", contact_phone: "",
  contact_mobile: "", contact_email: "", contact_method: "Email",
  additional_contacts: [],
  accounts_contact_name: "", accounts_phone: "", accounts_email: "",
  statement_email: "", orders_email: "", returns_email: "", invoice_email: "",
  address: "", address2: "", city: "", state: "WA", postcode: "", country: "Australia",
  warehouse_same_as_head: true, warehouse_address: "", warehouse_address2: "",
  warehouse_city: "", warehouse_state: "", warehouse_postcode: "", warehouse_country: "Australia",
  returns_same_as_warehouse: true, returns_address: "", returns_address2: "",
  returns_city: "", returns_state: "", returns_postcode: "", returns_country: "Australia",
  account_number: "", payment_terms: "Net_30", payment_terms_custom: "",
  credit_limit: "", currency: "AUD", gst_registered: true,
  bank_name: "", bank_account_name: "", bank_bsb: "", bank_account_number: "",
  accepts_credit_card: false, card_surcharge: "", purchase_method: "Email PO",
  preferred_supplier: false, categories_supplied: [], equipment_types: [],
  brands_supplied: [], oem_aftermarket: "Both", warranty_support: false,
  returns_accepted: false, core_exchange: false,
  lead_time_standard: "", lead_time_express: "", emergency_supply: false,
  ships_karratha: false, ships_pilbara: false, freight_methods: [],
  freight_account_option: "Supplier Freight", free_freight_threshold: "",
  dangerous_goods_notes: "", cutoff_time: "", dispatch_origin: "",
  sales_territory: "", business_hours: "", afterhours_contact: "",
  breakdown_contact: "", min_order_value: "", moq_notes: "",
  price_file_available: false, live_stock_feed: false, api_portal_available: false,
  portal_url: "", portal_username: "", portal_notes: "",
  pricing_basis: "Nett Cost", discount_notes: "", rebate_agreement: false,
  volume_agreement: false, special_contract_terms: "", margin_notes: "",
  competitive_position: "Standard", preferred_breakdown: false,
  returns_contact: "", warranty_contact: "", return_window: "",
  restocking_fee: "", rma_required: false, warranty_claim_notes: "",
  core_return_notes: "", faulty_goods_notes: "",
  internal_notes: "", pricing_notes: "", freight_notes: "",
  reliability_notes: "", risk_notes: "", rating: 3, preferred_ranking: "",
  last_review_date: "", review_frequency: "", approved_by: "", managed_by: "",
  attachments: [], notes: ""
};