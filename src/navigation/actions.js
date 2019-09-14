/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { NavigationActions, StackActions } from 'react-navigation';
import { UIDatabase } from '../database';
import Settings from '../settings/MobileAppSettings';
import { createRecord } from '../database/utilities/index';
import { navStrings } from '../localization/index';
import { SETTINGS_KEYS } from '../settings/index';

/**
 * Navigation Action Creators.
 *
 * This file contains actions related to navigation which can be dispatched
 * to the redux store.
 *
 * Actions should return either a plain object or a thunk for side effects.
 *
 * NavigationActions are consists of action creators supplied by react-navigation.
 *
 * NavigationActions.navigate() - accepts an object as the payload, which should
 * have the fields:
 *
 * - `routeName` (See: pages/index - PAGES - keys are routeNames)
 * - `params` (See: Pages/pageContainer and pages/index FINALISABLE_PAGES for requirements)
 *
 */

/**
 * Action creator for navigating to the SupplierRequisition screen.
 *
 * @param {Object} requisition The requisition to pass to the next screen.
 */
export const gotoStocktakeManagePage = ({ stocktake, stocktakeName }) =>
  NavigationActions.navigate({
    routeName: 'stocktakeManager',
    params: {
      title: stocktake ? stocktakeName : navStrings.new_stocktake,
      stocktakeName,
      stocktake,
    },
  });

/**
 * Navigate to the StocktakeEditPage.
 *
 * @param {Object} stocktake  The requisition to navigate to.
 */
export const gotoStocktakeEditPage = stocktake =>
  NavigationActions.navigate({
    routeName: 'stocktakeEditor',
    params: {
      title: navStrings.stocktake,
      stocktake,
    },
  });

/**
 * Action creator for navigating to a customer invoice. Ensures the CI is at least
 * confirmed before navigating as if this is not enforced, it is possible for
 * a particular item being issued across multiple invoices in larger quantities
 * than are available.
 *
 * @param {Object} transaction The CI to navigate to.
 * @param {Object} dispatch    Redux dispatch method.
 */
export const gotoCustomerInvoice = transaction => dispatch => {
  const { isConfirmed, isFinalised } = transaction;

  // Customer invoices are generally created with the status confirmed. This handles unexpected
  // cases of an incoming sycned invoice with status 'nw' or 'sg'.
  if (!isConfirmed && !isFinalised) {
    UIDatabase.write(() => {
      transaction.confirm(UIDatabase);
      UIDatabase.save('Transaction', transaction);
    });
  }

  const navigationAction = NavigationActions.navigate({
    routeName: 'customerInvoice',
    params: {
      title: `${navStrings.invoice} ${transaction.serialNumber}`,
      transaction,
    },
  });

  dispatch(navigationAction);
};

/**
 * Navigate to the SupplierRequisitionPage.
 *
 * @param {Object} requisition  SupplierRequisition to navigate to.
 */
export const gotoSupplierRequisition = requisition =>
  NavigationActions.navigate({
    routeName: !requisition.program ? 'supplierRequisition' : 'programSupplierRequisition',
    params: {
      title: `${navStrings.requisition} ${requisition.serialNumber}`,
      requisition,
    },
  });

/**
 * Action creator for creating, and navigating to a Supplier Requsition.
 * Requisition is created by a thunk initially.
 *
 * @param {String} CurrentUser The currently logged in user.
 * @param {Object} requisitionParameters Parameters for the to-be-created object.
 * RequisitionParameters can be any fields in Requisition.js to pass to createRecord.
 */
export const createSupplierRequisition = ({
  currentUser,
  ...requisitionParameters
}) => dispatch => {
  // Fetch this stores custom data to find if this store has customized
  // monthsLeadTime.
  const customData = Settings.get(SETTINGS_KEYS.THIS_STORE_CUSTOM_DATA);

  // CustomData is a stringified JSON object.
  const parsedCustomData = customData ? JSON.parse(customData) : '';

  // Months lead time has an effect on daysToSupply for a requisition.
  const monthsLeadTime = parsedCustomData.monthsLeadTime
    ? Number(customData.monthsLeadTime.data)
    : 0;

  // Create the requisition. If a program was supplied, add items from that
  // program, otherwise just navigate to it.
  let requisition;
  UIDatabase.write(() => {
    requisition = createRecord(UIDatabase, 'Requisition', currentUser, {
      ...requisitionParameters,
      monthsLeadTime,
    });

    if (requisition.program) requisition.addItemsFromProgram(UIDatabase);
  });

  dispatch(gotoSupplierRequisition(requisition));
};

/**
 * Creates a stocktake and replaces the current route in the StackNavigator which
 * would be a StocktakeManagePage, with a StocktakeEditPage, with the newly
 * created Stocktake.
 *
 * @param {Object} StocktakeParameters  Parameters for the stocktake to create.
 */
export const createStocktake = ({ currentUser, stocktakeName, program, itemIds }) => dispatch => {
  let stocktake;

  UIDatabase.write(() => {
    stocktake = createRecord(UIDatabase, 'Stocktake', currentUser, stocktakeName, program);
    if (program) stocktake.addItemsFromProgram(UIDatabase);
    else if (itemIds) stocktake.setItemsByID(UIDatabase, itemIds);
  });

  const replaceAction = StackActions.replace({
    routeName: 'stocktakeEditor',
    params: { stocktake, title: navStrings.stocktake },
  });

  dispatch(replaceAction);
};

/**
 * Action creator which first creates a customer invoice, and then navigates to it
 * for editing.
 *
 * @param {Object} otherParty     The other party of the invoice (Customer)
 * @param {Object} currentUser    The currently logged in user.
 */
export const createCustomerInvoice = (otherParty, currentUser) => dispatch => {
  let newCustomerInvoice;
  UIDatabase.write(() => {
    newCustomerInvoice = createRecord(UIDatabase, 'CustomerInvoice', otherParty, currentUser);
  });

  dispatch(gotoCustomerInvoice(newCustomerInvoice));
};

/**
 * Updates a Stocktake with the passed array of itemIDs and navigates to a
 * StocktakeEditPage.
 *
 * @param {Object} stocktake realm Stocktake object
 * @param {Array}  itemIds   Array of item id strings that should be the new
 *                           Items in the stocktake.
 */
export const updateStocktake = (stocktake, itemIds) => dispatch => {
  UIDatabase.write(() => {
    stocktake.setItemsByID(UIDatabase, itemIds);
    UIDatabase.save('Stocktake', stocktake);
  });

  dispatch(gotoStocktakeEditPage(stocktake));
};
