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
  customer: CustomerPage,
  customerInvoice: CustomerInvoicePage,
  customerInvoices: CustomerInvoicesPage,
  customers: CustomersPage,
  firstUse: FirstUsePage,
  menu: MenuPage,
  realmExplorer: RealmExplorer,
  root: MenuPage,
  stock: StockPage,
  stockHistories: StockHistoriesPage,
  stockHistory: StockHistoryPage,
  stocktakeEditor: StocktakeEditPage,
  stocktakeManager: StocktakeManagePage,
  stocktakes: StocktakesPage,
  supplierInvoice: SupplierInvoicePage,
  supplierInvoices: SupplierInvoicesPage,
};
