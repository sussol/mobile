/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

import { CustomerInvoicePage } from './customer/CustomerInvoicePage';
import { CustomerInvoicesPage } from './customer/CustomerInvoicesPage';
import { MenuPage } from './MenuPage';
import { PageContainer } from './PageContainer';
import { CustomerRequisitionsPage } from './customer/CustomerRequisitionsPage';
import { CustomerRequisitionPage,
         checkForFinaliseError as checkForCustomerRequisitionFinaliseError,
       } from './customer/CustomerRequisitionPage';
import { StockPage } from './management/StockPage';
import { StocktakeEditPage,
         checkForFinaliseError as checkForStocktakeFinaliseError,
       } from './management/StocktakeEditPage';
import { StocktakeManagePage } from './management/StocktakeManagePage';
import { StocktakesPage } from './management/StocktakesPage';
import { SupplierInvoicePage,
         checkForFinaliseError as checkForSupplierInvoiceError,
        } from './supplier/SupplierInvoicePage';
import { SupplierInvoicesPage } from './supplier/SupplierInvoicesPage';
import { SupplierRequisitionsPage } from './supplier/SupplierRequisitionsPage';
import { SupplierRequisitionPage,
         checkForFinaliseError as checkForSupplierRequisitionFinaliseError,
       } from './supplier/SupplierRequisitionPage';
import { RealmExplorer } from './RealmExplorer';
export { FirstUsePage } from './FirstUsePage';

export const PAGES = {
  customerInvoice: (props) => <PageContainer page={CustomerInvoicePage} {...props} />,
  customerInvoices: (props) => <PageContainer page={CustomerInvoicesPage} {...props} />,
  customerRequisition: (props) => <PageContainer page={CustomerRequisitionPage} {...props} />,
  customerRequisitions: (props) => <PageContainer page={CustomerRequisitionsPage} {...props} />,
  menu: (props) => <PageContainer page={MenuPage} {...props} />,
  realmExplorer: (props) => <PageContainer page={RealmExplorer} {...props} />,
  root: (props) => <PageContainer page={MenuPage} {...props} />,
  stock: (props) => <PageContainer page={StockPage} {...props} />,
  stocktakeEditor: (props) => <PageContainer page={StocktakeEditPage} {...props} />,
  stocktakeManager: (props) => <PageContainer page={StocktakeManagePage} {...props} />,
  stocktakes: (props) => <PageContainer page={StocktakesPage} {...props} />,
  supplierInvoice: (props) => <PageContainer page={SupplierInvoicePage} {...props} />,
  supplierInvoices: (props) => <PageContainer page={SupplierInvoicesPage} {...props} />,
  supplierRequisition: (props) => <PageContainer page={SupplierRequisitionPage} {...props} />,
  supplierRequisitions: (props) => <PageContainer page={SupplierRequisitionsPage} {...props} />,
};

export const FINALISABLE_PAGES = {
  supplierInvoice: {
    checkForError: checkForSupplierInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_supplier_invoice',
  },
  customerInvoice: {
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
