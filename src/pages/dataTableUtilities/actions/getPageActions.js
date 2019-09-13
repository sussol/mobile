/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { CellActionsLookup, editCountedQuantityWithReason } from './cellActions';
import { RowActionsLookup } from './rowActions';
import { TableActionsLookup } from './tableActions';
import { PageActionsLookup } from './pageActions';
import { UIDatabase } from '../../../database/index';

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

/**
 * Actions for `stocktakeEditPage` when reasons are defined.
 */
export const stocktakeEditorWithReasons = {
  ...BasePageActions,
  editCountedQuantity: editCountedQuantityWithReason,
};

export const PAGE_ACTIONS = {
  BasePageActions,
  stocktakeEditorWithReasons,
};

/**
 * Fetches the actions object for a given route.
 *
 * @param {String} routeName Name of the route being navigated to.
 */
export const getPageActions = routeName => {
  switch (routeName) {
    case 'stocktakeEditor': {
      const usesReasons = UIDatabase.objects('StocktakeReasons').length > 0;
      return usesReasons ? PAGE_ACTIONS.stocktakeEditorWithReasons : PAGE_ACTIONS.BasePageActions;
    }

    default: {
      return PAGE_ACTIONS.BasePageActions;
    }
  }
};
