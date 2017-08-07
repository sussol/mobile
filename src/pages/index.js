/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

import { CustomerPage } from './CustomerPage';
import { CustomersPage } from './CustomersPage';
import { CustomerInvoicePage,
         checkForFinaliseError as checkForCustomerInvoiceFinaliseError,
       } from './CustomerInvoicePage';
import { CustomerInvoicesPage } from './CustomerInvoicesPage';
import { MenuPage } from './MenuPage';
import { PageContainer } from './PageContainer';
import { RequisitionsPage } from './RequisitionsPage';
import { RequisitionPage,
         checkForFinaliseError as checkForRequisitionFinaliseError,
       } from './RequisitionPage';
import { SupplyRequisitionPage } from './SupplyRequisitionPage'; // TODO finalise checking
import { StockPage } from './StockPage';
import { StocktakeEditPage,
         checkForFinaliseError as checkForStocktakeFinaliseError,
       } from './StocktakeEditPage';
import { StocktakeManagePage } from './StocktakeManagePage';
import { StocktakesPage } from './StocktakesPage';
import { SupplierInvoicePage } from './SupplierInvoicePage';
import { SupplierInvoicesPage } from './SupplierInvoicesPage';
import { RealmExplorer } from './RealmExplorer';
import { ExternalSupplierInvoicePage,
         checkForFinaliseError as checkForExternalSupplierInvoiceError,
       } from './ExternalSupplierInvoicePage';
export { FirstUsePage } from './FirstUsePage';

export const PAGES = {
  customer: (props) => <PageContainer page={CustomerPage} {...props} />,
  customerInvoice: (props) => <PageContainer page={CustomerInvoicePage} {...props} />,
  customerInvoices: (props) => <PageContainer page={CustomerInvoicesPage} {...props} />,
  customers: (props) => <PageContainer page={CustomersPage} {...props} />,
  menu: (props) => <PageContainer page={MenuPage} {...props} />,
  realmExplorer: (props) => <PageContainer page={RealmExplorer} {...props} />,
  root: (props) => <PageContainer page={MenuPage} {...props} />,
  stock: (props) => <PageContainer page={StockPage} {...props} />,
  requisitions: (props) => <PageContainer page={RequisitionsPage} {...props} />,
  requisition: (props) => <PageContainer page={RequisitionPage} {...props} />,
  supplyRequisition: (props) => <PageContainer page={SupplyRequisitionPage} {...props} />,
  stocktakeEditor: (props) => <PageContainer page={StocktakeEditPage} {...props} />,
  stocktakeManager: (props) => <PageContainer page={StocktakeManagePage} {...props} />,
  stocktakes: (props) => <PageContainer page={StocktakesPage} {...props} />,
  supplierInvoice: (props) => <PageContainer page={SupplierInvoicePage} {...props} />,
  supplierInvoices: (props) => <PageContainer page={SupplierInvoicesPage} {...props} />,
  externalSupplierInvoice: (props) => <PageContainer page={ExternalSupplierInvoicePage} {...props} />,
};

export const FINALISABLE_PAGES = {
  supplierInvoice: {
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_supplier_invoice',
  },
  externalSupplierInvoice: {
    checkForError: checkForExternalSupplierInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_supplier_invoice',
  },
  customerInvoice: {
    checkForError: checkForCustomerInvoiceFinaliseError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_customer_invoice',
  },
  requisition: {
    checkForError: checkForRequisitionFinaliseError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_requisition',
  },
  stocktakeEditor: {
    checkForError: checkForStocktakeFinaliseError,
    recordType: 'Stocktake',
    recordToFinaliseKey: 'stocktake',
    finaliseText: 'finalise_stocktake',
  },
};
