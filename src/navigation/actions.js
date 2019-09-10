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
 * - `routeName` (See: pages/index - PAGES - keys are routeNames )
 * - `params` (See: Pages/pageContainer and pages/index FINALISABLE_PAGES for requirements)
 *
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

export const addItemsToStocktake = (stocktake, itemIds) => dispatch => {
  UIDatabase.write(() => {
    stocktake.setItemsByID(UIDatabase, itemIds);
    UIDatabase.save('Stocktake', stocktake);
  });

  dispatch(gotoStocktakeEditPage(stocktake));
};

export const gotoStocktakeEditPage = stocktake =>
  NavigationActions.navigate({
    routeName: 'stocktakeEditor',
    params: {
      title: navStrings.stocktake,
      stocktake,
    },
  });

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

  // CustomDataa is a stringified JSON object.
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
