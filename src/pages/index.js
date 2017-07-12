/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { CustomerPage } from './CustomerPage';
import { CustomersPage } from './CustomersPage';
import { CustomerInvoicePage,
         checkForFinaliseError as checkForCustomerInvoiceFinaliseError,
       } from './CustomerInvoicePage';
import { CustomerInvoicesPage } from './CustomerInvoicesPage';
import { FirstUsePage } from './FirstUsePage';
import { MenuPage } from './MenuPage';
import { wrapInPageContainer } from './PageContainer';
import { RequisitionsPage } from './RequisitionsPage';
import { RequisitionPage,
         checkForFinaliseError as checkForRequisitionFinaliseError,
       } from './RequisitionPage';
import { StockPage } from './StockPage';
import { StocktakeEditPage,
         checkForFinaliseError as checkForStocktakeFinaliseError,
       } from './StocktakeEditPage';
import { StocktakeManagePage } from './StocktakeManagePage';
import { StocktakesPage } from './StocktakesPage';
import { SupplierInvoicePage } from './SupplierInvoicePage';
import { SupplierInvoicesPage } from './SupplierInvoicesPage';
import { RealmExplorer } from './RealmExplorer';

export const PAGES = {
  customer: (props) => wrapInPageContainer(CustomerPage, props),
  customerInvoice: (props) => wrapInPageContainer(CustomerInvoicePage, props),
  customerInvoices: (props) => wrapInPageContainer(CustomerInvoicesPage, props),
  customers: (props) => wrapInPageContainer(CustomersPage, props),
  firstUse: (props) => wrapInPageContainer(FirstUsePage, props),
  menu: (props) => wrapInPageContainer(MenuPage, props),
  realmExplorer: (props) => wrapInPageContainer(RealmExplorer, props),
  root: (props) => wrapInPageContainer(MenuPage, props),
  stock: (props) => wrapInPageContainer(StockPage, props),
  requisitions: (props) => wrapInPageContainer(RequisitionsPage, props),
  requisition: (props) => wrapInPageContainer(RequisitionPage, props),
  stocktakeEditor: (props) => wrapInPageContainer(StocktakeEditPage, props),
  stocktakeManager: (props) => wrapInPageContainer(StocktakeManagePage, props),
  stocktakes: (props) => wrapInPageContainer(StocktakesPage, props),
  supplierInvoice: (props) => wrapInPageContainer(SupplierInvoicePage, props),
  supplierInvoices: (props) => wrapInPageContainer(SupplierInvoicesPage, props),
};

export const FINALISABLE_PAGES = {
  supplierInvoice: {
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
