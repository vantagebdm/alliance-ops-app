export const DEFAULT_ROLES = [
  "Super Admin",
  "Director",
  "General Manager",
  "Branch Manager",
  "Accounts Manager",
  "Accounts Payable",
  "Accounts Receivable",
  "Payroll Officer",
  "Purchasing Officer",
  "Inventory Controller",
  "Parts Interpreter",
  "Sales Representative",
  "Warehouse Operator",
  "Dispatch Officer",
  "Read Only / Auditor",
];

export const ROLE_COLORS = {
  "Super Admin": "#ef4444",
  "Director": "#f97316",
  "General Manager": "#eab308",
  "Branch Manager": "#3b82f6",
  "Accounts Manager": "#8b5cf6",
  "Accounts Payable": "#6366f1",
  "Accounts Receivable": "#0ea5e9",
  "Payroll Officer": "#ec4899",
  "Purchasing Officer": "#22c55e",
  "Inventory Controller": "#14b8a6",
  "Parts Interpreter": "#84cc16",
  "Sales Representative": "#f59e0b",
  "Warehouse Operator": "#94a3b8",
  "Dispatch Officer": "#64748b",
  "Read Only / Auditor": "#475569",
};

export const MODULE_PERMISSIONS = {
  enquiries:       { label: "Enquiries",         actions: ["view", "create", "edit", "delete", "convert_quote"] },
  quotes:          { label: "Quotes",             actions: ["view", "create", "edit", "delete", "approve", "convert_order"] },
  sales_orders:    { label: "Sales Orders",       actions: ["view", "create", "edit", "delete", "approve", "dispatch"] },
  invoices:        { label: "Invoices",           actions: ["view", "create", "edit", "delete", "send", "credit_note"] },
  customers:       { label: "Customers",          actions: ["view", "create", "edit", "delete", "view_credit", "set_credit_limit"] },
  parts:           { label: "Parts Master",       actions: ["view", "create", "edit", "delete", "view_cost", "edit_pricing"] },
  inventory:       { label: "Inventory",          actions: ["view", "adjust", "transfer", "stocktake", "view_value"] },
  purchasing:      { label: "Purchasing / POs",   actions: ["view", "create", "edit", "approve", "receive"] },
  suppliers:       { label: "Suppliers",          actions: ["view", "create", "edit", "delete", "view_banking"] },
  dispatch:        { label: "Dispatch",           actions: ["view", "create", "edit", "pod"] },
  accounting:      { label: "Accounting",         actions: ["view", "journals", "bank_recon", "view_reports"] },
  accounts_payable: { label: "Accounts Payable",  actions: ["view", "create_bill", "approve_bill", "process_payment"] },
  accounts_receivable: { label: "Accounts Receivable", actions: ["view", "allocate_payment", "credit_note"] },
  payroll:         { label: "Payroll",            actions: ["view", "create_run", "approve_run", "view_rates"] },
  bas:             { label: "BAS / GST",          actions: ["view", "prepare", "lodge"] },
  reports:         { label: "Reports",            actions: ["view_sales", "view_financial", "view_inventory", "export"] },
  admin:           { label: "Administration",     actions: ["system_settings", "user_management", "numbering", "audit_log"] },
};

export const DEFAULT_APPROVAL_LIMITS = {
  "Super Admin":          { purchase_order: -1, supplier_bill: -1, sales_discount_pct: 100, credit_note: -1, stock_adjustment: -1, customer_credit_limit: -1, supplier_payment: -1, payroll: true,  journal: -1,    bas_lodgement: true },
  "Director":             { purchase_order: -1, supplier_bill: -1, sales_discount_pct: 100, credit_note: -1, stock_adjustment: -1, customer_credit_limit: -1, supplier_payment: -1, payroll: true,  journal: -1,    bas_lodgement: true },
  "General Manager":      { purchase_order: 50000, supplier_bill: 50000, sales_discount_pct: 30, credit_note: 10000, stock_adjustment: 25000, customer_credit_limit: 50000, supplier_payment: 50000, payroll: false, journal: 25000, bas_lodgement: false },
  "Branch Manager":       { purchase_order: 10000, supplier_bill: 10000, sales_discount_pct: 20, credit_note: 5000,  stock_adjustment: 5000,  customer_credit_limit: 10000, supplier_payment: 10000, payroll: false, journal: 5000,  bas_lodgement: false },
  "Accounts Manager":     { purchase_order: 0,     supplier_bill: 25000, sales_discount_pct: 0,  credit_note: 10000, stock_adjustment: 0,     customer_credit_limit: 25000, supplier_payment: 25000, payroll: false, journal: 10000, bas_lodgement: true },
  "Accounts Payable":     { purchase_order: 0,     supplier_bill: 5000,  sales_discount_pct: 0,  credit_note: 0,     stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 5000,  payroll: false, journal: 0,     bas_lodgement: false },
  "Accounts Receivable":  { purchase_order: 0,     supplier_bill: 0,     sales_discount_pct: 0,  credit_note: 2000,  stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 0,     payroll: false, journal: 0,     bas_lodgement: false },
  "Payroll Officer":      { purchase_order: 0,     supplier_bill: 0,     sales_discount_pct: 0,  credit_note: 0,     stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 0,     payroll: true,  journal: 0,     bas_lodgement: false },
  "Purchasing Officer":   { purchase_order: 2500,  supplier_bill: 0,     sales_discount_pct: 0,  credit_note: 0,     stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 0,     payroll: false, journal: 0,     bas_lodgement: false },
  "Inventory Controller": { purchase_order: 0,     supplier_bill: 0,     sales_discount_pct: 0,  credit_note: 0,     stock_adjustment: 2500,  customer_credit_limit: 0,     supplier_payment: 0,     payroll: false, journal: 0,     bas_lodgement: false },
  "Parts Interpreter":    { purchase_order: 0,     supplier_bill: 0,     sales_discount_pct: 0,  credit_note: 0,     stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 0,     payroll: false, journal: 0,     bas_lodgement: false },
  "Sales Representative": { purchase_order: 0,     supplier_bill: 0,     sales_discount_pct: 10, credit_note: 0,     stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 0,     payroll: false, journal: 0,     bas_lodgement: false },
  "Warehouse Operator":   { purchase_order: 0,     supplier_bill: 0,     sales_discount_pct: 0,  credit_note: 0,     stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 0,     payroll: false, journal: 0,     bas_lodgement: false },
  "Dispatch Officer":     { purchase_order: 0,     supplier_bill: 0,     sales_discount_pct: 0,  credit_note: 0,     stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 0,     payroll: false, journal: 0,     bas_lodgement: false },
  "Read Only / Auditor":  { purchase_order: 0,     supplier_bill: 0,     sales_discount_pct: 0,  credit_note: 0,     stock_adjustment: 0,     customer_credit_limit: 0,     supplier_payment: 0,     payroll: false, journal: 0,     bas_lodgement: false },
};

export const DEFAULT_ROLE_PERMISSIONS = {
  "Super Admin":    { _all: "admin" },
  "Director":       { _all: "approve" },
  "General Manager": { _all: "edit" },
};

export function formatActionLabel(action) {
  return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}