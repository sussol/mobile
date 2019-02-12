/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import {
  CustomerInvoicePage,
  checkForFinaliseError as checkForCustomerInvoiceError,
} from './CustomerInvoicePage';
import { CustomerInvoicesPage } from './CustomerInvoicesPage';
import { MenuPage } from './MenuPage';
import { PageContainer } from './PageContainer';
import { CustomerRequisitionsPage } from './CustomerRequisitionsPage';
import {
  CustomerRequisitionPage,
  checkForFinaliseError as checkForCustomerRequisitionFinaliseError,
} from './CustomerRequisitionPage';
import { StockPage } from './StockPage';
import {
  StocktakeEditPage,
  checkForFinaliseError as checkForStocktakeFinaliseError,
} from './StocktakeEditPage';
import { StocktakeManagePage } from './StocktakeManagePage';
import { StocktakesPage } from './StocktakesPage';
import {
  SupplierInvoicePage,
  checkForFinaliseError as checkForSupplierInvoiceError,
} from './SupplierInvoicePage';
import { SupplierInvoicesPage } from './SupplierInvoicesPage';
import { SupplierRequisitionsPage } from './SupplierRequisitionsPage';
import {
  SupplierRequisitionPage,
  checkForFinaliseError as checkForSupplierRequisitionFinaliseError,
} from './SupplierRequisitionPage';
import { RealmExplorer } from './RealmExplorer';

export { FirstUsePage } from './FirstUsePage';

export const PAGES = {
  customerInvoice: props => {
    return <PageContainer page={CustomerInvoicePage} {...props} />;
  },
  customerInvoices: props => {
    return <PageContainer page={CustomerInvoicesPage} {...props} />;
  },
  customerRequisition: props => {
    return <PageContainer page={CustomerRequisitionPage} {...props} />;
  },
  customerRequisitions: props => {
    return <PageContainer page={CustomerRequisitionsPage} {...props} />;
  },
  menu: props => {
    return <PageContainer page={MenuPage} {...props} />;
  },
  realmExplorer: props => {
    return <PageContainer page={RealmExplorer} {...props} />;
  },
  root: props => {
    return <PageContainer page={MenuPage} {...props} />;
  },
  stock: props => {
    return <PageContainer page={StockPage} {...props} />;
  },
  stocktakeEditor: props => {
    return <PageContainer page={StocktakeEditPage} {...props} />;
  },
  stocktakeManager: props => {
    return <PageContainer page={StocktakeManagePage} {...props} />;
  },
  stocktakes: props => {
    return <PageContainer page={StocktakesPage} {...props} />;
  },
  supplierInvoice: props => {
    return <PageContainer page={SupplierInvoicePage} {...props} />;
  },
  supplierInvoices: props => {
    return <PageContainer page={SupplierInvoicesPage} {...props} />;
  },
  supplierRequisition: props => {
    return <PageContainer page={SupplierRequisitionPage} {...props} />;
  },
  supplierRequisitions: props => {
    return <PageContainer page={SupplierRequisitionsPage} {...props} />;
  },
};

export const FINALISABLE_PAGES = {
  supplierInvoice: {
    checkForError: checkForSupplierInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_supplier_invoice',
  },
  customerInvoice: {
    checkForError: checkForCustomerInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_customer_invoice',
  },
  customerRequisition: {
    checkForError: checkForCustomerRequisitionFinaliseError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_customer_requisition',
  },
  stocktakeEditor: {
    checkForError: checkForStocktakeFinaliseError,
    recordType: 'Stocktake',
    recordToFinaliseKey: 'stocktake',
    finaliseText: 'finalise_stocktake',
  },
  supplierRequisition: {
    checkForError: checkForSupplierRequisitionFinaliseError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_supplier_requisition',
  },
};
