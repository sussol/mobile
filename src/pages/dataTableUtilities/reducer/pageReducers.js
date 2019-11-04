/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { MODAL_KEYS, formatErrorItemNames } from '../../../utilities';

/**
 * Edits the name field in the current stores state.
 */
export const editName = (state, action) => {
  const { payload } = action;
  const { value } = payload;

  return { ...state, name: value };
};

/**
 * Sets the passed modalKey as the stores current modalKey, opening
 * a modal. Also sets an optional modalValue for required modals.
 */
export const openModal = (state, action) => {
  const { payload } = action;
  const { modalKey } = payload;

  switch (modalKey) {
    case MODAL_KEYS.VIEW_REGIMEN_DATA: {
      const { pageObject } = state;

      return { ...state, modalKey, modalValue: pageObject };
    }

    case MODAL_KEYS.STOCKTAKE_NAME_EDIT: {
      const { pageObject } = state;
      const { name } = pageObject;

      return { ...state, modalKey, modalValue: name };
    }

    case MODAL_KEYS.ENFORCE_STOCKTAKE_REASON:
    case MODAL_KEYS.EDIT_STOCKTAKE_BATCH:
    case MODAL_KEYS.STOCKTAKE_REASON: {
      const { data, keyExtractor } = state;
      const { rowKey } = payload;

      const modalValue = data.find(row => keyExtractor(row) === rowKey);

      return { ...state, modalKey, modalValue };
    }

    case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
    case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
    case MODAL_KEYS.STOCKTAKE_COMMENT_EDIT: {
      const { pageObject } = state;

      const { comment } = pageObject;

      return { ...state, modalKey, modalValue: comment };
    }

    case MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM: {
      const { pageObject } = state;
      const { itemsOutdated } = pageObject;

      return {
        ...state,
        modalValue: formatErrorItemNames(itemsOutdated),
        modalKey: MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM,
      };
    }

    case MODAL_KEYS.THEIR_REF_EDIT: {
      const { pageObject } = state;

      const { theirRef } = pageObject;

      return { ...state, modalKey, modalValue: theirRef };
    }

    case MODAL_KEYS.SELECT_MONTH: {
      const { pageObject } = state;

      const { monthsToSupply } = pageObject;

      return { ...state, modalKey, modalValue: monthsToSupply };
    }

    default: {
      return { ...state, modalKey };
    }
  }
};

/**
 * Sets the modal open state to false, closing any
 * modal that is open.
 */
export const closeModal = state => ({ ...state, modalKey: '', modalValue: null });

export const PageReducerLookup = { editName, openModal, closeModal };
