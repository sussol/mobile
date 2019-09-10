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

import {
  filterData,
  focusNextCell,
  selectRow,
  deselectRow,
  deselectAll,
  focusCell,
  sortData,
  openBasicModal,
  closeBasicModal,
  addMasterListItems,
  addItem,
  editTheirRef,
  editComment,
  deleteRecordsById,
  refreshData,
  createAutomaticOrder,
  hideOverStocked,
  showOverStocked,
  editField,
  selectAll,
  hideStockOut,
  showStockOut,
  selectItems,
  editName,
  editCountedTotalQuantity,
  openStocktakeBatchModal,
  closeStocktakeBatchModal,
  openModal,
  openCommentModal,
  openStocktakeOutdatedItems,
  resetStocktake,
  editCountedTotalQuantityWithReason,
  applyReason,
  openStocktakeReasonsModal,
} from './reducerMethods';
import { UIDatabase } from '../../../database/index';

/**
 * Used for actions that should be in all pages using a data table.
 */
const BASE_TABLE_PAGE_REDUCER = {
  focusNextCell,
  focusCell,
  sortData,
};

const customerInvoice = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  editField,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  addMasterListItems,
  addItem,
  editTheirRef,
  editComment,
  deleteRecordsById,
  refreshData,
};

const customerInvoices = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  deleteRecordsById,
  refreshData,
};

const supplierInvoice = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  closeBasicModal,
  openBasicModal,
  editTheirRef,
  editComment,
  refreshData,
  addItem,
  editField,
  deleteRecordsById,
};

const supplierRequisition = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  editTheirRef,
  editComment,
  refreshData,
  addMasterListItems,
  addItem,
  createAutomaticOrder,
  hideOverStocked,
  showOverStocked,
  editField,
  deleteRecordsById,
};

const programSupplierRequisition = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  editTheirRef,
  editComment,
  refreshData,
  addMasterListItems,
  addItem,
  createAutomaticOrder,
  hideOverStocked,
  showOverStocked,
  editField,
};

const supplierRequisitions = {
  sortData,
  filterData,
  selectRow,
  deselectRow,
  openBasicModal,
  closeBasicModal,
  refreshData,
};

const stocktakes = {
  openBasicModal,
  closeBasicModal,
  filterData,
  selectRow,
  deselectAll,
  deselectRow,
  sortData,
};

const stocktakeManager = {
  selectRow,
  deselectAll,
  deselectRow,
  sortData,
  filterData,
  selectAll,
  hideStockOut,
  showStockOut,
  selectItems,
  editName,
};

const stocktakeEditor = {
  ...BASE_TABLE_PAGE_REDUCER,
  sortData,
  filterData,
  editComment,
  openBasicModal,
  closeBasicModal,
  editCountedTotalQuantity,
  refreshData,
  openStocktakeBatchModal,
  closeStocktakeBatchModal,
  openModal,
  openCommentModal,
  openStocktakeOutdatedItems,
  resetStocktake,
};

const stocktakeEditorReasons = {
  ...stocktakeEditor,
  editCountedTotalQuantity: editCountedTotalQuantityWithReason,
  applyReason,
  openStocktakeReasonsModal,
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
