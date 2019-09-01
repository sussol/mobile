/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { modalStrings, buttonStrings } from '../localization';

export const MODAL_KEYS = {
  SELECT_CUSTOMER: 'selectCustomer',
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  REQUISITION_COMMENT_EDIT: 'comment',
  ITEM_SELECT: 'itemSelect',
  SELECT_SUPPLIER: 'selectSupplier',
  PROGRAM_REQUISITION: 'programRequisition',
  MONTHS_SELECT: 'monthsToSupply',
  VIEW_REGIMEN_DATA: 'viewRegimenData',
};

export const getModalTitle = modalKey => {
  switch (modalKey) {
    default:
      return '';
    case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
      return modalStrings.edit_the_requisition_comment;
    case MODAL_KEYS.ITEM_SELECT:
      return modalStrings.search_for_an_item_to_add;
    case MODAL_KEYS.COMMENT_EDIT:
      return modalStrings.edit_the_invoice_comment;
    case MODAL_KEYS.THEIR_REF_EDIT:
      return modalStrings.edit_their_reference;
    case MODAL_KEYS.SELECT_CUSTOMER:
      return modalStrings.search_for_the_customer;
    case MODAL_KEYS.SELECT_SUPPLIER:
      return modalStrings.search_for_the_supplier;
    case MODAL_KEYS.VIEW_REGIMEN_DATA:
      return buttonStrings.view_regimen_data;
  }
};
