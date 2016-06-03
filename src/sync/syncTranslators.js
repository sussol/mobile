/* eslint-disable quote-props */

export const INTERNAL_TO_EXTERNAL = 0;
export const EXTERNAL_TO_INTERNAL = 1;

class SyncTranslator {
  constructor(internalToExternal) {
    this.internalToExternal = internalToExternal;
    this.externalToInternal = {};
    for (const key in internalToExternal) {
      // Guard against prototype values in iterator
      if ({}.hasOwnProperty.call(internalToExternal, key)) {
        const value = internalToExternal[key];
        this.externalToInternal[value] = key;
      }
    }
  }

  translate(key, direction) {
    switch (direction) {
      case INTERNAL_TO_EXTERNAL:
      default:
        return this.internalToExternal[key];
      case EXTERNAL_TO_INTERNAL:
        return this.externalToInternal[key];
    }
  }
}

// Map of internal database object types to external record types
export const RECORD_TYPES = new SyncTranslator({
  'Item': 'item',
  'ItemLine': 'item_line',
  'ItemDepartment': 'item_department',
  'ItemCategory': 'item_category',
  'MasterList': 'list_master',
  'MasterListLine': 'list_master_line',
  'MasterListNameJoin': 'list_group',
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

export const REQUISITION_TYPES = new SyncTranslator({
  'imprest': 'im',
  'forecast': 'sh',
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
  'customer_credit': 'cc',
  'supplier_invoice': 'si',
  'supplier_credit': 'sc',
  'inventory_adjustment': 'in',
});

export const TRANSACTION_LINE_TYPES = new SyncTranslator({
  'customer_invoice': 'stock_out',
  'customer_credit': 'stock_in',
  'supplier_invoice': 'stock_in',
  'supplier_credit': 'stock_out',
});

export const NAME_TYPES = new SyncTranslator({
  'invad': 'inventory_adjustment',
  'facility': 'facility',
  'patient': 'patient',
});
