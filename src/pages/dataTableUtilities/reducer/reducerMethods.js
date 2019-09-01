/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { newSortDataBy, MODAL_KEYS, formatErrorItemNames } from '../../../utilities';

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

  const queryString = filterDataKeys
    .map(filterTerm => `${filterTerm} CONTAINS[c]  $0`)
    .join(' OR ');

  const filteredData = backingData.filtered(queryString, searchTerm).slice();

  return {
    ...state,
    data: sortBy ? newSortDataBy(filteredData, sortBy, isAscending) : filteredData,
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

  return { ...state, dataState: newDataState, hasSelection, allSelected: false };
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
  return { ...state, dataState: newDataState, hasSelection: false, allSelected: false };
};

export const selectAll = state => {
  const { data, dataState, keyExtractor } = state;
  const newDataState = new Map(dataState);

  data.forEach(item => {
    const rowKey = keyExtractor(item);
    newDataState.set(rowKey, {
      ...newDataState.get(rowKey),
      isSelected: true,
    });
  });

  return { ...state, dataState: newDataState, hasSelection: true, allSelected: true };
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

  // If the new sortBy is the same as the sortBy in state, then invert isAscending
  // that was set by the last sortBy action. Otherwise, default to true.
  const newIsAscending = newSortBy === sortBy ? !isAscending : true;

  const newData = newSortDataBy(data, newSortBy, newIsAscending);
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
  return { ...state, modalKey };
};

/**
 * Sets the modal open state to false, closing any
 * modal that is open.
 *
 * @param {Object} state  The current state
 * Action: { type: 'closeBasicModal' }
 */
export const closeBasicModal = state => ({ ...state, modalKey: '' });

/**
 * Adds all items from a master list to the pageObject held
 * in state - either a Requisition or Transaction.
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'addMasterListItems', objectType }
 */
export const addMasterListItems = state => {
  const { backingData, isAscending, sortBy } = state;

  const newData = newSortDataBy(backingData.slice(), sortBy, isAscending);

  return { ...state, data: newData };
};

/**
 * Creates an Item (Either Requisition or Transaction), and appends
 * this item to the data array for a page.
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'addItem', item, addedItemType }
 */
export const addItem = (state, action) => {
  const { data } = state;
  const { item } = action;

  return { ...state, data: [item, ...data], modalKey: '', sortBy: '', searchTerm: '' };
};

/**
 * Reducer helper method for editing a non-setter field on a
 * realm object. Should be called by more explicit reducer
 * methods and not exported to avoid misuse. To create a reducer
 * method for setting a simple value for a realm object, create a
 * more explicit reducer method with logic specific to that field
 * contained, and call this method. See editTheirRef.
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'editPageObject', value, field, pageObjectType }
 */
const editPageObject = state => ({ ...state, modalKey: '' });

/**
 * Edits the passed pageObject 'theirRef' field with the value supplied.
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'editPageObject', value, pageObjectType }
 */
export const editTheirRef = (state, action) => {
  const { pageObject } = state;
  const { value } = action;

  const { theirRef } = pageObject;

  if (theirRef !== value) return { ...editPageObject(state, { ...action, field: 'theirRef' }) };
  return state;
};

/**
 * Edits the passed pageObject 'comment' field with the value supplied.
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 * Action: { type: 'editPageObject', value, pageObjectType }
 */
export const editComment = (state, action) => {
  const { pageObject } = state;
  const { value } = action;

  const { comment } = pageObject;

  if (comment !== value) return { ...state, modalKey: '', modalValue: null };
  return state;
};

/**
 * Removes the selected records from state. Where each selected
 * record is indicated by DataState[rowKey].isSelected. Thunks should have
 * handled the actual deleting of records before this is dispatched.
 *
 * @param {Object} state  The current state
 * @param {Object} action The action to act upon
 */
export const deleteRecordsById = state => {
  const { data } = state;

  const newDataState = new Map();
  const newData = data.filter(record => record.isValid());

  return {
    ...state,
    data: newData,
    dataState: newDataState,
    hasSelection: false,
    modalKey: '',
  };
};

/**
 * Simply refresh's the data object in state to
 * correctly match the backingData when side effects
 * such as finalizing manipulate the state of a page
 * from outside the reducer. Should only be used when
 * there are no other options.
 *
 * @param {Object} state  The current state
 */
export const refreshData = state => {
  const { backingData, sortBy, isAscending } = state;

  const newData = newSortDataBy(backingData.slice(), sortBy, isAscending);

  return { ...state, data: newData };
};

export const createAutomaticOrder = state => {
  const { backingData, sortBy, isAscending } = state;

  const newData = newSortDataBy(backingData.slice(), sortBy, isAscending);

  return { ...state, data: newData };
};

export const hideOverStocked = state => {
  const { backingData } = state;

  const newData = backingData.filter(requisitionItem => requisitionItem.isLessThanThresholdMOS);

  return { ...state, data: newData, showAllStock: false };
};

export const showOverStocked = state => ({ ...refreshData(state), showAllStock: true });

export const editField = (state, action) => {
  const { rowKey } = action;
  const { dataState } = state;

  // Change object reference of row in `dataState` to trigger rerender of that row.
  // Realm object reference in `data` can't be affected in any tidy manner.
  const newDataState = new Map(dataState);
  const nextRowState = newDataState.get(rowKey);
  newDataState.set(rowKey, { ...nextRowState });

  return { ...state, dataState: newDataState };
};

export const useSuggestedQuantities = state => {
  const { backingData } = state;
  return { ...state, data: backingData.slice() };
};

export const selectItems = (state, action) => {
  const { dataState, keyExtractor } = state;
  const { items } = action;

  const newDataState = new Map(dataState);
  items.forEach(item => {
    const rowKey = keyExtractor(item);
    newDataState.set(rowKey, { ...dataState.get(rowKey), isSelected: true });
  });

  return {
    ...state,
    dataState: newDataState,
    showAll: true,
    allSelected: false,
    hasSelection: true,
  };
};

export const editName = (state, action) => {
  const { value } = action;

  return { ...state, name: value };
};

export const hideStockOut = state => {
  const { backingData } = state;

  const newData = backingData.filter(item => item.hasStock);

  return { ...state, data: newData, showAll: false, searchTerm: '' };
};

export const showStockOut = state => ({ ...refreshData(state), showAll: true, searchTerm: '' });
export const editCountedTotalQuantity = (state, action) => {
  const { rowKey } = action;
  const { dataState } = state;

  // Change object reference of row in `dataState` to trigger rerender of that row.
  // Realm object reference in `data` can't be affected in any tidy manner.
  const newDataState = new Map(dataState);
  const nextRowState = newDataState.get(rowKey);
  newDataState.set(rowKey, { ...nextRowState });

  return { ...state, dataState: newDataState };
};

export const openStocktakeBatchModal = (state, action) => {
  const { rowKey } = action;
  const { data } = state;

  const stocktakeBatchToEdit = data.find(({ id }) => id === rowKey);

  return {
    ...state,
    modalValue: stocktakeBatchToEdit,
    modalKey: MODAL_KEYS.EDIT_STOCKTAKE_BATCH,
  };
};

export const closeStocktakeBatchModal = state => {
  const { backingData } = state;
  return { ...state, data: backingData.slice(), modalKey: '' };
};

export const openModal = (state, action) => {
  const { modalKey, value } = action;
  return { ...state, modalKey, modalValue: value };
};

export const openCommentModal = state => {
  const { pageObject } = state;

  const { comment } = pageObject;

  return { ...state, modalKey: MODAL_KEYS.STOCKTAKE_COMMENT_EDIT, modalValue: comment };
};

export const openStocktakeOutdatedItems = state => {
  const { pageObject } = state;
  const { itemsOutdated } = pageObject;

  return {
    ...state,
    modalValue: formatErrorItemNames(itemsOutdated),
    modalKey: MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM,
  };
};

export const resetStocktake = state => {
  const { backingData } = state;

  return { ...state, data: backingData.slice(), modalKey: '', modalValue: null };
};

export const selectAll = state => {
  const { data, keyExtractor } = state;

  const newDataState = new Map();

  data.forEach(datum => {
    const rowKey = keyExtractor(datum);
    newDataState.set(rowKey, { isSelected: true });
  });

  return { ...state, dataState: newDataState, hasSelection: true, allSelected: true };
};

export const hideStockOut = state => {
  const { backingData } = state;

  const newData = backingData.filter(item => item.totalQuantity);

  return { ...state, data: newData, showAll: false };
};

export const showStockOut = state => {
  const { backingData } = state;

  return { ...state, data: backingData.slice(), showAll: true };
};
