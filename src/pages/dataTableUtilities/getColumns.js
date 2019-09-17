/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { tableStrings } from '../../localization';

const COLUMN_TYPES = Object.freeze({
  STRING: 0,
  NUMERIC: 1,
  DATE: 2,
  STRING_EDITABLE: 3,
  NUMERIC_EDITABLE: 4,
  DATE_EDITABLE: 5,
  CHECKABLE: 6,
  ICON: 7,
  DROP_DOWN: 8,
});

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
  customerInvoice: ['itemCode', 'itemName', 'availableQuantity', 'totalQuantity', 'remove'],
  customerInvoices: ['invoiceNumber', 'customer', 'status', 'entryDate', 'comment', 'remove'],
  supplierInvoice: ['itemCode', 'itemName', 'totalQuantity', 'expiryDate', 'remove'],
  supplierInvoices: ['invoiceNumber', 'supplier', 'status', 'entryDate', 'comment', 'remove'],
  supplierRequisitions: [
    'requisitionNumber',
    'supplier',
    'numberOfItems',
    'entryDate',
    'status',
    'remove',
  ],
  supplierRequisition: [
    'itemCode',
    'itemName',
    'ourStockOnHand',
    'monthlyUsage',
    'suggestedQuantity',
    'editableRequiredQuantity',
    'remove',
  ],
  supplierRequisitionWithProgram: [
    'itemCode',
    'itemName',
    'unit',
    'price',
    'ourStockOnHand',
    'monthlyUsage',
    'suggestedQuantity',
    'editableRequiredQuantity',
    'remove',
  ],
  stocktakes: ['name', 'createdDate', 'status', 'remove'],
  stocktakeManager: ['code', 'name', 'selected'],
  stocktakeEditor: [
    'itemCode',
    'itemName',
    'snapshotTotalQuantity',
    'countedTotalQuantity',
    'difference',
    'batches',
  ],
  stocktakeEditorWithReasons: [
    'itemCode',
    'itemName',
    'snapshotTotalQuantity',
    'countedTotalQuantity',
    'difference',
    'reason',
    'batches',
  ],
  customerRequisitions: ['requisitionNumber', 'customer', 'numberOfItems', 'entryDate', 'status'],
  customerRequisition: [
    'itemCode',
    'itemName',
    'ourStockOnHand',
    'theirStockOnHand',
    'monthlyUsage',
    'suggestedQuantity',
    'requiredQuantity',
    'suppliedQuantity',
  ],
  stocktakeBatchEditModal: [
    'batchName',
    'expiryDate',
    'snapshotTotalQuantity',
    'countedTotalQuantity',
    'difference',
  ],
  stocktakeBatchEditModalWithReasons: [
    'batchName',
    'expiryDate',
    'snapshotTotalQuantity',
    'countedTotalQuantity',
    'difference',
    'reason',
  ],
  regimenDataModal: ['question', 'editableValue', 'editableComment'],
};

const COLUMNS = () => ({
  // CODE COLUMNS
  invoiceNumber: {
    type: COLUMN_TYPES.STRING,
    key: 'serialNumber',
    title: tableStrings.invoice_number,
    sortable: true,
    editable: false,
  },
  requisitionNumber: {
    type: COLUMN_TYPES.STRING,
    key: 'serialNumber',
    title: tableStrings.requisition_number,
    sortable: true,
    editable: false,
  },
  itemCode: {
    type: COLUMN_TYPES.STRING,
    key: 'itemCode',
    title: tableStrings.item_code,
    sortable: true,
    editable: false,
  },
  code: {
    type: COLUMN_TYPES.STRING,
    key: 'code',
    title: tableStrings.code,
    alignText: 'left',
    sortable: true,
    editable: false,
  },

  // STRING COLUMNS

  itemName: {
    type: COLUMN_TYPES.STRING,
    key: 'itemName',
    title: tableStrings.item_name,
    sortable: true,
    editable: false,
  },
  name: {
    type: COLUMN_TYPES.STRING,
    key: 'name',
    title: tableStrings.name,
    alignText: 'left',
    sortable: true,
    editable: false,
  },
  supplier: {
    type: COLUMN_TYPES.STRING,
    key: 'otherPartyName',
    title: tableStrings.supplier,
    sortable: true,
    editable: false,
  },
  customer: {
    type: COLUMN_TYPES.STRING,
    key: 'otherPartyName',
    title: tableStrings.customer,
    sortable: true,
    editable: false,
  },
  comment: {
    type: COLUMN_TYPES.STRING,
    key: 'comment',
    title: tableStrings.comment,
    lines: 2,
    editable: false,
  },
  unit: {
    type: COLUMN_TYPES.STRING,
    key: 'unit',
    title: tableStrings.unit,
    alignText: 'center',
    sortable: false,
    editable: false,
  },
  status: {
    type: COLUMN_TYPES.STRING,
    key: 'status',
    title: tableStrings.status,
    sortable: true,
    editable: false,
  },
  question: {
    type: COLUMN_TYPES.STRING,
    key: 'name',
    title: 'Question',
    textAlign: 'left',
    sortable: false,
    editable: false,
  },

  // EDITABLE STRING COLUMNS

  batchName: {
    type: COLUMN_TYPES.STRING_EDITABLE,
    key: 'batch',
    title: tableStrings.batch_name,
    alignText: 'center',
    editable: true,
  },
  editableComment: {
    type: COLUMN_TYPES.STRING_EDITABLE,
    key: 'comment',
    title: tableStrings.comment,
    textAlign: 'right',
    sortable: false,
    editable: true,
  },
  editableValue: {
    type: COLUMN_TYPES.STRING_EDITABLE,
    key: 'value',
    title: 'Value',
    textAlign: 'right',
    sortable: false,
    editable: true,
  },

  // NUMERIC COLUMNS

  availableQuantity: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'availableQuantity',
    title: tableStrings.available_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  numberOfItems: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'numberOfItems',
    title: tableStrings.items,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  ourStockOnHand: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'ourStockOnHand',
    title: tableStrings.current_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  theirStockOnHand: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'stockOnHand',
    title: tableStrings.their_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  suggestedQuantity: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'suggestedQuantity',
    title: tableStrings.suggested_quantity,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  requiredQuantity: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'requiredQuantity',
    title: tableStrings.required_quantity,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  difference: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'difference',
    title: tableStrings.difference,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  snapshotTotalQuantity: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'snapshotTotalQuantity',
    title: tableStrings.snapshot_quantity,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  price: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'price',
    title: tableStrings.price,
    alignText: 'center',
    editable: false,
    sortable: true,
  },
  monthlyUsage: {
    type: COLUMN_TYPES.NUMERIC,
    key: 'monthlyUsage',
    title: tableStrings.monthly_usage,
    alignText: 'right',
    sortable: true,
    editable: false,
  },

  // EDITABLE NUMERIC COLUMNS

  editableRequiredQuantity: {
    type: COLUMN_TYPES.NUMERIC_EDITABLE,
    key: 'requiredQuantity',
    title: tableStrings.required_quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },
  countedTotalQuantity: {
    type: COLUMN_TYPES.NUMERIC_EDITABLE,
    key: 'countedTotalQuantity',
    title: tableStrings.actual_quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },
  totalQuantity: {
    type: COLUMN_TYPES.NUMERIC_EDITABLE,
    key: 'totalQuantity',
    title: tableStrings.quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },
  suppliedQuantity: {
    type: COLUMN_TYPES.NUMERIC_EDITABLE,
    key: 'suppliedQuantity',
    title: tableStrings.supply_quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },

  // DATE COLUMNS

  createdDate: {
    type: COLUMN_TYPES.DATE,
    key: 'createdDate',
    title: tableStrings.created_date,
    alignText: 'left',
    sortable: true,
    editable: false,
  },
  entryDate: {
    type: COLUMN_TYPES.DATE,
    key: 'entryDate',
    title: tableStrings.entered_date,
    sortable: true,
    editable: false,
  },

  // EDITABLE DATE COLUMNS
  expiryDate: {
    type: COLUMN_TYPES.DATE,
    key: 'expiryDate',
    title: tableStrings.batch_expiry,
    alignText: 'center',
    sortable: false,
    editable: true,
  },

  // CHECKABLE COLUMNS
  remove: {
    type: COLUMN_TYPES.CHECKABLE,
    key: 'remove',
    title: tableStrings.remove,
    alignText: 'center',
    sortable: false,
    editable: false,
  },

  selected: {
    type: COLUMN_TYPES.CHECKABLE,
    key: 'selected',
    title: tableStrings.selected,
    alignText: 'center',
    sortable: false,
    editable: false,
  },

  // MISC COLUMNS

  batches: {
    type: COLUMN_TYPES.ICON,
    key: 'batch',
    title: tableStrings.batches,
    sortable: false,
    alignText: 'center',
    editable: false,
  },
  reason: {
    type: COLUMN_TYPES.DROP_DOWN,
    key: 'reasonTitle',
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
