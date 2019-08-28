/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { UIDatabase, createRecord } from '../../database';
import { parsePositiveInteger } from '../../utilities';

/**
 * Actions for use with a data table reducer
 */

export const editTotalQuantity = (value, rowKey, columnKey) => (dispatch, state) => {
  const { data, keyExtractor } = state;

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.setTotalQuantity(UIDatabase, parsePositiveInteger(Number(value)));
    UIDatabase.save('TransactionItem', objectToEdit);
  });

  dispatch({
    type: 'editTotalQuantity',
    value,
    rowKey,
    columnKey,
  });
};

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
  const { pageObject } = state;

  UIDatabase.write(() => {
    pageObject.addItemsFromMasterList(UIDatabase);
    UIDatabase.save(objectType, pageObject);
  });
  dispatch({ type: 'addMasterListItems', objectType });
};

export const addItem = (item, addedItemType) => (dispatch, state) => {
  const { pageObject } = state;
  let addedItem;

  UIDatabase.write(() => {
    if (pageObject.hasItem(item)) return;
    addedItem = createRecord(UIDatabase, addedItemType, pageObject, item);
  });

  if (addedItem) dispatch({ type: 'addItem', item: addedItem });
  else dispatch(closeBasicModal());
};

export const editTheirRef = (value, pageObjectType) => (dispatch, state) => {
  const { pageObject } = state;

  const { theirRef } = pageObject;

  if (theirRef !== value) {
    UIDatabase.write(() => {
      UIDatabase.update(pageObjectType, {
        ...pageObject,
        theirRef: value,
      });
    });
  }

  dispatch(closeBasicModal());
};

export const editComment = (value, pageObjectType) => (dispatch, state) => {
  const { pageObject } = state;
  const { comment } = pageObject;

  if (comment !== value) {
    UIDatabase.write(() => {
      UIDatabase.update(pageObjectType, {
        ...pageObject,
        comment: value,
      });
    });
  }

  dispatch(closeBasicModal());
};

export const deleteItemsById = pageObjectType => (dispatch, state) => {
  const { dataState, pageObject } = state;

  const itemsIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  UIDatabase.write(() => {
    pageObject.removeItemsById(UIDatabase, itemsIds);
    UIDatabase.save(pageObjectType, pageObject);
  });

  dispatch({ type: 'deleteItemsById' });
};

export const refreshData = () => ({
  type: 'refreshData',
});
