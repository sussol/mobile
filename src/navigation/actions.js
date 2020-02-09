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
import { getCurrentRouteName } from './selectors';
import { ROUTES } from './constants';

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
 * Action creator which first creates a prescription, and then navigates to it
 * for editing.
 *
 * @param {Object} patient     The other party of the invoice (Customer)
 * @param {Object} currentUser    The currently logged in user.
 */
export const createPrescription = patientID => (dispatch, getState) => {
  const { user } = getState();
  const { currentUser } = user;

  const patient = UIDatabase.get('Name', patientID);

  let newPrescription;
  UIDatabase.write(() => {
    newPrescription = createRecord(
      UIDatabase,
      'CustomerInvoice',
      patient,
      currentUser,
      'dispensary'
    );
  });

  dispatch(gotoPrescription(newPrescription));
};

export const goToCashRegister = () =>
  NavigationActions.navigate({
    routeName: ROUTES.CASH_REGISTER,
    params: { title: navStrings.cash_register },
  });

export const gotoPrescription = prescription =>
  NavigationActions.navigate({
    routeName: ROUTES.PRESCRIPTION,
    params: {
      title: `${navStrings.prescription} ${prescription.serialNumber}`,
      transaction: prescription,
      patient: prescription.otherParty,
      pageObject: prescription,
    },
  });

export const gotoPrescriptions = () =>
  NavigationActions.navigate({
    routeName: ROUTES.PRESCRIPTIONS,
    params: { title: 'Prescriptions' },
  });

export const gotoDispensingPage = () => dispatch => {
  UIDatabase.write(() => {
    UIDatabase.delete(
      'Transaction',
      UIDatabase.objects('Prescription').filtered('status != $0', 'finalised')
    );
  });

  dispatch(
    NavigationActions.navigate({
      routeName: ROUTES.DISPENSARY,
      params: { title: navStrings.dispensary },
    })
  );
};

/**
 * Pushes the Settings page route onto the main navigation stack.
 */
export const gotoDashboard = () =>
  NavigationActions.navigate({
    routeName: ROUTES.DASHBOARD,
    params: { title: navStrings.dashboard },
  });

/**
 * Pushes the Settings page route onto the main navigation stack.
 */
export const gotoSettings = () =>
  NavigationActions.navigate({
    routeName: ROUTES.SETTINGS,
    params: {
      title: navStrings.settings,
    },
  });

/**
 * Pushes the Realm explorer route onto the main navigation stack.
 */
export const gotoRealmExplorer = () =>
  NavigationActions.navigate({
    routeName: ROUTES.REALM_EXPLORER,
    params: {
      title: navStrings.database_contents,
    },
  });

/**
 * Pushes the Customer Invoices route onto the main navigation stack.
 */
export const gotoCustomerInvoices = () => dispatch => {
  UIDatabase.write(() => {
    UIDatabase.delete(
      'Transaction',
      UIDatabase.objects('Prescription').filtered('status != $0', 'finalised')
    );
  });

  dispatch(
    NavigationActions.navigate({
      routeName: ROUTES.CUSTOMER_INVOICES,
      params: { title: navStrings.customer_invoices },
    })
  );
};

/**
 * Pushes the Customer Requisitions route onto the main navigation stack.
 */
export const gotoCustomerRequisitions = () =>
  NavigationActions.navigate({
    routeName: ROUTES.CUSTOMER_REQUISITIONS,
    params: {
      title: navStrings.customer_requisitions,
    },
  });

/**
 * Pushes the Supplier Invoices route onto the main navigation stack.
 */
export const gotoSupplierInvoices = () =>
  NavigationActions.navigate({
    routeName: ROUTES.SUPPLIER_INVOICES,
    params: {
      title: navStrings.supplier_invoices,
    },
  });

/**
 * Pushes the Supplier Requisitions route onto the main navigation stack.
 */
export const gotoSupplierRequisitions = () =>
  NavigationActions.navigate({
    routeName: ROUTES.SUPPLIER_REQUISITIONS,
    params: {
      title: navStrings.supplier_requisitions,
    },
  });

/**
 * Pushes the Stocktakes route onto the main navigation stack.
 */
export const gotoStocktakes = () =>
  NavigationActions.navigate({
    routeName: ROUTES.STOCKTAKES,
    params: {
      title: navStrings.stocktakes,
    },
  });

/**
 * Pushes the Stock route onto the main navigation stack.
 */
export const gotoStock = () =>
  NavigationActions.navigate({
    routeName: ROUTES.STOCK,
    params: {
      title: navStrings.current_stock,
    },
  });

/**
 * Action creator for navigating to the SupplierRequisition screen.
 *
 * @param {Object} requisition The requisition to pass to the next screen.
 */
export const gotoStocktakeManagePage = (stocktakeName, stocktake) => (dispatch, getState) => {
  const { nav } = getState();

  const currentRouteName = getCurrentRouteName(nav);

  const navigationActionCreator =
    currentRouteName === ROUTES.STOCKTAKES ? NavigationActions.navigate : StackActions.replace;

  const navigationParameters = {
    routeName: ROUTES.STOCKTAKE_MANAGER,
    params: {
      title: stocktake ? navStrings.manage_stocktake : navStrings.new_stocktake,
      stocktakeName,
      stocktake,
      pageObject: stocktake,
    },
  };

  dispatch(navigationActionCreator(navigationParameters));
};

/**
 * Navigate to the StocktakeEditPage.
 *
 * @param {Object} stocktake  The requisition to navigate to.
 */
export const gotoStocktakeEditPage = stocktake => (dispatch, getState) => {
  const { nav } = getState();
  const currentRouteName = getCurrentRouteName(nav);

  // If navigating from the stocktakesPage, go straight to the StocktakeEditPage. Otherwise,
  // replace the current page as the user is coming from StocktakeManagePage.
  const navigationActionCreator =
    currentRouteName === ROUTES.STOCKTAKES ? NavigationActions.navigate : StackActions.replace;

  const navigationParameters = {
    routeName: ROUTES.STOCKTAKE_EDITOR,
    params: { title: navStrings.stocktake, stocktake, pageObject: stocktake },
  };

  dispatch(navigationActionCreator(navigationParameters));
};

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
    routeName: ROUTES.CUSTOMER_INVOICE,
    params: {
      title: `${navStrings.invoice} ${transaction.serialNumber}`,
      transaction,
      pageObject: transaction,
    },
  });

  dispatch(navigationAction);
};

/**
 * Action creator for navigating to a SupplierInvoice. Ensures the SI is finalised, if
 * confirmed before navigating. This should not occur, but if this is not enforced, a
 * user can reduce the amount of stock in a SI which has been used in a CI, which causes
 * inventory adjustments instantly.
 *
 * @param {Object} transaction The SI to navigate to.
 * @param {Object} dispatch    Redux dispatch method.
 */
export const gotoSupplierInvoice = transaction => dispatch => {
  const { isConfirmed } = transaction;

  // Supplier invoices are `new` or `finalised`. Ensure any `confirmed` invoices are
  // `finalised` before navigating.
  if (isConfirmed) {
    UIDatabase.write(() => {
      transaction.finalise(UIDatabase);
      UIDatabase.save('Transaction', transaction);
    });
  }

  const navigationAction = NavigationActions.navigate({
    routeName: ROUTES.SUPPLIER_INVOICE,
    params: {
      title: `${navStrings.invoice} ${transaction.serialNumber}`,
      transaction,
      pageObject: transaction,
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
    routeName: ROUTES.SUPPLIER_REQUISITION,
    params: {
      title: `${navStrings.requisition} ${requisition.serialNumber}`,
      requisition,
      pageObject: requisition,
    },
  });

/**
 * Navigate to the CustomerRequisitionPage.
 *
 * @param {Object} requisition  Customer requisition to navigate to.
 */
export const gotoCustomerRequisition = requisition =>
  NavigationActions.navigate({
    routeName: ROUTES.CUSTOMER_REQUISITION,
    params: {
      title: `${navStrings.requisition} ${requisition.serialNumber}`,
      requisition,
      pageObject: requisition,
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
    ? Number(parsedCustomData.monthsLeadTime.data)
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

  // If creating a Stocktake with a program or with a list of itemIds, navigate to
  // the StocktakeEditPage. Otherwise, navigate to the StocktakeManagePage.
  return program || itemIds
    ? dispatch(gotoStocktakeEditPage(stocktake))
    : dispatch(gotoStocktakeManagePage(stocktakeName, stocktake));
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
 * Action creator which first creates a supplier invoice, and then navigates to it
 * for editing.
 *
 * @param {Object} otherParty     The other party of the invoice (Supplier)
 * @param {Object} currentUser    The currently logged in user.
 */
export const createSupplierInvoice = (otherParty, currentUser) => dispatch => {
  let newCustomerInvoice;
  UIDatabase.write(() => {
    newCustomerInvoice = createRecord(UIDatabase, 'SupplierInvoice', otherParty, currentUser);
  });

  dispatch(gotoSupplierInvoice(newCustomerInvoice));
};

/**
 * Updates a Stocktake with the passed array of itemIDs and navigates to a
 * StocktakeEditPage.
 *
 * @param {Object} stocktake realm Stocktake object
 * @param {Array}  itemIds   Array of item id strings that should be the new
 *                           Items in the stocktake.
 * @param {String} name   Name of the stocktake for updating. Cannot update to remove completely.
 */
export const updateStocktake = (stocktake, itemIds, name = '') => dispatch => {
  UIDatabase.write(() => {
    if (name) stocktake.name = name;

    stocktake.setItemsByID(UIDatabase, itemIds);
    UIDatabase.save('Stocktake', stocktake);
  });

  dispatch(gotoStocktakeEditPage(stocktake));
};
