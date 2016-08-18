/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// import { CURRENT_LANGUAGE } from '../settings';
const CURRENT_LANGUAGE = 'en'; // settings not set up for this yet

const strings = {
  en: {
    current_stock: 'Current Stock',
    customer_invoices: 'Customer Invoices',
    customers: 'Customers',
    finalise: 'FINALISE',
    finalised_cannot_be_edited: 'FINALISED. CANNOT BE EDITED',
    invoice: 'Invoice',
    last_sync: 'LAST SYNC',
    log_out: 'LOG OUT',
    manage_stocktake: 'Manage Stockake',
    new_stocktake: 'New Stocktake',
    requisition: 'Requisition',
    requisitions: 'Requisitions',
    stocktakes: 'stocktakes',
    supplier_invoices: 'Supplier Invoices',
    sync_enabled: 'SYNC ENABLED',
    sync_error: 'SYNC ERROR',
    sync_in_progress: 'SYNC IN PROGRESS',
  },
  tetum: {
  },
};

export const navStrings = strings[CURRENT_LANGUAGE];
