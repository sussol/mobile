/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { modalStrings } from '../localization';

export const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

export const getModalTitle = modalKey => {
  switch (modalKey) {
    default:
    case MODAL_KEYS.ITEM_SELECT:
      return modalStrings.search_for_an_item_to_add;
    case MODAL_KEYS.COMMENT_EDIT:
      return modalStrings.edit_the_invoice_comment;
    case MODAL_KEYS.THEIR_REF_EDIT:
      return modalStrings.edit_their_reference;
  }
};
