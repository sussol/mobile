/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable import/prefer-default-export */
import { parsePositiveInteger, newSortDataBy } from '../../../utilities';

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
  const { backingData, filterDataKeys } = state;
  const { searchTerm } = action;
  const queryString = filterDataKeys
    .map(filterTerm => `${filterTerm} BEGINSWITH[c]  $0`)
    .join(' OR ');
  const newData = backingData.filtered(queryString, searchTerm).slice();
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

  return { ...state, dataState: newDataState };
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

  return { ...state, dataState: newDataState };
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
  return { ...state, dataState: newDataState };
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
  const { data, isAscending } = state;
  const { sortBy } = action;
  const columnKeyToDataType = {
    itemCode: 'string',
    itemName: 'string',
    availableQuantity: 'number',
    totalQuantity: 'number',
  };

  const newData = newSortDataBy(data, sortBy, columnKeyToDataType[sortBy], isAscending);
  return { ...state, data: newData, sortBy, isAscending: !isAscending };
};
