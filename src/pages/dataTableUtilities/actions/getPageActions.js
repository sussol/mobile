/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { CellActionsLookup, editStocktakeBatchCountedQuantityWithReason } from './cellActions';
import { RowActionsLookup } from './rowActions';
import { TableActionsLookup } from './tableActions';
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
export const BasePageActions = {
  ...CellActionsLookup,
  ...RowActionsLookup,
  ...TableActionsLookup,
  ...PageActionsLookup,
};

const stocktakeBatchEditModalWithReasons = {
  ...BasePageActions,
  editStocktakeBatchCountedQuantity: editStocktakeBatchCountedQuantityWithReason,
};

/**
 * If actions need to be overriden for a particular routeName,
 * adding them here will pass that new set of actions to the
 * screen when navigating.
 */
const NON_DEFAULT_PAGE_ACTIONS = {
  stocktakeBatchEditModalWithReasons,
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
    wrappedActions[key] = (...args) => value(...args, route);
  });

  return wrappedActions;
};
