/* eslint-disable no-restricted-syntax */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

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

  const hasSelection = Array.from(newDataState).some(([, { isSelected }]) => isSelected);

  return {
    ...state,
    dataState: newDataState,
    hasSelection,
    allSelected: false,
    selectedRow: null,
  };
};

export const deselectOneRow = state => {
  const { dataState, keyExtractor, selectedRow } = state;

  const rowKey = keyExtractor(selectedRow);
  const newDataState = new Map(dataState);
  const rowState = newDataState.get(rowKey);
  newDataState.set(rowKey, { ...rowState, isSelected: false });

  return {
    ...state,
    dataState: newDataState,
    hasSelection: false,
    allSelected: false,
    selectedRow: null,
  };
};

export const deselectAll = state => {
  const { dataState } = state;

  const newDataState = new Map(dataState);

  for (const key of newDataState.keys()) {
    const rowState = newDataState.get(key);
    newDataState.set(key, { ...rowState, isSelected: false });
  }

  return {
    ...state,
    dataState: newDataState,
    hasSelection: false,
    allSelected: false,
    selectedRow: null,
  };
};

/**
 * Toggles selection of all rows between selected/false
 */
export const toggleSelectAll = state => {
  const { keyExtractor, dataState, allSelected, backingData } = state;

  const newDataState = new Map(dataState);

  const newSelectionState = !allSelected;

  backingData.forEach(item => {
    const rowKey = keyExtractor(item);
    newDataState.set(rowKey, { ...newDataState.get(rowKey), isSelected: newSelectionState });
  });

  return {
    ...state,
    dataState: newDataState,
    hasSelection: newSelectionState,
    allSelected: newSelectionState,
  };
};

/**
 * Sets the rowState of each of the array of items from the underlying data
 * in the current store within dataState to true.
 */
export const selectRows = (state, action) => {
  const { dataState, hasSelection, keyExtractor } = state;
  const { payload } = action;
  const { items } = payload;

  const newDataState = new Map(dataState);

  const isSelectionUpdated = items.reduce((_, item) => {
    const rowKey = keyExtractor(item);
    newDataState.set(rowKey, { ...dataState.get(rowKey), isSelected: true });
    return true;
  }, false);

  return {
    ...state,
    dataState: newDataState,
    showAll: true,
    allSelected: false,
    hasSelection: isSelectionUpdated || hasSelection,
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
  deselectOneRow,
  deselectAll,
  toggleSelectAll,
  selectRows,
  deleteRecords,
};
