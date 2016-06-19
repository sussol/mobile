import { CustomerPage } from './CustomerPage';
import { CustomersPage } from './CustomersPage';
import { CustomerInvoicePage } from './CustomerInvoicePage';
import { CustomerInvoicesPage } from './CustomerInvoicesPage';
import { FirstUsePage } from './FirstUsePage';
import { MenuPage } from './MenuPage';
import { StockHistoriesPage } from './StockHistoriesPage';
import { StockHistoryPage } from './StockHistoryPage';
import { StockPage } from './StockPage';
import { StocktakeEditPage } from './StocktakeEditPage';
import { StocktakeManagePage } from './StocktakeManagePage';
import { StocktakesPage } from './StocktakesPage';
import { SupplierInvoicePage } from './SupplierInvoicePage';
import { SupplierInvoicesPage } from './SupplierInvoicesPage';
import { RealmExplorer } from './RealmExplorer';

export const PAGES = {
  root: MenuPage,
  menu: MenuPage,
  customers: CustomersPage,
  customer: CustomerPage,
  firstUse: FirstUsePage,
  stock: StockPage,
  stocktakes: StocktakesPage,
  stocktakeEditor: StocktakeEditPage,
  stocktakeManager: StocktakeManagePage,
  customerInvoices: CustomerInvoicesPage,
  customerInvoice: CustomerInvoicePage,
  supplierInvoices: SupplierInvoicesPage,
  supplierInvoice: SupplierInvoicePage,
  stockHistories: StockHistoriesPage,
  stockHistory: StockHistoryPage,
  realmExplorer: RealmExplorer,
};

export const PAGES_WITH_FINALISE = [
  'stocktakeEditor',
  'customerInvoice',
  'supplierInvoice',
  'stockHistory',
];
