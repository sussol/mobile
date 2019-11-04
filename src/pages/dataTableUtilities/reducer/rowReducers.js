/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Immutably clears the current focus within dataState.
 * @return {object} New state with no cell focused
 */
const clearFocus = state => {
  const { dataState, currentFocusedRowKey } = state;
  if (!currentFocusedRowKey) {
    return state;
  }

  const newDataState = new Map(dataState);
  const currentRowState = newDataState.get(currentFocusedRowKey);
  newDataState.set(currentFocusedRowKey, { ...currentRowState, focusedColumn: null });

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
    newDataState.set(currentFocusedRowKey, { ...currentRowState, focusedColumn: null });
  }
  // Update focusedColumn in specified row
  const nextRowState = newDataState.get(rowKey);
  newDataState.set(rowKey, {
    ...nextRowState,
    focusedColumn: columnKey,
  });

  return { ...state, dataState: newDataState, currentFocusedRowKey: rowKey };
};

/**
 * Focus the next appropriate cell after the current cell provided in action
 */
export const focusNextCell = (state, action) => {
  const { data, columns, keyExtractor } = state;
  const { payload } = action;
  const { rowKey, columnKey } = payload;

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
 * Focuses the cell provided in the action passed
 */
export const focusCell = (state, action) => {
  // Clear any existing focus and focus cell specified in action
  const { payload } = action;
  const { rowKey, columnKey } = payload;

  return setFocus(state, rowKey, columnKey);
};

/**
 * Sets the provided row in action as selected
 */
export const selectRow = (state, action) => {
  const { dataState } = state;
  const { payload } = action;
  const { rowKey } = payload;

  const newDataState = new Map(dataState);

  const rowState = newDataState.get(rowKey);
  newDataState.set(rowKey, { ...rowState, isSelected: true });

  return { ...state, dataState: newDataState, hasSelection: true };
};

/**
 * Removes the provided row in action from being
 * selected.
 */
export const deselectRow = (state, action) => {
  const { dataState } = state;
  const { payload } = action;
  const { rowKey } = payload;

  const newDataState = new Map(dataState);

  const rowState = newDataState.get(rowKey);
  newDataState.set(rowKey, { ...rowState, isSelected: false });

  let hasSelection = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const row of newDataState.values()) {
    if (row.isSelected) {
      hasSelection = true;
      break;
    }
  }

  return { ...state, dataState: newDataState, hasSelection, allSelected: false, selectedRow: null };
};

/**
 * Removes all rows from being selected.
 */
export const deselectAll = state => {
  const { dataState } = state;

  const newDataState = new Map(dataState);

  // eslint-disable-next-line no-restricted-syntax
  for (const [rowKey, rowState] of newDataState.entries()) {
    if (rowState.isSelected) newDataState.set(rowKey, { ...rowState, isSelected: false });
  }

  return { ...state, dataState: newDataState, hasSelection: false, allSelected: false };
};

/**
 * Sets all rowState.isSelected within dataState to true.
 */
export const selectAll = state => {
  const { data, dataState, keyExtractor } = state;

  const newDataState = new Map(dataState);

  data.forEach(item => {
    const rowKey = keyExtractor(item);
    newDataState.set(rowKey, { ...newDataState.get(rowKey), isSelected: true });
  });

  return { ...state, dataState: newDataState, hasSelection: true, allSelected: true };
};

/**
 * Sets the rowState of each of the array of items from the undering data
 * in the current store within dataState to true.
 */
export const selectRows = (state, action) => {
  const { dataState, keyExtractor } = state;
  const { payload } = action;
  const { items } = payload;

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

/**
 * Removes the selected records from state. Where each selected
 * record is indicated by DataState[rowKey].isSelected. Thunks should have
 * handled the actual deleting of records before this is dispatched.
 */
export const deleteRecords = state => {
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
 * Selects a row. Removes any existing selections to ensure only one
 * row is selected at a time by using the selectRow state field. If
 * `selectRow` action is used, multiple rows can be selected at one time.
 */
export const selectOneRow = (state, action) => {
  const { selectedRow: oldSelectedRow, data, dataState, keyExtractor } = state;
  const { payload } = action;

  const { rowKey: newSelectedRowKey } = payload;

  const newDataState = new Map(dataState);

  // If there is a selectedRow already, remove it.
  if (oldSelectedRow) {
    const oldSelectedRowKey = keyExtractor(oldSelectedRow);
    const oldSelectedRowState = newDataState.get(oldSelectedRowKey);
    newDataState.set(oldSelectedRowKey, { ...oldSelectedRowState, isSelected: false });
  }

  // Update the state for the newly selected row
  const newSelectedRowState = newDataState.get(newSelectedRowKey);
  newDataState.set(newSelectedRowKey, { ...newSelectedRowState, isSelected: true });

  // Find the corresponding rowData
  const newSelectedRow = data.find(row => keyExtractor(row) === newSelectedRowKey);

  return { ...state, dataState: newDataState, selectedRow: newSelectedRow };
};

export const RowReducerLookup = {
  selectRow,
  selectOneRow,
  deselectRow,
  deselectAll,
  selectAll,
  selectRows,
  deleteRecords,
};
