/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const ACTIONS = {
  // tableAction constants
  SORT_DATA: 'sortData',
  FILTER_DATA: 'filterData',
  REFRESH_DATA: 'refreshData',
  ADD_ITEM: 'addItem',
  ADD_RECORD: 'addRecord',
  HIDE_OVER_STOCKED: 'hideOverStocked',
  HIDE_STOCK_OUT: 'hideStockOut',

  // pageAction constants
  OPEN_MODAL: 'openModal',
  CLOSE_MODAL: 'closeModal',
  EDIT_NAME: 'editName',

  // rowAction constants
  REFRESH_ROW: 'refreshRow',
  EDIT_TOTAL_QUANTITY: 'editTotalQuantity',
  EDIT_COUNTED_QUANTITY: 'editCountedQuantity',
  EDIT_REQUIRED_QUANTITY: 'editRequiredQuantity',
  EDIT_EXPIRY_DATE: 'editExpiryDate',
  ENFORCE_REASON: 'enforceReasonChoice',
  SELECT_ONE_ROW: 'selectOneRow',

  // cellAction constants
  FOCUS_CELL: 'focusCell',
  FOCUS_NEXT: 'focusNext',
  SELECT_ROW: 'selectRow',
  SELECT_ALL: 'selectAll',
  SELECT_ROWS: 'selectRows',
  DESELECT_ROW: 'deselectRow',
  DESELECT_ALL: 'deselectAll',
  DELETE_RECORDS: 'deleteRecords',
};
