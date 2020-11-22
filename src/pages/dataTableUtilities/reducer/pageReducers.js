/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { MODAL_KEYS, formatErrorItemNames } from '../../../utilities';
import { UIDatabase } from '../../../database/index';
import { SETTINGS_KEYS } from '../../../settings';
import Settings from '../../../settings/MobileAppSettings';

export const updatePaymentType = (state, action) => {
  const { payload } = action;
  const { paymentType } = payload ?? {};

  return { ...state, currentPaymentType: paymentType };
};

export const openDatePicker = state => ({ ...state, datePickerIsOpen: true });

export const closeDatePicker = state => ({ ...state, datePickerIsOpen: false });

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

    case MODAL_KEYS.ENFORCE_REQUISITION_REASON:
    case MODAL_KEYS.REQUISITION_REASON:
    case MODAL_KEYS.SELECT_ITEM_BATCH_SUPPLIER:
    case MODAL_KEYS.EDIT_STOCKTAKE_BATCH:
    case MODAL_KEYS.SELECT_SENSOR_LOCATION:
    case MODAL_KEYS.SELECT_LOCATION:
    case MODAL_KEYS.SELECT_VVM_STATUS:
    case MODAL_KEYS.EDIT_LOCATION:
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

    case MODAL_KEYS.SELECT_MASTER_LISTS: {
      let masterLists = [];
      const { pageObject } = state;
      const { route } = payload;

      switch (route) {
        case 'supplierRequisition':
          masterLists = UIDatabase.objects('Name').filtered(
            'id == $0',
            Settings.get(SETTINGS_KEYS.THIS_STORE_NAME_ID)
          )[0].masterLists;
          break;
        case 'customerInvoice':
          masterLists = pageObject.otherParty.masterLists;
          break;
        default:
          masterLists = [];
      }

      return { ...state, modalKey, modalValue: masterLists };
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

export const PageReducerLookup = {
  editName,
  openModal,
  closeModal,
  updatePaymentType,
  openDatePicker,
  closeDatePicker,
};
