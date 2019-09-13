/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Method using a factory pattern variant to get a reducer
 * for a particular page or page style.
 *
 * For a new page - create a constant object with the
 * methods from reducerMethods which are composed to create
 * a reducer. Add to PAGE_REDUCERS.
 *
 * Each key value pair in a reducer object should be in the form
 * action type: reducer function, returning a new state object
 *
 */

import { UIDatabase } from '../../../database/index';

import { refreshRow } from './cellReducers';
import {
  selectRow,
  deselectRow,
  deselectAll,
  selectAll,
  selectRows,
  deleteRecords,
} from './rowReducers';
import {
  hideStockOut,
  addRecord,
  hideOverStocked,
  refreshData,
  filterData,
  sortData,
} from './tableReducers';
import { editName, openModal, closeModal } from './pageReducers';

/**
 * Used for actions that should be in all pages using a data table.
 */
const BASE_TABLE_PAGE_REDUCER = {
  sortData,
};

const customerInvoice = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openModal,
  closeModal,
  addRecord,
  deleteRecords,
  refreshData,
  refreshRow,
};

const customerInvoices = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openModal,
  closeModal,
  deleteRecords,
  refreshData,
};

const supplierInvoice = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  closeModal,
  openModal,
  refreshData,
  addRecord,
  deleteRecords,
  refreshRow,
};

const supplierRequisition = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openModal,
  closeModal,
  refreshData,
  addRecord,
  hideOverStocked,
  deleteRecords,
  refreshRow,
};

const programSupplierRequisition = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openModal,
  closeModal,
  refreshData,
  addRecord,
  hideOverStocked,
  deleteRecords,
  refreshRow,
};

const supplierRequisitions = {
  sortData,
  filterData,
  selectRow,
  deselectRow,
  openModal,
  closeModal,
  refreshData,
  deleteRecords,
};

const stocktakes = {
  openModal,
  closeModal,
  filterData,
  selectRow,
  deselectAll,
  deselectRow,
  sortData,
  deleteRecords,
};

const stocktakeManager = {
  selectRow,
  deselectAll,
  deselectRow,
  sortData,
  filterData,
  selectAll,
  hideStockOut,
  selectRows,
  editName,
  refreshData,
};

const stocktakeEditor = {
  ...BASE_TABLE_PAGE_REDUCER,
  sortData,
  filterData,
  openModal,
  closeModal,
  refreshData,
  refreshRow,
};

const stocktakeEditorReasons = {
  ...stocktakeEditor,
};

const PAGE_REDUCERS = {
  customerInvoice,
  customerInvoices,
  supplierInvoice,
  supplierRequisitions,
  supplierRequisition,
  programSupplierRequisition,
  stocktakes,
  stocktakeManager,
  stocktakeEditor,
  stocktakeEditorReasons,
};

const getReducer = page => {
  let reducer;
  switch (page) {
    case 'stocktakeEditor':
      {
        const usesReasons = UIDatabase.objects('StocktakeReasons').length > 0;
        reducer = usesReasons ? PAGE_REDUCERS.stocktakeEditorReasons : PAGE_REDUCERS[page];
      }
      break;
    default:
      reducer = PAGE_REDUCERS[page];
  }

  return (state, action) => {
    const { type } = action;
    if (!reducer[type]) return state;
    return reducer[type](state, action);
  };
};

export default getReducer;
