/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// import { CURRENT_LANGUAGE } from '../settings';
const CURRENT_LANGUAGE = 'en'; // settings not set up for this yet

const strings = {
  en: {
    add_at_least_one_item_before_finalising: 'You need to add at least one item before finalising (en)',
    are_you_sure_you_want_to_remove_these_items: 'Are you sure you want to remove these items? (en)',
    edit_the_requisition_comment: 'Edit the requisition comment (en)',
    finalise_customer_invoice: 'Finalise will lock this invoice permanently. (en)',
    finalise_requisition: 'Finalise will send this requisition and lock it permanently. (en)',
    finalise_stocktake: 'Finalise will adjust inventory and lock this stocktake permanently. (en)',
    finalise_supplier_invoice: 'Finalise will adjust inventory and lock this invoice permanently. (en)',
    record_stock_required_before_finalising: 'You need to record how much stock is required before finalising (en)',
    remove: 'Remove',
    search_for_an_item_to_add: 'Search for an item to add (en)',
    select_the_number_of_months_stock_required: 'Select the number of months stock required (en)',
  },
  tetum: {
  },
};

export const modalStrings = strings[CURRENT_LANGUAGE];
