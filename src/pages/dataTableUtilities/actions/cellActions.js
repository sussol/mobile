/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../../database';
import { parsePositiveInteger, MODAL_KEYS } from '../../../utilities';
import { ACTIONS } from './constants';
import { openModal, closeModal } from './pageActions';

/**
 * Refreshes a row in the DataTable component.
 * Use case: editing a field of a realm object and ensuring the
 * UI is updated.
 *
 * @param {String} rowKey Key of the row to edit.
 */
export const refreshRow = rowKey => ({ type: ACTIONS.REFRESH_ROW, payload: { rowKey } });

/**
 * Edits a rows underlying `batch` field.
 *
 * @param {Date}    value       The new batch name value.
 * @param {String}  rowKey      Key of the row to edit.
 * @param {String}  objectType  Type of object to edit i.e. 'TransactionBatch'
 */
export const editBatchName = (value, rowKey, objectType) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  const { batch } = objectToEdit;

  if (value !== batch) {
    UIDatabase.write(() => UIDatabase.update(objectType, { ...objectToEdit, batch: value }));

    dispatch(refreshRow(rowKey));
  }
};

/**
 * Wrapper around editBatchName for StocktakeBatches
 */
export const editStocktakeBatchName = (value, rowKey) =>
  editBatchName(value, rowKey, 'StocktakeBatch');

/**
 * Edits a rows underlying `expiryDate` field.
 *
 * @param {Date}    newDate     The new date to set as the expiry.
 * @param {String}  rowKey      Key of the row to edit.
 * @param {String}  objectType  Type of object to edit i.e. 'TransactionBatch'
 */
export const editExpiryDate = (newDate, rowKey, objectType) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.expiryDate = newDate;
    UIDatabase.save(objectType, objectToEdit);
  });

  dispatch(refreshRow(rowKey));
};

/**
 * Wrapper around editExpiryDate.
 */
export const editTransactionBatchExpiryDate = (newDate, rowKey) =>
  editExpiryDate(newDate, rowKey, 'TransactionBatch');

export const editStocktakeBatchExpiryDate = (newDate, rowKey) =>
  editExpiryDate(newDate, rowKey, 'StocktakeBatch');

/**
 * Edits the field `totalQuantity` of a rows underlying data object.
 *
 * @param {String|Number} value      The new value to set (parsed as a positive integer)
 * @param {String}        rowKey     The key of the row to edit.
 */
export const editTotalQuantity = (value, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.setTotalQuantity(UIDatabase, parsePositiveInteger(value));
  });

  dispatch(refreshRow(rowKey));
};

/**
 * Edits a rows underlying `suggestedQuantity` field.
 *
 * @param {String|Number}   value       The new value to set as the required quantity.
 * @param {String}          rowKey      Key of the row to edit.
 * @param {String}          objectType  Type of object to edit i.e. 'RequisitionItem'
 */
export const editSuppliedQuantity = (value, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => objectToEdit.setSuppliedQuantity(UIDatabase, parsePositiveInteger(value)));

  dispatch(refreshRow(rowKey));
};

/**
 * Edits a rows underlying `requiredQuantity` field.
 *
 * @param {String|Number}   value       The new value to set as the required quantity.
 * @param {String}          rowKey      Key of the row to edit.
 * @param {String}          objectType  Type of object to edit i.e. 'RequisitionItem'
 */
export const editRequiredQuantity = (value, rowKey, objectType) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.requiredQuantity = parsePositiveInteger(value);
    UIDatabase.save(objectType, objectToEdit);
  });

  dispatch(refreshRow(rowKey));
};

/**
 * Wrapper around editRequiredQuantity.
 */
export const editRequisitionItemRequiredQuantity = (value, rowKey) =>
  editRequiredQuantity(value, rowKey, 'RequisitionItem');

/**
 * Edits a rows underlying countedTotalQuantity field.
 *
 * @param {String|Number}   value   The new value to set as the ccounted total quantity.
 * @param {String}          rowKey  Key of the row to edit.
 */
export const editCountedQuantity = (value, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  objectToEdit.setCountedTotalQuantity(UIDatabase, parsePositiveInteger(value));

  dispatch(refreshRow(rowKey));
};

/**
 * Edits a StocktakeBatches underlying `countedTotalQuantity`
 *
 * @param {String|Number}   value  New value for the underlying `countedTotalQuantity` field
 * @param {String}          rowKey Key of the row to edit.
 */
export const editStocktakeBatchCountedQuantity = (value, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.countedTotalQuantity = value;
    UIDatabase.save('StocktakeBatch', UIDatabase);
  });

  dispatch(refreshRow(rowKey));
};

/**
 * Removes a reason from a rows underlying data.
 *
 * @param {String} rowKey   Key for the row to edit.
 */
export const removeReason = rowKey => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  objectToEdit.removeReason(UIDatabase);

  dispatch(refreshRow(rowKey));
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
export const enforceReasonChoice = rowKey => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  if (!objectToEdit) return null;

  const { difference } = objectToEdit;
  // If there's no difference, just remove the reason
  if (!difference) return dispatch(removeReason(rowKey));

  const { validateReason } = objectToEdit;
  if (!validateReason) return dispatch(openModal(MODAL_KEYS.ENFORCE_STOCKTAKE_REASON, rowKey));

  return null;
};

/**
 * Applys a passed reason to the underlying row data. Can be a StocktakeItem
 * or StocktakeBatch.
 *
 * @param {Realm.Option} value Reason to apply to the underlying rorw.
 */
export const applyReason = value => (dispatch, getState) => {
  const { modalValue, keyExtractor } = getState();

  modalValue.applyReason(UIDatabase, value);

  const rowKey = keyExtractor(modalValue);

  dispatch(closeModal());
  dispatch(refreshRow(rowKey));
};

export const CellActionsLookup = {
  refreshRow,
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
  editStocktakeBatchName,
};

/**
 * =====================================================================
 *
 *                             Overrides
 *
 * Below are actions which are overrides of base actions.
 *
 * Example: editCountedQuantityWithReason overrides editCountedQuantity
 * for a stocktakeEditPage when reasons are defined.
 *
 * =====================================================================
 */

/**
 * Wrapper around `editCountedTotalQuantity`, splitting the action to enforce a
 * reason also.
 *
 * @param {String|Number}   value  New value for the underlying `countedTotalQuantity` field
 * @param {String}          rowKey Key of the row to edit.
 */
export const editCountedQuantityWithReason = (value, rowKey) => dispatch => {
  dispatch(editCountedQuantity(value, rowKey));
  dispatch(enforceReasonChoice(rowKey));
};

/**
 * Wrapper around `editStocktakeBatchCountedQuantity`, splitting the action to enforce a
 * reason also.
 *
 * @param {String|Number}   value  New value for the underlying `countedTotalQuantity` field
 * @param {String}          rowKey Key of the row to edit.
 */
export const editStocktakeBatchCountedQuantityWithReason = (value, rowKey) => dispatch => {
  dispatch(editStocktakeBatchCountedQuantity(value, rowKey));
  dispatch(enforceReasonChoice(rowKey));
};
