/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable import/prefer-default-export */
import { parsePositiveInteger, newSortDataBy } from '../../../utilities';
import { createRecord } from '../../../database/utilities/index';

/**
 * Immutably clears the current focus
 * @param {object} currState  the copy of state you want affected
 * @return {object}           New state with no cell focused
 */
const clearFocus = state => {
  const { dataState, currentFocusedRowKey } = state;
  if (!currentFocusedRowKey) {
    return state;
  }

  const newDataState = new Map(dataState);
  const currentRowState = newDataState.get(currentFocusedRowKey);
  newDataState.set(currentFocusedRowKey, {
    ...currentRowState,
    focusedColumn: null,
  });

  return { ...state, dataState: newDataState, currentFocusedRowKey: null };
};

/**
 * Immutably sets the current focus to the cell identified by `rowKey` and `columnKey`
 * @param {object} state  The copy of state to affect
 * @param {string} rowKey     The key of the row the cell to focus is in
 * @param {string} columnKey  The key of the column the cell to focus is in
 * @return {object}           A new object with a cell focused
 */
const setFocus = (state, rowKey, columnKey) => {
  const { dataState, currentFocusedRowKey } = state;
  const newDataState = new Map(dataState);

  // Clear previous focus if in a different row
  if (currentFocusedRowKey && rowKey !== currentFocusedRowKey) {
    const currentRowState = newDataState.get(currentFocusedRowKey);
    newDataState.set(currentFocusedRowKey, {
      ...currentRowState,
      focusedColumn: null,
    });
  }

  // Update focusedColumn in specified row
  const nextRowState = newDataState.get(rowKey);
  newDataState.set(rowKey, {
    ...nextRowState,
    focusedColumn: columnKey,
  });

  return {
    ...state,
    dataState: newDataState,
    currentFocusedRowKey: rowKey,
  };
};

/**
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 */
export const filterData = (state, action) => {
  const { backingData, filterDataKeys, sortBy, isAscending } = state;
  const { searchTerm } = action;

  const columnKeyToDataType = {
    itemCode: 'string',
    itemName: 'string',
    availableQuantity: 'number',
    totalQuantity: 'number',
  };

  const queryString = filterDataKeys
    .map(filterTerm => `${filterTerm} BEGINSWITH[c]  $0`)
    .join(' OR ');

  const newData = newSortDataBy(
    backingData.filtered(queryString, searchTerm).slice(),
    sortBy,
    columnKeyToDataType[sortBy],
    isAscending
  );
  return { ...state, data: newData };
};

export const editTotalQuantity = (state, action) => {
  const { value, rowKey } = action;
  const { data, database, dataState, keyExtractor } = state;

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  database.write(() => {
    objectToEdit.setTotalQuantity(database, parsePositiveInteger(Number(value)));
    database.save('TransactionItem', objectToEdit);
  });

  // Change object reference of row in `dataState` to trigger rerender of that row.
  // Realm object reference in `data` can't be affected in any tidy manner.
  const newDataState = new Map(dataState);
  const nextRowState = newDataState.get(rowKey);
  newDataState.set(rowKey, {
    ...nextRowState,
  });

  return {
    ...state,
    dataState: newDataState,
  };
};

/**
 * Focus the next appropriate cell after the current cell provided in action
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 */
export const focusNextCell = (state, action) => {
  const { data, columns, keyExtractor } = state;
  const { rowKey, columnKey } = action;

  // Handle finding next cell to focus
  let nextEditableColKey;
  const currentColIndex = columns.findIndex(col => col.key === columnKey);
  for (let index = currentColIndex + 1; index < columns.length; index++) {
    if (columns[index].type === 'editable') {
      nextEditableColKey = columns[index].key;
      break;
    }
  }

  if (nextEditableColKey) {
    // Focus next editable cell in row
    return setFocus(state, rowKey, nextEditableColKey);
  }

  // Attempt moving focus to next row
  const nextRowIndex = data.findIndex(row => keyExtractor(row) === rowKey) + 1;

  if (nextRowIndex < data.length) {
    // Focus first editable cell in next row
    const nextRowKey = keyExtractor(data[nextRowIndex]);
    const firstEditableColKey = columns.find(col => col.type === 'editable').key;
    return setFocus(state, nextRowKey, firstEditableColKey);
  }

  // We were on the last row and last column, so unfocus current cell
  return clearFocus(state);
};

/**
 * Sets the provided row in action as selected
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'selectRow', rowKey }
 */
export const selectRow = (state, action) => {
  const { dataState } = state;
  const { rowKey } = action;
  const newDataState = new Map(dataState);

  const rowState = newDataState.get(rowKey);
  newDataState.set(rowKey, {
    ...rowState,
    isSelected: true,
  });

  return { ...state, dataState: newDataState, hasSelection: true };
};

/**
 * Removes the provided row in action from being
 * selected.
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'deselectRow', rowKey }
 */
export const deselectRow = (state, action) => {
  const { dataState } = state;
  const { rowKey } = action;
  const newDataState = new Map(dataState);

  const rowState = newDataState.get(rowKey);
  newDataState.set(rowKey, {
    ...rowState,
    isSelected: false,
  });

  let hasSelection = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const row of newDataState.values()) {
    if (row.isSelected) {
      hasSelection = true;
      break;
    }
  }

  return { ...state, dataState: newDataState, hasSelection };
};

/**
 * Removes all rows from being selected.
 * @param {Object} state  The current state
 * Action: { type: 'deselectAll' }
 */
export const deselectAll = state => {
  const { dataState } = state;
  const newDataState = new Map(dataState);

  // eslint-disable-next-line no-restricted-syntax
  for (const [rowKey, rowState] of newDataState.entries()) {
    if (rowState.isSelected) {
      newDataState.set(rowKey, {
        ...rowState,
        isSelected: false,
      });
    }
  }
  return { ...state, dataState: newDataState, hasSelection: false };
};

/**
 * Focuses the cell provided in the action passed
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * action: { type: 'focusCell', rowKey, columnKey }
 */
export const focusCell = (state, action) => {
  // Clear any existing focus and focus cell specified in action
  const { rowKey, columnKey } = action;
  return setFocus(state, rowKey, columnKey);
};

/**
 * Sorts the current set of data by the provided
 * key and direction in action.
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'sortData', sortBy }
 * sortBy: String key of the field of the objects to sort by.
 */
export const sortData = (state, action) => {
  const { data, isAscending, sortBy } = state;
  const { sortBy: newSortBy } = action;
  const columnKeyToDataType = {
    itemCode: 'string',
    itemName: 'string',
    availableQuantity: 'number',
    totalQuantity: 'number',
  };

  // If the new sortBy is the same as the sortBy in state, then invert isAscending
  // that was set by the last sortBy action. Otherwise, default to true.
  const newIsAscending = newSortBy === sortBy ? !isAscending : true;

  const newData = newSortDataBy(data, newSortBy, columnKeyToDataType[newSortBy], newIsAscending);
  return { ...state, data: newData, sortBy: newSortBy, isAscending: newIsAscending };
};

/**
 * Opens a basic modal which does not require any other value
 * to be set upon opening. i.e. text editors
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'openBasicModal', modalKey }
 */
export const openBasicModal = (state, action) => {
  const { modalKey } = action;
  return { ...state, modalIsOpen: true, modalKey };
};

/**
 * Sets the modal open state to false, closing any
 * modal that is open.
 *
 * @param {Object} state  The current state
 * Action: { type: 'closeBasicModal' }
 */
export const closeBasicModal = state => ({ ...state, modalIsOpen: false, modalKey: '' });

/**
 * Adds all items from a master list to the pageObject held
 * in state - either a Requisition or Transaction.
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'addMasterListItems', objectType }
 */
export const addMasterListItems = (state, action) => {
  const { pageObject, database, backingData } = state;
  const { objectType } = action;

  database.write(() => {
    pageObject.addItemsFromMasterList(database);
    database.save(objectType, pageObject);
  });

  const newData = backingData.slice();

  return { ...state, data: newData };
};

/**
 * Creates an Item (Either Requisition or Transaction), and appends
 * this item to the data array for a page.
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'adadItem', item, addedItemType }
 */
export const addItem = (state, action) => {
  const { database, pageObject, data } = state;
  const { item, addedItemType } = action;
  let addedItem;

  database.write(() => {
    if (pageObject.hasItem(item)) return;
    addedItem = createRecord(database, addedItemType, pageObject, item);
  });

  if (addedItem) return { ...state, data: [addedItem, ...data], modalIsOpen: false };

  return { ...state, modalIsOpen: false };
};

/**
 * Edits the passed pageObject field with the value supplied.
 * Used for simple value setting i.e. comments.
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'editPageObject', value, field, pageObjectType }
 */
export const editPageObject = (state, action) => {
  const { database, pageObject } = state;
  const { value, pageObjectType, field } = action;

  if (pageObject[field] !== value) {
    database.write(() => {
      pageObject[field] = value;
      database.save(pageObjectType, pageObject);
    });
  }

  return { ...state, modalIsOpen: false };
};

/**
 * Deletes the selected RequisitionItems or
 * TransactionItems held in state. Where each selected
 * item is indicated by DataState[rowKey].isSelected.
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 */
export const deleteItemsById = (state, action) => {
  const { database, pageObject, dataState, hasSelection, backingData } = state;
  const { pageObjectType } = action;

  if (!hasSelection) return state;

  const itemsIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  database.write(() => {
    pageObject.removeItemsById(database, itemsIds);
    database.save(pageObjectType, pageObject);
  });

  const newDataState = new Map();
  const newData = backingData.slice();

  return {
    ...state,
    data: newData,
    dataState: newDataState,
    hasSelection: false,
    modalIsOpen: false,
  };
};
