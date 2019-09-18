/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { tableStrings } from '../../localization';

import { COLUMN_TYPES, COLUMN_KEYS } from './constants';

const PAGE_COLUMN_WIDTHS = {
  customerInvoice: [2, 4, 2, 2, 1],
  supplierInvoice: [2, 4, 2, 2, 1],
  supplierInvoices: [1.5, 2.5, 2, 1.5, 3, 1],
  customerInvoices: [1.5, 2.5, 2, 1.5, 3, 1],
  supplierRequisitions: [1.5, 2, 1, 1, 1, 1],
  supplierRequisition: [1.4, 3.5, 2, 1.5, 2, 2, 1],
  supplierRequisitionWithProgram: [1.5, 3.5, 0.5, 0.5, 2, 1.5, 2, 2, 1],
  stocktakes: [6, 2, 2, 1],
  stocktakeManager: [2, 6, 1],
  stocktakeEditor: [1, 2.8, 1.2, 1.2, 1, 0.8],
  stocktakeEditorWithReasons: [1, 2.8, 1.2, 1.2, 1, 1, 0.8],
  customerRequisitions: [1.5, 2, 1, 1, 1],
  customerRequisition: [2, 4, 1.5, 1.5, 2, 2, 2, 2],
  stocktakeBatchEditModal: [1, 1, 1, 1, 1],
  stocktakeBatchEditModalWithReasons: [1, 1, 1, 1, 1, 1],
  regimenDataModal: [4, 1, 5],
};

const PAGE_COLUMNS = {
  customerInvoice: [
    COLUMN_KEYS.ITEM_CODE,
    COLUMN_KEYS.ITEM_NAME,
    COLUMN_KEYS.AVAILABLE_QUANTITY,
    COLUMN_KEYS.TOTAL_QUANTITY,
    COLUMN_KEYS.REMOVE,
  ],
  customerInvoices: [
    COLUMN_KEYS.INVOICE_NUMBER,
    COLUMN_KEYS.CUSTOMER,
    COLUMN_KEYS.STATUS,
    COLUMN_KEYS.ENTRY_DATE,
    COLUMN_KEYS.COMMENT,
    COLUMN_KEYS.REMOVE,
  ],
  supplierInvoice: [
    COLUMN_KEYS.ITEM_CODE,
    COLUMN_KEYS.ITEM_NAME,
    COLUMN_KEYS.TOTAL_QUANTITY,
    COLUMN_KEYS.EXPIRY_DATE,
    COLUMN_KEYS.REMOVE,
  ],
  supplierInvoices: [
    COLUMN_KEYS.INVOICE_NUMBER,
    COLUMN_KEYS.SUPPLIER,
    COLUMN_KEYS.STATUS,
    COLUMN_KEYS.ENTRY_DATE,
    COLUMN_KEYS.COMMENT,
    COLUMN_KEYS.REMOVE,
  ],
  supplierRequisitions: [
    COLUMN_KEYS.REQUISITION_NUMBER,
    COLUMN_KEYS.SUPPLIER,
    COLUMN_KEYS.NUMBER_OF_ITEMS,
    COLUMN_KEYS.ENTRY_DATE,
    COLUMN_KEYS.STATUS,
    COLUMN_KEYS.REMOVE,
  ],
  supplierRequisition: [
    COLUMN_KEYS.ITEM_CODE,
    COLUMN_KEYS.ITEM_NAME,
    COLUMN_KEYS.OUR_STOCK_ON_HAND,
    COLUMN_KEYS.MONTHLY_USAGE,
    COLUMN_KEYS.SUGGESTED_QUANTITY,
    COLUMN_KEYS.EDITABLE_REQUIRED_QUANTITY,
    COLUMN_KEYS.REMOVE,
  ],
  supplierRequisitionWithProgram: [
    COLUMN_KEYS.ITEM_CODE,
    COLUMN_KEYS.ITEM_NAME,
    COLUMN_KEYS.UNIT,
    COLUMN_KEYS.PRICE,
    COLUMN_KEYS.OUR_STOCK_ON_HAND,
    COLUMN_KEYS.MONTHLY_USAGE,
    COLUMN_KEYS.SUGGESTED_QUANTITY,
    COLUMN_KEYS.EDITABLE_REQUIRED_QUANTITY,
    COLUMN_KEYS.REMOVE,
  ],
  stocktakes: [COLUMN_KEYS.NAME, COLUMN_KEYS.CREATED_DATE, COLUMN_KEYS.STATUS, COLUMN_KEYS.REMOVE],
  stocktakeManager: [COLUMN_KEYS.CODE, COLUMN_KEYS.NAME, COLUMN_KEYS.SELECTED],
  stocktakeEditor: [
    COLUMN_KEYS.ITEM_CODE,
    COLUMN_KEYS.ITEM_NAME,
    COLUMN_KEYS.SNAPSHOT_TOTAL_QUANTITY,
    COLUMN_KEYS.COUNTED_TOTAL_QUANTITY,
    COLUMN_KEYS.DIFFERENCE,
    COLUMN_KEYS.BATCHES,
  ],
  stocktakeEditorWithReasons: [
    COLUMN_KEYS.ITEM_CODE,
    COLUMN_KEYS.ITEM_NAME,
    COLUMN_KEYS.SNAPSHOT_TOTAL_QUANTITY,
    COLUMN_KEYS.COUNTED_TOTAL_QUANTITY,
    COLUMN_KEYS.DIFFERENCE,
    COLUMN_KEYS.REASON,
    COLUMN_KEYS.BATCHES,
  ],
  customerRequisitions: [
    COLUMN_KEYS.REQUISITION_NUMBER,
    COLUMN_KEYS.CUSTOMER,
    COLUMN_KEYS.NUMBER_OF_ITEMS,
    COLUMN_KEYS.ENTRY_DATE,
    COLUMN_KEYS.STATUS,
  ],
  customerRequisition: [
    COLUMN_KEYS.ITEM_CODE,
    COLUMN_KEYS.ITEM_NAME,
    COLUMN_KEYS.OUR_STOCK_ON_HAND,
    COLUMN_KEYS.THEIR_STOCK_ON_HAND,
    COLUMN_KEYS.MONTHLY_USAGE,
    COLUMN_KEYS.SUGGESTED_QUANTITY,
    COLUMN_KEYS.REQUIRED_QUANTITY,
    COLUMN_KEYS.SUPPLIED_QUANTITY,
  ],
  stocktakeBatchEditModal: [
    COLUMN_KEYS.BATCH_NAME,
    COLUMN_KEYS.EXPIRY_DATE,
    COLUMN_KEYS.SNAPSHOT_TOTAL_QUANTITY,
    COLUMN_KEYS.COUNTED_TOTAL_QUANTITY,
    COLUMN_KEYS.DIFFERENCE,
  ],
  stocktakeBatchEditModalWithReasons: [
    COLUMN_KEYS.BATCH_NAME,
    COLUMN_KEYS.EXPIRY_DATE,
    COLUMN_KEYS.SNAPSHOT_TOTAL_QUANTITY,
    COLUMN_KEYS.COUNTED_TOTAL_QUANTITY,
    COLUMN_KEYS.DIFFERENCE,
    COLUMN_KEYS.REASON,
  ],
  regimenDataModal: [
    COLUMN_KEYS.QUESTION,
    COLUMN_KEYS.EDITABLE_VALUE,
    COLUMN_KEYS.EDITABLE_COMMENT,
  ],
};

const COLUMNS = () => ({
  // CODE COLUMNS
  invoiceNumber: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.SERIAL_NUMBER,
    title: tableStrings.invoice_number,
    sortable: true,
    editable: false,
  },
  requisitionNumber: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.SERIAL_NUMBER,
    title: tableStrings.requisition_number,
    sortable: true,
    editable: false,
  },
  itemCode: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.ITEM_CODE,
    title: tableStrings.item_code,
    sortable: true,
    editable: false,
  },
  code: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.CODE,
    title: tableStrings.code,
    alignText: 'left',
    sortable: true,
    editable: false,
  },

  // STRING COLUMNS

  itemName: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.ITEM_NAME,
    title: tableStrings.item_name,
    sortable: true,
    editable: false,
  },
  name: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.NAME,
    title: tableStrings.name,
    alignText: 'left',
    sortable: true,
    editable: false,
  },
  supplier: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.OTHER_PARTY_NAME,
    title: tableStrings.supplier,
    sortable: true,
    editable: false,
  },
  customer: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.OTHER_PARTY_NAME,
    title: tableStrings.customer,
    sortable: true,
    editable: false,
  },
  comment: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.COMMENT,
    title: tableStrings.comment,
    lines: 2,
    editable: false,
  },
  unit: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.UNIT,
    title: tableStrings.unit,
    alignText: 'center',
    sortable: false,
    editable: false,
  },
  status: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.STATUS,
    title: tableStrings.status,
    sortable: true,
    editable: false,
  },
  question: {
    type: COLUMN_TYPES.STRING,
    key: COLUMN_KEYS.NAME,
    title: 'question',
    textAlign: 'left',
    sortable: false,
    editable: false,
  },

  // EDITABLE STRING COLUMNS

  batchName: {
    type: COLUMN_TYPES.STRING_EDITABLE,
    key: COLUMN_KEYS.BATCH,
    title: tableStrings.batch_name,
    alignText: 'center',
    editable: true,
  },
  editableComment: {
    type: COLUMN_TYPES.STRING_EDITABLE,
    key: COLUMN_KEYS.COMMENT,
    title: tableStrings.comment,
    textAlign: 'right',
    sortable: false,
    editable: true,
  },
  editableValue: {
    type: COLUMN_TYPES.STRING_EDITABLE,
    key: COLUMN_KEYS.VALUE,
    title: 'value',
    textAlign: 'right',
    sortable: false,
    editable: true,
  },

  // NUMERIC COLUMNS

  availableQuantity: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.AVAILABLE_QUANTITY,
    title: tableStrings.available_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  numberOfItems: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.NUMBER_OF_ITEMS,
    title: tableStrings.items,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  ourStockOnHand: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.OUR_STOCK_ON_HAND,
    title: tableStrings.current_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  theirStockOnHand: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.STOCK_ON_HAND,
    title: tableStrings.their_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  suggestedQuantity: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.SUGGESTED_QUANTITY,
    title: tableStrings.suggested_quantity,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  requiredQuantity: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.REQUIRED_QUANTITY,
    title: tableStrings.required_quantity,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  difference: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.DIFFERENCE,
    title: tableStrings.difference,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  snapshotTotalQuantity: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.SNAPSHOT_TOTAL_QUANTITY,
    title: tableStrings.snapshot_quantity,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  price: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.PRICE,
    title: tableStrings.price,
    alignText: 'center',
    editable: false,
    sortable: true,
  },
  monthlyUsage: {
    type: COLUMN_TYPES.NUMERIC,
    key: COLUMN_KEYS.MONTHLY_USAGE,
    title: tableStrings.monthly_usage,
    alignText: 'right',
    sortable: true,
    editable: false,
  },

  // EDITABLE NUMERIC COLUMNS

  editableRequiredQuantity: {
    type: COLUMN_TYPES.NUMERIC_EDITABLE,
    key: COLUMN_KEYS.REQUIRED_QUANTITY,
    title: tableStrings.required_quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },
  countedTotalQuantity: {
    type: COLUMN_TYPES.NUMERIC_EDITABLE,
    key: COLUMN_KEYS.COUNTED_TOTAL_QUANTITY,
    title: tableStrings.actual_quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },
  totalQuantity: {
    type: COLUMN_TYPES.NUMERIC_EDITABLE,
    key: COLUMN_KEYS.TOTAL_QUANTITY,
    title: tableStrings.quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },
  suppliedQuantity: {
    type: COLUMN_TYPES.NUMERIC_EDITABLE,
    key: COLUMN_KEYS.SUPPLIED_QUANTITY,
    title: tableStrings.supply_quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },

  // DATE COLUMNS

  createdDate: {
    type: COLUMN_TYPES.DATE,
    key: COLUMN_KEYS.CREATED_DATE,
    title: tableStrings.created_date,
    alignText: 'left',
    sortable: true,
    editable: false,
  },
  entryDate: {
    type: COLUMN_TYPES.DATE,
    key: COLUMN_KEYS.ENTRY_DATE,
    title: tableStrings.entered_date,
    sortable: true,
    editable: false,
  },

  // EDITABLE DATE COLUMNS
  expiryDate: {
    type: COLUMN_TYPES.DATE,
    key: COLUMN_KEYS.EXPIRY_DATE,
    title: tableStrings.batch_expiry,
    alignText: 'center',
    sortable: false,
    editable: true,
  },

  // CHECKABLE COLUMNS
  remove: {
    type: COLUMN_TYPES.CHECKABLE,
    key: COLUMN_KEYS.REMOVE,
    title: tableStrings.remove,
    alignText: 'center',
    sortable: false,
    editable: false,
  },

  selected: {
    type: COLUMN_TYPES.CHECKABLE,
    key: COLUMN_KEYS.SELECTED,
    title: tableStrings.selected,
    alignText: 'center',
    sortable: false,
    editable: false,
  },

  // MISC COLUMNS

  batches: {
    type: COLUMN_TYPES.ICON,
    key: COLUMN_KEYS.BATCH,
    title: tableStrings.batches,
    sortable: false,
    alignText: 'center',
    editable: false,
  },
  reason: {
    type: COLUMN_TYPES.DROP_DOWN,
    key: COLUMN_KEYS.REASON_TITLE,
    title: tableStrings.reason,
    alignText: 'center',
    sortable: false,
    editable: false,
  },
});

const getColumns = page => {
  const widths = PAGE_COLUMN_WIDTHS[page];
  const columnKeys = PAGE_COLUMNS[page];

  if (!columnKeys) return [];
  if (!(columnKeys.length === widths.length)) return [];
  const columns = COLUMNS();
  return columnKeys.map((columnKey, i) => ({ ...columns[columnKey], width: widths[i] }));
};

export default getColumns;
