/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../../database';
import { parsePositiveInteger, MODAL_KEYS } from '../../../utilities';
import {
  getIndicatorRow,
  getIndicatorColumn,
  updateIndicatorValue,
  getIndicatorRowColumnValue,
} from '../../../database/utilities/getIndicatorData';
import { ACTIONS } from './constants';
import { openModal, closeModal } from './pageActions';
import { pageStateSelector } from '../selectors/pageSelectors';

/**
 * Refreshes a row in the DataTable component.
 * Use case: editing a field of a realm object and ensuring the
 * UI is updated.
 *
 * @param {String} rowKey Key of the row to edit.
 */
export const refreshRow = (rowKey, route) => ({
  type: ACTIONS.REFRESH_ROW,
  payload: { rowKey, route },
});

export const refreshIndicatorRow = route => ({
  type: 'refreshIndicatorRow',
  payload: { route },
});

/**
 * Edits a rows underlying `batch` field.
 *
 * @param {Date}    value       The new batch name value.
 * @param {String}  rowKey      Key of the row to edit.
 * @param {String}  objectType  Type of object to edit i.e. 'TransactionBatch'
 */
export const editBatchName = (value, rowKey, objectType, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    const { batch } = objectToEdit;

    if (value !== batch) {
      UIDatabase.write(() => UIDatabase.update(objectType, { ...objectToEdit, batch: value }));

      dispatch(refreshRow(rowKey, route));
    }
  }
};

export const editIndicatorValue = (value, rowKey, columnKey, route) => (dispatch, getState) => {
  const { indicatorRows, indicatorColumns, pageObject } = pageStateSelector(getState());
  const { period } = pageObject;
  const row = getIndicatorRow(indicatorRows, rowKey);
  const column = getIndicatorColumn(indicatorColumns, columnKey);
  const indicatorValue = getIndicatorRowColumnValue(row, column, period);
  updateIndicatorValue(indicatorValue, value);
  dispatch(refreshIndicatorRow(route));
};

/**
 * Wrapper around editBatchName for StocktakeBatches
 */
export const editStocktakeBatchName = (value, rowKey, route) =>
  editBatchName(value, rowKey, 'StocktakeBatch', route);

/**
 * Edits a rows underlying `expiryDate` field.
 *
 * @param {Date}    newDate     The new date to set as the expiry.
 * @param {String}  rowKey      Key of the row to edit.
 * @param {String}  objectType  Type of object to edit i.e. 'TransactionBatch'
 */
export const editExpiryDate = (newDate, rowKey, objectType, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    UIDatabase.write(() => {
      objectToEdit.expiryDate = newDate;
      UIDatabase.save(objectType, objectToEdit);
    });

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Wrapper around editExpiryDate.
 */
export const editTransactionBatchExpiryDate = (newDate, rowKey, route) =>
  editExpiryDate(newDate, rowKey, 'TransactionBatch', route);

export const editStocktakeBatchExpiryDate = (newDate, rowKey, route) =>
  editExpiryDate(newDate, rowKey, 'StocktakeBatch', route);

/**
 * Edits the field `totalQuantity` of a rows underlying data object.
 *
 * @param {String|Number} value      The new value to set (parsed as a positive integer)
 * @param {String}        rowKey     The key of the row to edit.
 */
export const editTotalQuantity = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    UIDatabase.write(() => {
      objectToEdit.setTotalQuantity(UIDatabase, parsePositiveInteger(value));
    });

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Edits a rows underlying `suggestedQuantity` field.
 *
 * @param {String|Number}   value       The new value to set as the required quantity.
 * @param {String}          rowKey      Key of the row to edit.
 * @param {String}          objectType  Type of object to edit i.e. 'RequisitionItem'
 */
export const editSuppliedQuantity = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    UIDatabase.write(() =>
      objectToEdit.setSuppliedQuantity(UIDatabase, parsePositiveInteger(value))
    );

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Edits a rows underlying `requiredQuantity` field.
 *
 * @param {String|Number}   value       The new value to set as the required quantity.
 * @param {String}          rowKey      Key of the row to edit.
 * @param {String}          objectType  Type of object to edit i.e. 'RequisitionItem'
 */
export const editRequiredQuantity = (value, rowKey, objectType, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    UIDatabase.write(() => {
      objectToEdit.requiredQuantity = parsePositiveInteger(value);
      UIDatabase.save(objectType, objectToEdit);
    });

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Wrapper around editRequiredQuantity.
 */
export const editRequisitionItemRequiredQuantity = (value, rowKey, route) =>
  editRequiredQuantity(value, rowKey, 'RequisitionItem', route);

/**
 * Edits a rows underlying countedTotalQuantity field.
 *
 * @param {String|Number}   value   The new value to set as the ccounted total quantity.
 * @param {String}          rowKey  Key of the row to edit.
 */
export const editCountedQuantity = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    objectToEdit.setCountedTotalQuantity(UIDatabase, parsePositiveInteger(value));

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Edits a StocktakeBatches underlying `countedTotalQuantity`
 *
 * @param {String|Number}   value  New value for the underlying `countedTotalQuantity` field
 * @param {String}          rowKey Key of the row to edit.
 */
export const editStocktakeBatchCountedQuantity = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    UIDatabase.write(() => {
      objectToEdit.countedTotalQuantity = parsePositiveInteger(value);
      UIDatabase.save('StocktakeBatch', UIDatabase);
    });

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Removes a reason from a rows underlying data.
 *
 * @param {String} rowKey   Key for the row to edit.
 */
export const removeReason = (rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    objectToEdit.removeReason(UIDatabase);

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Handles reason logic for a particular object (stocktakeBatch or
 * StocktakeItem) - if there is a difference (between snapshot and
 * countedTotalQuantity) - then a reason should be related to this
 * object. For negative adjustments, a negativeInventoryAdjustment
 * reason should be applied. If positive, a positiveInventoryAdjustment.
 * A correct reason
 * If there is already a reason, do nothing. If there is no
 * difference, but a reason has been previously applied, remove it.
 *
 * @param {String} rowKey Key of the row to enforce a reason on
 */
export const enforceReasonChoice = (rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = pageStateSelector(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  if (!objectToEdit) return null;

  const { difference } = objectToEdit;
  // If there's no difference, just remove the reason
  if (!difference) return dispatch(removeReason(rowKey, route));

  const { validateReason } = objectToEdit;
  if (!validateReason) {
    return dispatch(openModal(MODAL_KEYS.ENFORCE_STOCKTAKE_REASON, rowKey, route));
  }
  return null;
};

/**
 * Applys a passed reason to the underlying row data. Can be a StocktakeItem
 * or StocktakeBatch.
 *
 * @param {Realm.Option} value Reason to apply to the underlying rorw.
 */
export const applyReason = (value, route) => (dispatch, getState) => {
  const { modalValue, keyExtractor } = pageStateSelector(getState());

  modalValue.applyReason(UIDatabase, value);

  const rowKey = keyExtractor(modalValue);

  dispatch(closeModal(route));
  dispatch(refreshRow(rowKey, route));
};

/**
 * Wrapper around `editCountedTotalQuantity`, splitting the action to enforce a
 * reason also.
 *
 * @param {String|Number}   value  New value for the underlying `countedTotalQuantity` field
 * @param {String}          rowKey Key of the row to edit.
 */
export const editCountedQuantityWithReason = (value, rowKey, route) => dispatch => {
  dispatch(editCountedQuantity(value, rowKey, route));
  dispatch(enforceReasonChoice(rowKey, route));
};

/**
 * Wrapper around `editStocktakeBatchCountedQuantity`, splitting the action to enforce a
 * reason also.
 *
 * @param {String|Number}   value  New value for the underlying `countedTotalQuantity` field
 * @param {String}          rowKey Key of the row to edit.
 */
export const editStocktakeBatchCountedQuantityWithReason = (value, rowKey, route) => dispatch => {
  dispatch(editStocktakeBatchCountedQuantity(value, rowKey, route));
  dispatch(enforceReasonChoice(rowKey, route));
};

export const CellActionsLookup = {
  refreshRow,
  refreshIndicatorRow,
  editExpiryDate,
  editTransactionBatchExpiryDate,
  editStocktakeBatchExpiryDate,
  editTotalQuantity,
  editSuppliedQuantity,
  editRequiredQuantity,
  editRequisitionItemRequiredQuantity,
  editCountedQuantity,
  editStocktakeBatchCountedQuantity,
  removeReason,
  enforceReasonChoice,
  applyReason,
  editBatchName,
  editIndicatorValue,
  editStocktakeBatchName,
  editCountedQuantityWithReason,
  editStocktakeBatchCountedQuantityWithReason,
};
