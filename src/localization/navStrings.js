/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// import { CURRENT_LANGUAGE } from '../settings';
const CURRENT_LANGUAGE = 'en'; // settings not set up for this yet

const strings = {
  en: {
    sync_enabled: 'SYNC ENABLED (en)',
    sync_in_progress: 'SYNC IN PROGRESS (en)',
    sync_error: 'SYNC ERROR. (en)',
    last_sync: 'LAST SYNC (en)',
    customer_invoices: 'Customer Invoices (en)',
    customers: 'Customers (en)',
    supplier_invoices: 'Supplier Invoices (en)',
    requisitions: 'Requsisitions (en)',
    current_stock: 'Current Stock (en)',
    stocktakes: 'stocktakes (en)',
    log_out: 'LOG OUT (en)',
  },
  tetum: {
  },
};

export const navStrings = strings[CURRENT_LANGUAGE];
