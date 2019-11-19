/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../../database/index';
import { SETTINGS_KEYS } from '../../../settings';
import Settings from '../../../settings/MobileAppSettings';
import { createRecord } from '../../../database/utilities/index';
import { closeModal } from './pageActions';
import { ACTIONS } from './constants';
import { pageObjectSelector } from '../selectors';

/**
 * Sorts the underlying data array by the key provided. Determines
 * direction by the previous direction.
 *
 * @param {String} sortKey Key to sortKey - see utilities/sortData.js
 */
export const sortData = (sortKey, route) => ({
  type: ACTIONS.SORT_DATA,
  payload: { sortKey, route },
});

/**
 * Filters the underlying data array by the term provided.
 * Fields which should be used for filtering are set as
 * filterDataKeys in state. Sort order is preserved.
 *
 * @param {String} searchTerm String to filter by.
 */
export const filterData = (searchTerm, route) => ({
  type: ACTIONS.FILTER_DATA,
  payload: { searchTerm, route },
});

/**
 * Adds a record to the current stores `data`. Prepends the
 * added record.
 *
 * @param {Any} record A record to add to the current data.
 */
export const addRecord = (record, route) => ({
  type: ACTIONS.ADD_RECORD,
  payload: { record, route },
});

/**
 * Refreshes the underlying data array by slicing backingData.
 * BackingData is a live realm collection which side effects i.e.
 * finalising can make out of sync with the data array used for display.
 */
export const refreshData = route => ({ type: ACTIONS.REFRESH_DATA, payload: { route } });

/**
 * Hides all items which have current stock on hand greater than the
 * threshold MOS stock for that item.
 */
export const hideOverStocked = route => ({ type: ACTIONS.HIDE_OVER_STOCKED, payload: { route } });

/**
 * Shows all items, regardless of current stock on hand, toggles
 * showAll to true and removes the current search filtering. Sort is
 * kept stable.
 */
export const showOverStocked = route => refreshData(route);

/**
 * Shows all items, regardless of current stock on hand, toggles
 * showAll to true and removes the current search filtering. Sort is
 * kept stable.
 */
export const showStockOut = route => refreshData(route);

/**
 * Wrapper around showFinalised/showNotFinalised to toggle between. Determines the
 * correct action to dispatch.
 *
 * @param {Bool} showFinalised Indicator wheter finalised rows are currently displayed.
 */
export const toggleShowFinalised = route => ({
  type: ACTIONS.TOGGLE_SHOW_FINALISED,
  payload: { route },
});

/**
 * Wrapper around hideStockout and showStockout. Determines which
 * should be dispatched.
 * @param {Bool} showAll Indicator whether all rows are currently showing.
 */
export const toggleStockOut = route => ({
  type: ACTIONS.TOGGLE_STOCK_OUT,
  payload: { route },
});

/**
 * Adds all items from master lists, according to the type of pageObject.
 * i.e. a CustomerInvoice adds items from all of the custoemrs masterlists.
 * where as a Supplier Requisition adds items from all of this stores
 * masterlists.
 *
 * @param {String} objectType Type of object to add items for.
 */
export const addMasterListItems = (objectType, route) => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  const thisStore = UIDatabase.objects('Name').filtered(
    'id == $0',
    Settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID)
  )[0];

  UIDatabase.write(() => {
    pageObject.addItemsFromMasterList(UIDatabase, thisStore);
    UIDatabase.save(objectType, pageObject);
  });

  dispatch(refreshData(route));
};

/**
 * Creates an 'item' record - i.e. StocktakeItem from an Item
 * object.
 * If the item is already a part of the underlying pageObject,
 * do not add it.
 *
 * use cases: Adding a row to an Item based page - i.e. Stocktake,
 * Requisition - NOT Batch based i.e. SupplierInvoice.
 *
 * @param {Object} item           The item to be added.
 * @param {String} addedItemType  The item type to be added.
 */
export const addItem = (item, addedItemType, route) => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  if (!pageObject.hasItem(item)) {
    UIDatabase.write(() => {
      const addedItem = createRecord(UIDatabase, addedItemType, pageObject, item);
      dispatch(addRecord(addedItem, route));
    });
  } else {
    dispatch(closeModal(route));
  }
};

/**
 * Creates a transaction batch which will be associated with the current stores
 * pageObject.
 * use case: Pages which are batch-based i.e. SupplierInvoice page.
 * @param {Object} item The item to create a transaction batch for.
 */
export const addTransactionBatch = (item, route) => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  UIDatabase.write(() => {
    const transItem = createRecord(UIDatabase, 'TransactionItem', pageObject, item);
    const itemBatch = createRecord(UIDatabase, 'ItemBatch', item, '');
    const addedBatch = createRecord(UIDatabase, 'TransactionBatch', transItem, itemBatch);
    dispatch(addRecord(addedBatch, route));
  });
};

/**
 * Creates a stocktake batch and ItemBatch associated with the stores
 * pageObject - assumed to be a StocktakeItem.
 *
 * use case: StocktakeEditBatchModal adding empty batches.
 */
export const addStocktakeBatch = route => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  UIDatabase.write(() => {
    const addedBatch = pageObject.createNewBatch(UIDatabase);
    dispatch(addRecord(addedBatch, route));
  });
};

/**
 * Creates an automatic order for a Supplier Requisition.
 */
export const createAutomaticOrder = route => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  const thisStore = UIDatabase.objects('Name').filtered(
    'id == $0',
    Settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID)
  )[0];

  UIDatabase.write(() => {
    pageObject.createAutomaticOrder(UIDatabase, thisStore);
    UIDatabase.save('Requisition', pageObject);
  });

  dispatch(refreshData(route));
};

/**
 * Sets all requested quantities to the suggested quantity for
 * a requisition.
 */
export const setRequestedToSuggested = route => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  UIDatabase.write(() => {
    pageObject.setRequestedToSuggested(UIDatabase);
  });

  dispatch(refreshData(route));
};

/**
 * Sets all rows `suppliedQuantity` to `requestedQuantity`.
 */
export const setSuppliedToRequested = route => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  UIDatabase.write(() => {
    pageObject.setSuppliedToRequested();
  });

  dispatch(refreshData(route));
};

/**
 * Sets all rows `suppliedQuantity` to `suggestedQuantity`.
 */
export const setSuppliedToSuggested = route => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  UIDatabase.write(() => {
    pageObject.setSuppliedToSuggested();
  });

  dispatch(refreshData(route));
};

export const refreshDataWithFinalisedToggle = route => ({
  type: ACTIONS.REFRESH_DATA_WITH_FINALISED_TOGGLE,
  payload: { route },
});

export const filterDataWithFinalisedToggle = (searchTerm, route) => ({
  type: ACTIONS.FILTER_DATA_WITH_FINALISED_TOGGLE,
  payload: { searchTerm, route },
});

export const filterDataWithOverStockToggle = (searchTerm, route) => ({
  type: ACTIONS.FILTER_DATA_WITH_OVER_STOCK_TOGGLE,
  payload: { searchTerm, route },
});

export const TableActionsLookup = {
  sortData,
  filterData,
  refreshData,
  hideOverStocked,
  toggleShowFinalised,
  showOverStocked,
  showStockOut,
  toggleStockOut,
  addMasterListItems,
  addItem,
  addTransactionBatch,
  createAutomaticOrder,
  setRequestedToSuggested,
  setSuppliedToRequested,
  setSuppliedToSuggested,
  addStocktakeBatch,
  refreshDataWithFinalisedToggle,
  filterDataWithFinalisedToggle,
  filterDataWithOverStockToggle,
};
