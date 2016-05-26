/* eslint-disable quote-props */

export const INTERNAL_TO_EXTERNAL = 0;
export const EXTERNAL_TO_INTERNAL = 1;

// Map of internal database object types to external record types
export const RECORD_TYPES = new SyncTranslator({
  'Item': 'item',
  'ItemLine': 'item_line',
  'ItemDepartment': 'item_department',
  'ItemCategory': 'item_category',
  'MasterList': 'list_master',
  'MasterListLine': 'list_master_line',
  'Name': 'name',
  'Requisition': 'requisition',
  'RequisitionLine': 'requisition_line',
  'Stocktake': 'Stock_take',
  'StocktakeLine': 'Stock_take_lines',
  'Transaction': 'transact',
  'TransactionCategory': 'transaction_category',
  'TransactionLine': 'trans_line',
  'User': 'user',
});

// Map of internal database change types to external sync types
export const SYNC_TYPES = new SyncTranslator({
  'create': 'C',
  'update': 'U',
  'delete': 'D',
});

// Map of internal statuses to external statuses (of transactions, stocktakes, etc.)
export const STATUSES = new SyncTranslator({
  'confirmed': 'cn',
  'finalised': 'fn',
  'new': 'nw',
});

export const TRANSACTION_TYPES = new SyncTranslator({
  'customer_invoice': 'ci',
  'supplier_invoice': 'si',
});

export const TRANSACTION_LINE_TYPES = new SyncTranslator({
  'customer_invoice': 'stock_out',
  'supplier_invoice': 'stock_in',
});

class SyncTranslator {
  constructor(internalToExternal) {
    this.internalToExternal = internalToExternal;
    this.externalToInternal = {};
    for (const key in internalToExternal) {
      // Guard against prototype values in iterator
      if ({}.hasOwnProperty.call(internalToExternal, key)) {
        const value = internalToExternal[key];
        this.reverseMap[value] = key;
      }
    }
  }

  translate(key, direction) {
    switch (direction) {
      case INTERNAL_TO_EXTERNAL:
        return this.internalToExternal[key];
      case EXTERNAL_TO_INTERNAL:
        return this.externalToInternal[key];
      default:
        return this.internalToExternal[key];
    }
  }
}
