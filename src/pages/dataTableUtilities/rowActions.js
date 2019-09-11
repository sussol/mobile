/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../database/index';
import { ACTIONS } from './constants';

/**
 * Uses the stores dataState map to set a row/column
 * to isFocused.
 * use case: react-native bug where rendering 100+ TextInput
 * components causes the app to crash. When a table needs a
 * large number of TextInputs, need to render View's when not
 * focused so using imperative focus handling is not possible.
 *
 * @param {String} rowKey       Key of the row to focus.
 * @param {String} columnKey    Key of the column to focus.
 */
export const focusCell = (rowKey, columnKey) => ({
  type: ACTIONS.FOCUS_CELL,
  payload: { rowKey, columnKey },
});

/**
 * Uses the stores dataState map to set a row/column
 * to isFocused. Will focus the cell after the currently
 * focused cell.
 * use case: react-native bug where rendering 100+ TextInput
 * components causes the app to crash. When a table needs a
 * large number of TextInputs, need to render View's when not
 * focused so using imperative focus handling is not possible.
 *
 * @param {String} rowKey       Key of the row to focus.
 * @param {String} columnKey    Key of the column to focus.
 */
export const focusNext = (rowKey, columnKey) => ({
  type: ACTIONS.FOCUS_NEXT,
  payload: { rowKey, columnKey },
});

/**
 * Uses the stores dataState map to set a row to
 * isSelected.
 *
 * @param {String} rowKey       Key of the row to focus.
 * @param {String} columnKey    Key of the column to focus.
 */
export const selectRow = rowKey => ({
  type: ACTIONS.SELECT_ROW,
  payload: { rowKey },
});

/**
 * Uses the stores dataState map to remove a rows
 * isSelected state.
 *
 * @param {String} rowKey       Key of the row to focus.
 * @param {String} columnKey    Key of the column to focus.
 */
export const deselectRow = rowKey => ({
  type: ACTIONS.DESELECT_ROW,
  payload: { rowKey },
});

/**
 * Removes isSelected field in all rows of the stores dataState map.
 */
export const deselectAll = () => ({
  type: ACTIONS.DESELECT_ALL,
});

/**
 * Adds isSelected field in all rows of the stores dataState map.
 */
export const selectAll = () => ({
  type: ACTIONS.SELECT_ALL,
});

/**
 * Sets all rowState objects within the passed items array,
 * in the stores dataState map to isSelected
 *
 * @param {Array} items Row data objects to be set as selected.
 */
export const selectItems = items => ({
  type: ACTIONS.SELECT_ITEMS,
  payload: { items },
});

/**
 * Removes all items which are selected from the underlying pageObject.
 * use case: Removing a selection of items from a Transaction, Requisition
 * or Stocktake.
 *
 * @param {String} pageObjectType Type of the underlying pageObject, i.e. Transaction.
 */
export const deleteSelectedItems = pageObjectType => (dispatch, getState) => {
  const { dataState, pageObject } = getState();

  const itemIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  UIDatabase.write(() => {
    pageObject.removeItemsById(UIDatabase, itemIds);
    UIDatabase.save(pageObjectType, pageObject);
  });

  dispatch({ type: ACTIONS.DELETE_RECORDS });
};

/**
 * Deletes all selected records. Should be used for non-item based records i.e.
 * Transactions, Stocktakes or Requisitions.
 *
 * @param {String} recordType
 */
export const deleteSelectedRecords = recordType => (dispatch, getState) => {
  const { dataState, backingData } = getState();

  const recordIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  const transactionsToDelete = recordIds.reduce((acc, recordId) => {
    const record = backingData.filtered('id = $0', recordId)[0];
    const shouldDelete = record && record.isValid() && !record.isFinalised;
    if (shouldDelete) return [...acc, record];
    return acc;
  }, []);

  UIDatabase.write(() => {
    UIDatabase.delete(recordType, transactionsToDelete);
  });

  dispatch({ type: ACTIONS.DELETE_RECORDS });
};

/**
 * Wrappers for easy calling of delete action creators.
 */
export const deleteTransactions = () => deleteSelectedRecords('Transaction');
export const deleteRequisitions = () => deleteSelectedRecords('Requisition');
export const deleteStocktakes = () => deleteSelectedRecords('Stocktake');
export const deleteTransactionItems = () => deleteSelectedItems('TransactionItem');
export const deleteTransactionBatches = () => deleteSelectedItems('TransactionBatch');
export const deleteRequisitionItems = () => deleteSelectedItems('RequisitionItem');
export const deleteStocktakeItems = () => deleteSelectedItems('StocktakeItem');
