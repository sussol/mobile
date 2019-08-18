/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Actions for use with a data table reducer
 */

export const editTotalQuantity = (value, rowKey, columnKey) => ({
  type: 'editCell',
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
