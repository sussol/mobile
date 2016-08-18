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
    and: 'and (en)',
    cancel: 'Cancel (en)',
    confirm: 'Confirm (en)',
    create: 'Create (en)',
    delete_these_invoices: 'Are you sure you want to delete these invoices? (en)',
    delete_these_requisitions: 'Are you sure you want to delete these requisitions? (en)',
    delete_these_stocktakes: 'Are you sure you want to delete these stocktakes? (en)',
    delete: 'Delete (en)',
    edit_the_invoice_comment: 'Edit the invoice comment (en)',
    edit_the_requisition_comment: 'Edit the requisition comment (en)',
    edit_their_reference: 'Edit their reference (en)',
    finalise_customer_invoice: 'Finalise will lock this invoice permanently. (en)',
    finalise_requisition: 'Finalise will send this requisition and lock it permanently. (en)',
    finalise_stocktake: 'Finalise will adjust inventory and lock this stocktake permanently. (en)',
    finalise_supplier_invoice: 'Finalise will adjust inventory and lock this invoice permanently. (en)',
    following_items_reduced_more_than_available_stock: 'The following items have been reduced by more than the available stock: (en)',
    give_your_stocktake_a_name: 'Give your stocktake a name (en)',
    got_it: 'Got it (en)',
    more: 'more (en)',
    record_stock_required_before_finalising: 'You need to record how much stock is required before finalising (en)',
    record_stock_to_issue_before_finalising: 'You need to record how much stock to issue before finalising (en)',
    remove_these_items: 'Are you sure you want to remove these items? (en)',
    remove: 'Remove (en)',
    search_for_an_item_to_add: 'Search for an item to add (en)',
    search_for_the_customer: 'Search for the customer (en)',
    select_the_number_of_months_stock_required: 'Select the number of months stock required (en)',
    start_typing_to_select_customer: 'Start typing to select customer (en)',
    stocktake_no_counted_items: "Can't finalise a stocktake with no counted items (en)",
  },
  tetum: {
  },
};

export const modalStrings = strings[CURRENT_LANGUAGE];
