/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { ROUTES } from '../navigation/constants';

import {
  checkForCustomerInvoiceError,
  checkForSupplierInvoiceError,
  checkForSupplierRequisitionError,
  checkForStocktakeError,
  checkForCustomerRequisitionError,
} from '../utilities';

export { FirstUsePage } from './FirstUsePage';

export const FINALISABLE_PAGES = {
  [ROUTES.SUPPLIER_INVOICE]: {
    checkForError: checkForSupplierInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_supplier_invoice',
  },
  [ROUTES.CUSTOMER_INVOICE]: {
    checkForError: checkForCustomerInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_customer_invoice',
  },
  [ROUTES.PRESCRIPTION]: {
    checkForError: checkForCustomerInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_customer_invoice',
  },
  [ROUTES.CUSTOMER_REQUISITION]: {
    checkForError: checkForCustomerRequisitionError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_customer_requisition',
  },
  [ROUTES.STOCKTAKE_EDITOR]: {
    checkForError: checkForStocktakeError,
    recordType: 'Stocktake',
    recordToFinaliseKey: 'stocktake',
    finaliseText: 'finalise_stocktake',
  },
  [ROUTES.STOCKTAKE_EDITOR_WITH_REASONS]: {
    checkForError: checkForStocktakeError,
    recordType: 'Stocktake',
    recordToFinaliseKey: 'stocktake',
    finaliseText: 'finalise_stocktake',
  },
  [ROUTES.SUPPLIER_REQUISITION]: {
    checkForError: checkForSupplierRequisitionError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_supplier_requisition',
  },
  [ROUTES.SUPPLIER_REQUISITION_WITH_PROGRAM]: {
    checkForError: checkForSupplierRequisitionError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_supplier_requisition',
  },
};
