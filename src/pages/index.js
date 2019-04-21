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

import { VaccineModulePage } from './VaccineModulePage';

import { RealmExplorer } from './RealmExplorer';

export { FirstUsePage } from './FirstUsePage';

export const PAGES = {
  customerInvoice: props => <PageContainer page={CustomerInvoicePage} {...props} />,
  customerInvoices: props => <PageContainer page={CustomerInvoicesPage} {...props} />,
  customerRequisition: props => <PageContainer page={CustomerRequisitionPage} {...props} />,
  customerRequisitions: props => <PageContainer page={CustomerRequisitionsPage} {...props} />,
  menu: props => <PageContainer page={MenuPage} {...props} />,
  realmExplorer: props => <PageContainer page={RealmExplorer} {...props} />,
  root: props => <PageContainer page={MenuPage} {...props} />,
  stock: props => <PageContainer page={StockPage} {...props} />,
  stocktakeEditor: props => <PageContainer page={StocktakeEditPage} {...props} />,
  stocktakeManager: props => <PageContainer page={StocktakeManagePage} {...props} />,
  stocktakes: props => <PageContainer page={StocktakesPage} {...props} />,
  supplierInvoice: props => <PageContainer page={SupplierInvoicePage} {...props} />,
  supplierInvoices: props => <PageContainer page={SupplierInvoicesPage} {...props} />,
  supplierRequisition: props => <PageContainer page={SupplierRequisitionPage} {...props} />,
  supplierRequisitions: props => <PageContainer page={SupplierRequisitionsPage} {...props} />,
  vaccineModule: props => <PageContainer page={VaccineModulePage} {...props} />,
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
