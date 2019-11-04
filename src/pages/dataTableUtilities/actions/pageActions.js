/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../../database/index';
import { MODAL_KEYS } from '../../../utilities';
import { ACTIONS } from './constants';
import { pageObjectSelector, pageStateSelector } from '../selectors';

/**
 * Refreshes the underlying data array by slicing backingData.
 * BackingData is a live realm collection which side effects i.e.
 * finalising can make out of sync with the data array used for display.
 *
 * NOTE: This is a duplicate action to avoid a dependency cycle with
 *       tableActions.js
 */
const refreshData = route => ({ type: ACTIONS.REFRESH_DATA, payload: { route } });

/**
 * Edits the name field in the current store.
 * use case: Stocktake naming.
 *
 * @param {String} value New name value to set.
 */
export const editName = (value, route) => ({ type: ACTIONS.EDIT_NAME, payload: { value, route } });

/**
 * Closes a modal by unsetting the modalKey aand modalValue (if used).
 */
export const closeModal = route => ({ type: ACTIONS.CLOSE_MODAL, payload: { route } });

/**
 * Splitter action creator, assumes the current modalValue is an instance
 * of some rowData - extracting the key and refreshing the row before
 * closing the modal.
 * use case: opening a stocktake batch and refreshing the stocktake edit page row.
 */
export const closeAndRefresh = route => (dispatch, getState) => {
  const { modalValue, keyExtractor } = pageStateSelector(getState());

  const rowKey = keyExtractor(modalValue);

  // Avoiding refresh row dependency cycle.
  dispatch({ type: ACTIONS.REFRESH_ROW, payload: { rowKey, route } });
  dispatch(closeModal(route));
};

/**
 * Opens a modal given a modal key. Can pass an optional value
 * to set as `modalValue`
 *
 * @param {String} modalKey Key for the modal to open
 * @param {Any}    value     Optional value to set as `modalValue` in state.
 */
export const openModal = (modalKey, value, route) => {
  switch (modalKey) {
    case MODAL_KEYS.STOCKTAKE_REASON:
    case MODAL_KEYS.EDIT_STOCKTAKE_BATCH:
    case MODAL_KEYS.ENFORCE_STOCKTAKE_REASON:
      return { type: ACTIONS.OPEN_MODAL, payload: { modalKey, rowKey: value, route } };

    case MODAL_KEYS.MONTHS_SELECT:
    case MODAL_KEYS.PROGRAM_REQUISITION:
    case MODAL_KEYS.PROGRAM_STOCKTAKE:
    case MODAL_KEYS.VIEW_REGIMEN_DATA:
    case MODAL_KEYS.SELECT_ITEM:
    case MODAL_KEYS.SELECT_MONTHS:
    case MODAL_KEYS.SELECT_CUSTOMER:
    case MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER:
    case MODAL_KEYS.SELECT_INTERNAL_SUPPLIER:
    case MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM:
    case MODAL_KEYS.STOCKTAKE_COMMENT_EDIT:
    case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
    case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
    case MODAL_KEYS.THEIR_REF_EDIT:
    default:
      return { type: ACTIONS.OPEN_MODAL, payload: { modalKey, route: route || value } };
  }
};

/**
 * Edits the `name` field of a pageObject.
 *
 * @param {String} value          New name value.
 * @param {String} pageObjectType PageObject type to edit i.e. Transaction.
 */
export const editPageObjectName = (value, pageObjectType, route) => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  const { name } = pageObject;

  if (name !== value) {
    UIDatabase.write(() => {
      UIDatabase.update(pageObjectType, {
        ...pageObject,
        name: value,
      });
    });
  }

  dispatch(closeModal(route));
};

/**
 * Edits the `theirRef` field of a pageObject.
 *
 * @param {String} value          New theifRef value.
 * @param {String} pageObjectType PageObject type to edit i.e. Transaction.
 */
export const editTheirRef = (value, pageObjectType, route) => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  const { theirRef } = pageObject;

  if (theirRef !== value) {
    UIDatabase.write(() => {
      UIDatabase.update(pageObjectType, { ...pageObject, theirRef: value });
    });
  }

  dispatch(closeModal(route));
};

/**
 * Edits the `comment` field of a `pageObject`.
 *
 * @param {String} value          New comment value.
 * @param {String} pageObjectType Type of the pageObject to edit i.e. Transaction.
 */
export const editComment = (value, pageObjectType, route) => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  const { comment } = pageObject;

  if (comment !== value) {
    UIDatabase.write(() => {
      UIDatabase.update(pageObjectType, { ...pageObject, comment: value });
    });
  }

  dispatch(closeModal(route));
};

/**
 * Sets a requisitions `monthsToSupply` field. Refreshing data afterwards
 * for new suggested quantities to be calculated.
 *
 * @param {Number} value  New months of supply value.
 */
export const editMonthsToSupply = (value, route) => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  const { monthsToSupply } = pageObject;

  if (monthsToSupply !== value) {
    UIDatabase.write(() => {
      pageObject.monthsToSupply = value;
      UIDatabase.save('Requisition', pageObject);
    });

    // Update suggested quantities when the monthsToSupply changes.
    dispatch(refreshData(route));
  }

  dispatch(closeModal(route));
};

/**
 * Resets a Stocktake - refreshing all snapshot quantities.
 *
 * use case: Snapshot quantities need to be refreshed if they are
 *           outdated when revisiting an un-finalised Stocktake.
 */
export const resetStocktake = route => (dispatch, getState) => {
  const pageObject = pageObjectSelector(getState());

  pageObject.resetStocktake(UIDatabase);

  dispatch(refreshData(route));
  dispatch(closeModal(route));
};

export const PageActionsLookup = {
  editName,
  closeModal,
  openModal,
  editTheirRef,
  editComment,
  editMonthsToSupply,
  resetStocktake,
  closeAndRefresh,
  editPageObjectName,
};
