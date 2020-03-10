/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { RootNavigator } from './RootNavigator';
import { goBack } from './actions';
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
  [ROUTES.STOCKTAKE_EDITOR]: ({ serialNumber } = {}) => `${navStrings.stocktake} ${serialNumber}`,
  [ROUTES.STOCKTAKE_MANAGER]: () => navStrings.manage_stocktake,
  [ROUTES.PRESCRIPTION]: ({ serialNumber } = {}) => `${navStrings.invoice} ${serialNumber}`,
};

export const getRouteTitle = (pageObject, routeName) => {
  if (!routeName) return '';
  if (!SCREEN_TITLES[routeName]) return '';

  return SCREEN_TITLES[routeName](pageObject);
};

/**
 * Simple hardware backhandler which dispatches a goBack action on a
 * provided store.
 */
export const backHandler = store => () => store.dispatch(goBack());

/**
 * Simple middleware which intercepts navigation actions and calls a function
 * on the apps root navigator to force navigation.
 *
 * Note: This was added when transitioning from react-navigation v4, where
 * navigation was handled through redux - to v5 where the previous integration
 * method was not possible.
 *
 */
export const navigationMiddleware = () => next => action => {
  const { type } = action;

  if (type === 'Navigation/NAVIGATE') {
    const { routeName, params } = action;
    RootNavigator.navigate(routeName, params);
  }
  if (type === 'Navigation/REPLACE') {
    const { routeName, params } = action;
    RootNavigator.replace(routeName, params);
  }

  if (type === 'Navigation/BACK') {
    RootNavigator.goBack();
  }

  next(action);
};
