/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { ROUTES } from './constants';
import { navStrings } from '../localization';

export const SCREEN_TITLES = {
  [ROUTES.REALM_EXPLORER]: () => navStrings.realm_explorer,
  [ROUTES.CUSTOMER_REQUISITIONS]: () => navStrings.customer_requisitions,
  [ROUTES.SUPPLIER_REQUISITIONS]: () => navStrings.supplier_requisitions,
  [ROUTES.CUSTOMER_INVOICES]: () => navStrings.customer_invoices,
  [ROUTES.SUPPLIER_INVOICES]: () => navStrings.supplier_invoices,
  [ROUTES.STOCK]: () => navStrings.current_stock,
  [ROUTES.STOCKTAKES]: () => navStrings.stocktakes,
  [ROUTES.DISPENSARY]: () => navStrings.dispensary,
  [ROUTES.CASH_REGISTER]: () => navStrings.cash_register,
  [ROUTES.SETTINGS]: () => navStrings.settings,
  [ROUTES.DASHBOARD]: () => navStrings.dashboard,
  [ROUTES.MENU]: () => '',
  [ROUTES.CUSTOMER_REQUISITION]: ({ serialNumber } = {}) =>
    `${navStrings.requisition} ${serialNumber}`,
  [ROUTES.SUPPLIER_REQUISITION]: ({ serialNumber } = {}) =>
    `${navStrings.requisition} ${serialNumber}`,
  [ROUTES.CUSTOMER_INVOICE]: ({ serialNumber } = {}) => `${navStrings.invoice} ${serialNumber}`,
  [ROUTES.SUPPLIER_INVOICE]: ({ serialNumber } = {}) => `${navStrings.invoice} ${serialNumber}`,
  [ROUTES.PRESCRIPTION]: ({ serialNumber } = {}) => `${navStrings.invoice} ${serialNumber}`,
};

export const getRouteTitle = (pageObject, routeName) => {
  if (!routeName) return '';
  if (!SCREEN_TITLES[routeName]) return '';

  return SCREEN_TITLES[routeName](pageObject);
};
