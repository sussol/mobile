/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

// eslint-disable-next-line import/no-cycle
import { PageActions } from './actions';
import { MODAL_KEYS } from '../../utilities/getModalTitle';
import { debounce } from '../../utilities/underscoreMethods';
import { gotoStocktakeManagePage } from '../../navigation/actions';

export const getPageDispatchers = (dispatch, dataType, route) => {
  const dispatches = {
    // Editing of PageInfo
    onEditName: value => dispatch(PageActions.editPageObjectName(value, dataType, route)),
    onNameChange: value => dispatch(PageActions.editName(value, route)),
    onEditComment: value => dispatch(PageActions.editComment(value, dataType, route)),
    onEditTheirRef: value => dispatch(PageActions.editTheirRef(value, dataType, route)),
    onEditMonth: value => dispatch(PageActions.editMonthsToSupply(value, route)),

    // Full table manipulation
    refreshData: () => dispatch(PageActions.refreshData(route)),
    onResetStocktake: () => dispatch(PageActions.resetStocktake(route)),
    toggleSelectAll: () => dispatch(PageActions.toggleSelectAll(route)),
    toggleFinalised: () => dispatch(PageActions.toggleShowFinalised(route)),
    toggleStockOut: () => dispatch(PageActions.toggleStockOut(route)),
    onFilterData: debounce(value => dispatch(PageActions.filterData(value, route)), 75),
    onFilterIndicatorData: debounce(
      value => dispatch(PageActions.filterIndicatorData(value, route)),
      75
    ),
    onToggleIndicators: () => {
      dispatch(PageActions.toggleIndicators(route));
      dispatch(PageActions.refreshData(route));
    },
    onToggleTransactionType: () => dispatch(PageActions.toggleTransactionType(route)),
    onSelectIndicator: indicatorCode => dispatch(PageActions.selectIndicator(indicatorCode, route)),
    onEditIndicatorValue: (value, rowKey, columnKey) =>
      dispatch(PageActions.editIndicatorValue(value, rowKey, columnKey, route)),
    onShowOverStocked: () => dispatch(PageActions.showOverStocked(route)),
    onHideOverStocked: () => dispatch(PageActions.hideOverStocked(route)),
    onDeselectAll: () => dispatch(PageActions.deselectAll(route)),
    onSetRequestedToSuggested: () => dispatch(PageActions.setRequestedToSuggested(route)),
    onSortColumn: columnKey => dispatch(PageActions.sortData(columnKey, route)),

    // Modals
    onSelectLocation: rowKey =>
      dispatch(PageActions.openModal(MODAL_KEYS.SELECT_LOCATION, rowKey, route)),
    onSelectVvmStatus: rowKey =>
      dispatch(PageActions.openModal(MODAL_KEYS.SELECT_VVM_STATUS, rowKey, route)),
    onOpenRegimenDataModal: () =>
      dispatch(PageActions.openModal(MODAL_KEYS.VIEW_REGIMEN_DATA, route)),
    onOpenOutdatedItemModal: () =>
      dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM, route)),
    onEditReason: rowKey =>
      dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_REASON, rowKey, route)),
    onEditRequisitionReason: rowKey =>
      dispatch(PageActions.openModal(MODAL_KEYS.REQUISITION_REASON, rowKey, route)),
    onNewCashTransaction: () =>
      dispatch(PageActions.openModal(MODAL_KEYS.CREATE_CASH_TRANSACTION, route)),
    onNewCustomerInvoice: () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_CUSTOMER, route)),
    onNewPrescription: () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_PATIENT, route)),
    onCloseModal: () => dispatch(PageActions.closeModal(route)),

    // Modal callbacks
    onApplyReason: ({ item }) => dispatch(PageActions.applyReason(item, route)),
    onConfirmBatchEdit: () => dispatch(PageActions.closeAndRefresh(route)),
    onApplySensorLocation: ({ item }) => dispatch(PageActions.editSensorLocation(item, route)),
    onApplyTransactionBatchLocation: ({ item }) =>
      dispatch(PageActions.editTransactionBatchLocation(item, route)),
    onApplyStocktakeBatchLocation: ({ item }) =>
      dispatch(PageActions.editStocktakeBatchLocation(item, route)),
    onApplyTransactionBatchVvmStatus: ({ item }) =>
      dispatch(PageActions.editTransactionBatchVvmStatus(item, route)),
    onApplyStocktakeBatchVvmStatus: ({ item }) =>
      dispatch(PageActions.editStocktakeBatchVvmStatus(item, route)),

    // Adding items/batch rows.
    onAddTransactionBatch: item => dispatch(PageActions.addTransactionBatch(item, route)),
    onAddStocktakeBatch: () => dispatch(PageActions.addStocktakeBatch(route)),
    onAddTransactionItem: item => dispatch(PageActions.addItem(item, 'TransactionItem', route)),
    onAddStocktakeItem: item => dispatch(PageActions.addItem(item, 'StocktakeItem', route)),
    onAddRequisitionItem: item => dispatch(PageActions.addItem(item, 'RequisitionItem', route)),
    onAddCashTransaction: item => dispatch(PageActions.addCashTransaction(item, route)),
    onSelectNewItem: () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_ITEM, route)),

    // Master list
    onAddMasterList: () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_MASTER_LISTS, route)),
    onApplyMasterLists: (selected, pageObject) =>
      dispatch(PageActions.addMasterListItems(selected, pageObject, route)),

    // Navigation
    onManageStocktake: (name, pageObject) => {
      dispatch(gotoStocktakeManagePage(name, pageObject, route));
    },

    // Row selections
    onSelectRow: ({ id }) => dispatch(PageActions.selectOneRow(id, route)),
    onDeselectRow: () => dispatch(PageActions.deselectOneRow(route)),
    onCheck: rowKey => dispatch(PageActions.selectRow(rowKey, route)),
    onUncheck: rowKey => dispatch(PageActions.deselectRow(rowKey, route)),

    // Deletions
    onDeleteRecords: () => dispatch(PageActions.deleteSelectedRecords(dataType, route)),
    onDeleteItems: () => dispatch(PageActions.deleteSelectedItems(dataType, route)),
    onDeleteBatches: () => dispatch(PageActions.deleteSelectedBatches(dataType, route)),

    // Editable cell callbacks
    onEditCountedQuantity: (newValue, rowKey) =>
      dispatch(PageActions.editCountedQuantity(newValue, rowKey, route)),
    onEditSensorName: (newValue, rowKey) =>
      dispatch(PageActions.editSensorName(newValue, rowKey, route)),
    onEditLocationCode: (newValue, rowKey) =>
      dispatch(PageActions.editLocationCode(newValue, rowKey, route)),
    onEditLocationDescription: (newValue, rowKey) =>
      dispatch(PageActions.editLocationDescription(newValue, rowKey, route)),
    onEditTransactionBatchName: (newValue, rowKey) =>
      dispatch(PageActions.editTransactionBatchName(newValue, rowKey, route)),
    onEditBatchDoses: (newValue, rowKey) =>
      dispatch(PageActions.editBatchDoses(newValue, rowKey, route)),
    onEditRequiredQuantity: (newValue, rowKey) =>
      dispatch(PageActions.editRequisitionItemRequiredQuantity(newValue, rowKey, route)),
    onEditTotalQuantity: (newValue, rowKey) =>
      dispatch(PageActions.editTotalQuantity(newValue, rowKey, route)),
    onEditSuppliedQuantity: (newValue, rowKey) =>
      dispatch(PageActions.editSuppliedQuantity(newValue, rowKey, route)),
    onEditDate: (date, rowKey) =>
      dispatch(PageActions.editTransactionBatchExpiryDate(date, rowKey, route)),
    onEditBatch: rowKey =>
      dispatch(PageActions.openModal(MODAL_KEYS.EDIT_STOCKTAKE_BATCH, rowKey, route)),
    onEditSellPrice: (newValue, rowKey) =>
      dispatch(PageActions.editSellPrice(newValue, rowKey, route)),
    dispatch,
    onToggleColumnSet: () => dispatch(PageActions.toggleColumnSet(route)),
  };

  return dispatches;
};
