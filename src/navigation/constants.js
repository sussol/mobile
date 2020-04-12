/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

/**
 * Constants related to Navigation within the app.
 */

export const ROUTES = {
  MENU: 'menu',

  REALM_EXPLORER: 'realmExplorer',

  CUSTOMER_REQUISITION: 'customerRequisition',
  CUSTOMER_REQUISITIONS: 'customerRequisitions',
  CUSTOMER_REQUISITIONS_WITH_PROGRAMS: 'customerRequisitionsWithPrograms',

  SUPPLIER_REQUISITION: 'supplierRequisition',
  SUPPLIER_REQUISITION_WITH_PROGRAM: 'supplierRequisitionWithProgram',
  SUPPLIER_REQUISITIONS: 'supplierRequisitions',
  SUPPLIER_REQUISITIONS_WITH_PROGRAMS: 'supplierRequisitionsWithPrograms',

  CUSTOMER_INVOICE: 'customerInvoice',
  CUSTOMER_INVOICES: 'customerInvoices',

  SUPPLIER_INVOICE: 'supplierInvoice',
  SUPPLIER_INVOICE_WITH_PRICES: 'supplierInvoiceWithPrices',
  SUPPLIER_INVOICES: 'supplierInvoices',

  STOCK: 'stock',
  STOCK_WITH_CREDITS: 'stockWithCredits',

  STOCKTAKES: 'stocktakes',
  STOCKTAKE_MANAGER: 'stocktakeManager',
  STOCKTAKE_EDITOR: 'stocktakeEditor',
  STOCKTAKE_EDITOR_WITH_REASONS: 'stocktakeEditorWithReasons',

  DISPENSARY: 'dispensary',
  PRESCRIPTIONS: 'prescriptions',
  PRESCRIPTION: 'prescription',

  CASH_REGISTER: 'cashRegister',

  SETTINGS: 'settings',
  DASHBOARD: 'dashboard',
};

export const FINALISABLE_PAGES = [
  ROUTES.SUPPLIER_INVOICE,
  ROUTES.CUSTOMER_INVOICE,
  ROUTES.CUSTOMER_REQUISITION,
  ROUTES.SUPPLIER_REQUISITION,
  ROUTES.STOCKTAKE_EDITOR,
];
