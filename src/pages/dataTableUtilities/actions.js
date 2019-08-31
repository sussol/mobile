/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { UIDatabase, createRecord } from '../../database';
import { parsePositiveInteger } from '../../utilities';
import Settings from '../../settings/MobileAppSettings';
import { SETTINGS_KEYS } from '../../settings/index';

/**
 * Actions for use with a data table reducer
 */

export const editField = rowKey => ({ type: 'editField', rowKey });

export const editTotalQuantity = (value, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.setTotalQuantity(UIDatabase, parsePositiveInteger(value));
    UIDatabase.save('TransactionItem', objectToEdit);
  });

  dispatch(editField(rowKey));
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

export const addMasterListItems = objectType => (dispatch, getState) => {
  const { pageObject } = getState();

  const thisStore = UIDatabase.objects('Name').filtered(
    'id == $0',
    Settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID)
  )[0];

  UIDatabase.write(() => {
    pageObject.addItemsFromMasterList(UIDatabase, thisStore);
    UIDatabase.save(objectType, pageObject);
  });
  dispatch({ type: 'addMasterListItems', objectType });
};

export const addItem = (item, addedItemType) => (dispatch, getState) => {
  const { pageObject } = getState();
  let addedItem;

  UIDatabase.write(() => {
    if (pageObject.hasItem(item)) return;
    addedItem = createRecord(UIDatabase, addedItemType, pageObject, item);
  });

  if (addedItem) dispatch({ type: 'addItem', item: addedItem });
  else dispatch(closeBasicModal());
};

export const editTheirRef = (value, pageObjectType) => (dispatch, getState) => {
  const { pageObject } = getState();

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

export const editComment = (value, pageObjectType) => (dispatch, getState) => {
  const { pageObject } = getState();
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

export const deleteItemsById = pageObjectType => (dispatch, getState) => {
  const { dataState, pageObject } = getState();

  const itemsIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  UIDatabase.write(() => {
    pageObject.removeItemsById(UIDatabase, itemsIds);
    UIDatabase.save(pageObjectType, pageObject);
  });

  dispatch({ type: 'deleteRecordsById' });
};

export const deleteTransactionsById = () => (dispatch, getState) => {
  const { dataState, backingData } = getState();

  const transactionIds = Array.from(dataState.keys()).filter(
    rowKey => dataState.get(rowKey).isSelected
  );

  const transactionsToDelete = transactionIds.reduce((acc, transactionId) => {
    const transaction = backingData.filtered('id = $0', transactionId)[0];
    const shouldDelete = transaction && transaction.isValid() && !transaction.isFinalised;
    if (shouldDelete) return [...acc, transaction];
    return acc;
  }, []);

  UIDatabase.write(() => {
    UIDatabase.delete('Transaction', transactionsToDelete);
  });

  dispatch({ type: 'deleteRecordsById' });
};

export const refreshData = () => ({
  type: 'refreshData',
});

export const editTransactionBatchExpiryDate = (newDate, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.expiryDate = newDate;
    UIDatabase.save('TransactionBatch', objectToEdit);
  });

  dispatch(editField(rowKey));
};

export const editTransactionBatchQuantity = (value, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  if (!value) return;

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.setTotalQuantity(UIDatabase, parsePositiveInteger(Number(value)));
    UIDatabase.save('TransactionBatch', objectToEdit);
  });

  dispatch(editField(rowKey));
};

export const deleteTransactionBatchesById = pageObjectType => (dispatch, getState) => {
  const { dataState, pageObject } = getState();

  const itemsIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  UIDatabase.write(() => {
    pageObject.removeTransactionBatchesById(UIDatabase, itemsIds);
    UIDatabase.save(pageObjectType, pageObject);
  });

  dispatch({ type: 'deleteRecordsById' });
};

export const deleteRequisitions = () => (dispatch, getState) => {
  const { dataState, backingData } = getState();

  const requisitionIds = Array.from(dataState.keys()).filter(
    rowKey => dataState.get(rowKey).isSelected
  );

  const requisitionsToDelete = requisitionIds.reduce((acc, requisitionId) => {
    const requisition = backingData.filtered('id = $0', requisitionId)[0];
    const shouldDelete = requisition && requisition.isValid() && !requisition.isFinalised;
    if (shouldDelete) return [...acc, requisition];
    return acc;
  }, []);

  UIDatabase.write(() => {
    UIDatabase.delete('Requisition', requisitionsToDelete);
  });

  dispatch({ type: 'deleteRecordsById' });
};

export const addTransactionBatch = item => (dispatch, getState) => {
  const { pageObject } = getState();
  let addedTransactionBatch;

  UIDatabase.write(() => {
    const transItem = createRecord(UIDatabase, 'TransactionItem', pageObject, item);
    const itemBatch = createRecord(UIDatabase, 'ItemBatch', item, '');
    addedTransactionBatch = createRecord(UIDatabase, 'TransactionBatch', transItem, itemBatch);
  });

  if (addedTransactionBatch) dispatch({ type: 'addItem', item: addedTransactionBatch });
  else dispatch(closeBasicModal());
};

export const createAutomaticOrder = pageObjectType => (dispatch, getState) => {
  const { pageObject } = getState();

  const thisStore = UIDatabase.objects('Name').filtered(
    'id == $0',
    Settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID)
  )[0];

  UIDatabase.write(() => {
    pageObject.createAutomaticOrder(UIDatabase, thisStore);
    UIDatabase.save(pageObjectType, pageObject);
  });

  dispatch({ type: 'createAutomaticOrder' });
};

export const useSuggestedQuantities = pageObjectType => (dispatch, getState) => {
  const { pageObject } = getState();

  UIDatabase.write(() => {
    pageObject.setRequestedToSuggested(UIDatabase);
    UIDatabase.save(pageObjectType, pageObject);
  });

  dispatch({ type: 'refreshData' });
};

export const hideOverStocked = () => ({
  type: 'hideOverStocked',
});

export const showOverStocked = () => ({
  type: 'showOverStocked',
});

export const editMonthsOfSupply = (value, pageObjectType) => (dispatch, getState) => {
  const { pageObject } = getState();
  const { monthsToSupply } = pageObject;

  if (monthsToSupply !== value) {
    UIDatabase.write(() => {
      pageObject.monthsToSupply = value;
      UIDatabase.save(pageObjectType, pageObject);
    });
  }

  dispatch(closeBasicModal());
};

export const editRequiredQuantity = (value, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.requiredQuantity = parsePositiveInteger(Number(value));
    UIDatabase.save('RequisitionItem', objectToEdit);
  });

  dispatch(editField(rowKey));
};
