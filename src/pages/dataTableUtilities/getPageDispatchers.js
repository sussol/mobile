/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

// eslint-disable-next-line import/no-cycle
import { BasePageActions } from './actions/getPageActions';
import { MODAL_KEYS } from '../../utilities/getModalTitle';
import { debounce } from '../../utilities/underscoreMethods';
import { gotoStocktakeManagePage } from '../../navigation/actions';

export const getPageDispatchers = (dispatch, props, dataType, route) => {
  const { pageObject } = props;

  const dispatches = {
    // Editing of PageInfo
    onEditName: value => dispatch(BasePageActions.editPageObjectName(value, dataType, route)),
    onNameChange: value => dispatch(BasePageActions.editName(value, route)),
    onEditComment: value => dispatch(BasePageActions.editComment(value, dataType, route)),
    onEditTheirRef: value => dispatch(BasePageActions.editTheirRef(value, dataType, route)),
    onEditMonth: value => dispatch(BasePageActions.editMonthsToSupply(value, route)),

    // Full table manipulation
    refreshData: () => dispatch(BasePageActions.refreshData(route)),
    onResetStocktake: () => dispatch(BasePageActions.resetStocktake(route)),
    toggleSelectAll: () => dispatch(BasePageActions.toggleSelectAll(route)),
    toggleFinalised: () => dispatch(BasePageActions.toggleShowFinalised(route)),
    toggleStockOut: () => dispatch(BasePageActions.toggleStockOut(route)),
    onFilterData: debounce(value => dispatch(BasePageActions.filterData(value, route)), 75),
    onFilterIndicatorData: debounce(
      value => dispatch(BasePageActions.filterIndicatorData(value, route)),
      75
    ),
    onToggleIndicators: () => {
      dispatch(BasePageActions.toggleIndicators(route));
      dispatch(BasePageActions.refreshData(route));
    },
    onToggleTransactionType: () => dispatch(BasePageActions.toggleTransactionType(route)),
    onSelectIndicator: indicatorCode =>
      dispatch(BasePageActions.selectIndicator(indicatorCode, route)),
    onShowOverStocked: () => dispatch(BasePageActions.showOverStocked(route)),
    onHideOverStocked: () => dispatch(BasePageActions.hideOverStocked(route)),
    onDeselectAll: () => dispatch(BasePageActions.deselectAll(route)),
    onSetRequestedToSuggested: () => dispatch(BasePageActions.setRequestedToSuggested(route)),
    onSortColumn: columnKey => dispatch(BasePageActions.sortData(columnKey, route)),

    onEditIndicatorValue: (value, rowKey, columnKey) =>
      dispatch(BasePageActions.editIndicatorValue(value, rowKey, columnKey, route)),

    // Modals
    onOpenRegimenDataModal: () =>
      dispatch(BasePageActions.openModal(MODAL_KEYS.VIEW_REGIMEN_DATA, route)),
    onOpenOutdatedItemModal: () =>
      dispatch(BasePageActions.openModal(MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM, route)),
    onEditReason: rowKey =>
      dispatch(BasePageActions.openModal(MODAL_KEYS.STOCKTAKE_REASON, rowKey, route)),
    onEditRequisitionReason: rowKey =>
      dispatch(BasePageActions.openModal(MODAL_KEYS.REQUISITION_REASON, rowKey, route)),
    onNewCashTransaction: () =>
      dispatch(BasePageActions.openModal(MODAL_KEYS.CREATE_CASH_TRANSACTION, route)),
    onNewCustomerInvoice: () =>
      dispatch(BasePageActions.openModal(MODAL_KEYS.SELECT_CUSTOMER, route)),
    onNewPrescription: () => dispatch(BasePageActions.openModal(MODAL_KEYS.SELECT_PATIENT, route)),
    onCloseModal: () => dispatch(BasePageActions.closeModal(route)),

    // Modal callbacks
    onApplyReason: ({ item }) => dispatch(BasePageActions.applyReason(item, route)),
    onConfirmBatchEdit: () => dispatch(BasePageActions.closeAndRefresh(route)),
    // Adding items/batch rows.
    onAddTransactionBatch: item => dispatch(BasePageActions.addTransactionBatch(item, route)),
    onAddStocktakeBatch: () => dispatch(BasePageActions.addStocktakeBatch(route)),
    onAddTransactionItem: item => dispatch(BasePageActions.addItem(item, 'TransactionItem', route)),
    onAddStocktakeItem: item => dispatch(BasePageActions.addItem(item, 'StocktakeItem', route)),
    onAddRequisitionItem: item => dispatch(BasePageActions.addItem(item, 'RequisitionItem', route)),
    onAddCashTransaction: item => dispatch(BasePageActions.addCashTransaction(item, route)),
    onSelectNewItem: () => dispatch(BasePageActions.openModal(MODAL_KEYS.SELECT_ITEM, route)),

    // Master list
    onAddMasterList: () =>
      dispatch(BasePageActions.openModal(MODAL_KEYS.SELECT_MASTER_LISTS, route)),
    onApplyMasterLists: selected =>
      dispatch(BasePageActions.addMasterListItems(selected, pageObject, route)),

    // Navigation
    onManageStocktake: name => dispatch(gotoStocktakeManagePage(name, pageObject, route)),

    // Row selections
    onSelectRow: ({ id }) => dispatch(BasePageActions.selectOneRow(id, route)),
    onDeselectRow: () => dispatch(BasePageActions.deselectOneRow(route)),
    onCheck: rowKey => dispatch(BasePageActions.selectRow(rowKey, route)),
    onUncheck: rowKey => dispatch(BasePageActions.deselectRow(rowKey, route)),
    onFocusCell: rowKey => dispatch(BasePageActions.focusCell(rowKey, route)),

    // Deletions
    onDeleteRecords: () => dispatch(BasePageActions.deleteSelectedRecords(dataType, route)),
    onDeleteItems: () => dispatch(BasePageActions.deleteSelectedItems(dataType, route)),
    onDeleteBatches: () => dispatch(BasePageActions.deleteSelectedBatches(dataType, route)),

    // Editable cell callbacks
    onEditTransactionBatchName: (newValue, rowKey) =>
      dispatch(BasePageActions.editTransactionBatchName(newValue, rowKey, route)),
    onEditRequiredQuantityWithReason: (newValue, rowKey) =>
      dispatch(
        BasePageActions.editRequisitionItemRequiredQuantityWithReason(newValue, rowKey, route)
      ),
    onEditRequiredQuantity: (newValue, rowKey) =>
      dispatch(BasePageActions.editRequisitionItemRequiredQuantity(newValue, rowKey, route)),
    onEditTotalQuantity: (newValue, rowKey) =>
      dispatch(BasePageActions.editTotalQuantity(newValue, rowKey, route)),
    onEditSuppliedQuantity: (newValue, rowKey) =>
      dispatch(BasePageActions.editSuppliedQuantity(newValue, rowKey, route)),
    onEditDate: (date, rowKey) =>
      dispatch(BasePageActions.editTransactionBatchExpiryDate(date, rowKey, route)),
    onEditBatch: rowKey =>
      dispatch(BasePageActions.openModal(MODAL_KEYS.EDIT_STOCKTAKE_BATCH, rowKey, route)),
    onEditSellPrice: (newValue, rowKey) =>
      dispatch(BasePageActions.editSellPrice(newValue, rowKey, route)),
  };

  return dispatches;
};
