/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import {
  CellActionsLookup,
  editCountedQuantityWithReason,
  editStocktakeBatchCountedQuantityWithReason,
} from './cellActions';
import { RowActionsLookup } from './rowActions';
import {
  TableActionsLookup,
  refreshDataWithFinalisedToggle,
  filterDataWithFinalisedToggle,
  filterDataWithOverStockToggle,
} from './tableActions';
import { PageActionsLookup } from './pageActions';

/**
 * Serves a page the actions it requires given it's routeName.
 *
 * Actions can be overriden if different behaviour is required for
 * a particular action in a given circumstance.
 *
 * I.E When reasons are defined, `editCountedQuantity` should be
 * replaced with the action `editCountedQuantityWithReason`.
 *
 */

/**
 * Standard base page actions.
 */
const BasePageActions = {
  ...CellActionsLookup,
  ...RowActionsLookup,
  ...TableActionsLookup,
  ...PageActionsLookup,
};

const stocktakeEditorWithReasons = {
  ...BasePageActions,
  editCountedQuantity: editCountedQuantityWithReason,
};

const stocktakeBatchEditModalWithReasons = {
  ...BasePageActions,
  editStocktakeBatchCountedQuantity: editStocktakeBatchCountedQuantityWithReason,
};

const stocktakes = {
  ...BasePageActions,
  refreshData: refreshDataWithFinalisedToggle,
  filterData: filterDataWithFinalisedToggle,
};

const customerInvoices = {
  ...BasePageActions,
  refreshData: refreshDataWithFinalisedToggle,
  filterData: filterDataWithFinalisedToggle,
};

const customerRequisitions = {
  ...BasePageActions,
  refreshData: refreshDataWithFinalisedToggle,
  filterData: filterDataWithFinalisedToggle,
};

const supplierInvoices = {
  ...BasePageActions,
  refreshData: refreshDataWithFinalisedToggle,
  filterData: filterDataWithFinalisedToggle,
};

const supplierRequisitions = {
  ...BasePageActions,
  refreshData: refreshDataWithFinalisedToggle,
  filterData: filterDataWithFinalisedToggle,
};

const supplierRequisitionWithProgram = {
  ...BasePageActions,
  filterData: filterDataWithOverStockToggle,
};

/**
 * If actions need to be overriden for a particular routeName,
 * adding them here will pass that new set of actions to the
 * screen when navigating.
 */
const NON_DEFAULT_PAGE_ACTIONS = {
  stocktakeEditorWithReasons,
  stocktakeBatchEditModalWithReasons,
  customerInvoices,
  customerRequisitions,
  supplierInvoices,
  supplierRequisitions,
  stocktakes,
  supplierRequisitionWithProgram,
};

/**
 * Fetches the actions object for a given route.
 *
 * @param {String} routeName Name of the route being navigated to.
 */
export const getPageActions = route => {
  const thisRoutesActions = NON_DEFAULT_PAGE_ACTIONS[route] || BasePageActions;

  const wrappedActions = {};

  Object.entries(thisRoutesActions).forEach(([key, value]) => {
    // if (typeof value() === 'function') {
    wrappedActions[key] = (...args) => value(...args, route);
    // } else {
    //   wrappedActions[key] = (...args) => {
    //     const action = value(...args);
    //     const { payload = {} } = action;
    //     return { ...action, payload: { ...payload, route } };
    //   };
    // }
  });

  return wrappedActions;
};
