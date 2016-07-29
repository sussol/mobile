import { CustomerPage } from './CustomerPage';
import { CustomersPage } from './CustomersPage';
import { CustomerInvoicePage,
         checkForFinaliseError as checkForCustomerInvoiceFinaliseError,
       } from './CustomerInvoicePage';
import { CustomerInvoicesPage } from './CustomerInvoicesPage';
import { FirstUsePage } from './FirstUsePage';
import { MenuPage } from './MenuPage';
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
  customer: CustomerPage,
  customerInvoice: CustomerInvoicePage,
  customerInvoices: CustomerInvoicesPage,
  customers: CustomersPage,
  firstUse: FirstUsePage,
  menu: MenuPage,
  realmExplorer: RealmExplorer,
  root: MenuPage,
  stock: StockPage,
  requisitions: RequisitionsPage,
  requisition: RequisitionPage,
  stocktakeEditor: StocktakeEditPage,
  stocktakeManager: StocktakeManagePage,
  stocktakes: StocktakesPage,
  supplierInvoice: SupplierInvoicePage,
  supplierInvoices: SupplierInvoicesPage,
};

export const FINALISABLE_PAGES = {
  supplierInvoice: {
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'Finalise will adjust inventory and lock this invoice permanently.',
  },
  customerInvoice: {
    checkForError: checkForCustomerInvoiceFinaliseError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'Finalise will lock this invoice permanently.',
  },
  requisition: {
    checkForError: checkForRequisitionFinaliseError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'Finalise will send this requisition and lock it permanently.',
  },
  stocktakeEditor: {
    checkForError: checkForStocktakeFinaliseError,
    recordType: 'Stocktake',
    recordToFinaliseKey: 'stocktake',
    finaliseText: 'Finalise will adjust inventory and lock this stocktake permanently.',
  },
};
