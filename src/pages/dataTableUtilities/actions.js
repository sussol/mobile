/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { createRecord } from '../../database/utilities/index';

/**
 * Actions for use with a data table reducer
 */

export const editTotalQuantity = (value, rowKey, columnKey) => ({
  type: 'editTotalQuantity',
  value,
  rowKey,
  columnKey,
});

export const focusCell = (rowKey, columnKey) => ({
  type: 'focusCell',
  rowKey,
  columnKey,
});

export const focusNext = (rowKey, columnKey) => ({
  type: 'focusNextCell',
  rowKey,
  columnKey,
});

export const selectRow = rowKey => ({
  type: 'selectRow',
  rowKey,
});

export const deselectRow = rowKey => ({
  type: 'deselectRow',
  rowKey,
});

export const deselectAll = () => ({
  type: 'deselectAll',
});

export const sortData = (sortBy, isAscending) => ({
  type: 'sortData',
  sortBy,
  isAscending,
});

export const filterData = searchTerm => ({
  type: 'filterData',
  searchTerm,
});

export const openBasicModal = modalKey => ({
  type: 'openBasicModal',
  modalKey,
});

export const closeBasicModal = () => ({
  type: 'closeBasicModal',
});

export const addMasterListItems = objectType => (dispatch, state) => {
  const { pageObject, database } = state;

  database.write(() => {
    pageObject.addItemsFromMasterList(database);
    database.save(objectType, pageObject);
  });
  dispatch({ type: 'addMasterListItems', objectType });
};

export const addItem = (item, addedItemType) => (dispatch, state) => {
  const { database, pageObject } = state;
  let addedItem;

  database.write(() => {
    if (pageObject.hasItem(item)) return;
    addedItem = createRecord(database, addedItemType, pageObject, item);
  });

  if (addedItem) dispatch({ type: 'addItem', item: addedItem });
  else dispatch(closeBasicModal());
};

export const editTheirRef = (value, pageObjectType) => (dispatch, state) => {
  const { database, pageObject } = state;

  const { theirRef } = pageObject;

  if (theirRef !== value) {
    database.write(() => {
      database.update(pageObjectType, {
        ...pageObject,
        theirRef: value,
      });
    });
  }

  dispatch(closeBasicModal());
};

export const editComment = (value, pageObjectType) => (dispatch, state) => {
  const { database, pageObject } = state;
  const { comment } = pageObject;

  if (comment !== value) {
    database.write(() => {
      database.update(pageObjectType, {
        ...pageObject,
        comment: value,
      });
    });
  }

  dispatch(closeBasicModal());
};

export const deleteItemsById = pageObjectType => (dispatch, state) => {
  const { dataState, database, pageObject } = state;

  const itemsIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  database.write(() => {
    pageObject.removeItemsById(database, itemsIds);
    database.save(pageObjectType, pageObject);
  });

  dispatch({ type: 'deleteItemsById' });
};

export const refreshData = () => ({
  type: 'refreshData',
});
