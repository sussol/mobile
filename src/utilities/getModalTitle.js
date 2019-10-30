/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { modalStrings, buttonStrings } from '../localization';

export const MODAL_KEYS = {
  STOCKTAKE_COMMENT_EDIT: 'stocktakeCommentEdit',
  STOCKTAKE_NAME_EDIT: 'stocktakeNameEdit',
  TRANSACTION_COMMENT_EDIT: 'transactionCommentEdit',
  REQUISITION_COMMENT_EDIT: 'requisitionCommentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  SELECT_ITEM: 'selectItem',
  SELECT_MONTH: 'selectMonth',
  SELECT_CUSTOMER: 'selectCustomer',
  SELECT_INTERNAL_SUPPLIER: 'selectInternalSupplier',
  SELECT_EXTERNAL_SUPPLIER: 'selectExternalSupplier',
  SELECT_LANGUAGE: 'selectLanguage',
  PROGRAM_REQUISITION: 'programRequisition',
  PROGRAM_STOCKTAKE: 'programStocktake',
  VIEW_REGIMEN_DATA: 'viewRegimenData',
  EDIT_STOCKTAKE_BATCH: 'editStocktakeBatch',
  STOCKTAKE_OUTDATED_ITEM: 'stocktakeOutdatedItems',
  STOCKTAKE_REASON: 'stocktakeReason',
  ENFORCE_STOCKTAKE_REASON: 'enforceStocktakeReason',
};

export const getModalTitle = modalKey => {
  switch (modalKey) {
    default:
      return '';
    case MODAL_KEYS.SELECT_LANGUAGE:
      return modalStrings.select_a_language;
    case MODAL_KEYS.SELECT_MONTH:
      return modalStrings.select_the_number_of_months_stock_required;
    case MODAL_KEYS.STOCKTAKE_NAME_EDIT:
      return modalStrings.edit_the_stocktake_name;
    case MODAL_KEYS.STOCKTAKE_COMMENT_EDIT:
      return modalStrings.edit_the_stocktake_comment;
    case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
      return modalStrings.edit_the_requisition_comment;
    case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
      return modalStrings.edit_the_invoice_comment;
    case MODAL_KEYS.SELECT_ITEM:
      return modalStrings.search_for_an_item_to_add;
    case MODAL_KEYS.THEIR_REF_EDIT:
      return modalStrings.edit_their_reference;
    case MODAL_KEYS.SELECT_CUSTOMER:
      return modalStrings.search_for_the_customer;
    case MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER:
    case MODAL_KEYS.SELECT_INTERNAL_SUPPLIER:
      return modalStrings.search_for_the_supplier;
    case MODAL_KEYS.VIEW_REGIMEN_DATA:
      return buttonStrings.view_regimen_data;
    case MODAL_KEYS.ENFORCE_STOCKTAKE_REASON:
    case MODAL_KEYS.STOCKTAKE_REASON:
      return modalStrings.select_a_reason;
  }
};
