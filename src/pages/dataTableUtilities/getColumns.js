/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { tableStrings } from '../../localization';

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
};

const PAGE_COLUMNS = {
  customerInvoice: ['itemCode', 'itemName', 'availableQuantity', 'totalQuantity', 'remove'],
  customerInvoices: ['serialNumber', 'customer', 'status', 'entryDate', 'comment', 'remove'],
  supplierInvoice: ['itemCode', 'itemName', 'totalQuantity', 'expiryDate', 'remove'],
  supplierInvoices: ['serialNumber', 'supplier', 'status', 'entryDate', 'comment', 'remove'],
  supplierRequisitions: [
    'serialNumber',
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
    'requiredQuantity',
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
    'requiredQuantity',
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
  customerRequisitions: ['serialNumber', 'supplier', 'numberOfItems', 'entryDate', 'status'],
};

const COLUMNS = () => ({
  // CODE COLUMNS
  serialNumber: {
    type: 'string',
    key: 'serialNumber',
    title: tableStrings.invoice_number,
    sortable: true,
    editable: false,
  },
  itemCode: {
    type: 'string',
    key: 'itemCode',
    title: tableStrings.item_code,
    sortable: true,
    editable: false,
  },
  code: {
    type: 'string',
    key: 'code',
    title: tableStrings.code,
    alignText: 'left',
    sortable: true,
    editable: false,
  },

  // STRING COLUMNS

  itemName: {
    type: 'string',
    key: 'itemName',
    title: tableStrings.item_name,
    sortable: true,
    editable: false,
  },
  name: {
    type: 'string',
    key: 'name',
    title: tableStrings.name,
    alignText: 'left',
    sortable: true,
    editable: false,
  },
  supplier: {
    type: 'string',
    key: 'otherPartyName',
    title: tableStrings.supplier,
    sortable: true,
    editable: false,
  },
  customer: {
    type: 'string',
    key: 'otherPartyName',
    title: tableStrings.customer,
    sortable: true,
    editable: false,
  },
  comment: {
    type: 'string',
    key: 'comment',
    title: tableStrings.comment,
    lines: 2,
    editable: false,
  },
  unit: {
    type: 'string',
    key: 'unit',
    title: tableStrings.unit,
    alignText: 'center',
    sortable: false,
    editable: false,
  },
  status: {
    type: 'string',
    key: 'status',
    title: tableStrings.status,
    sortable: true,
    editable: false,
  },

  // EDITABLE STRING COLUMNS

  batchName: {
    type: 'editableString',
    key: 'batch',
    title: tableStrings.batch_name,
    alignText: 'center',
  },

  // NUMERIC COLUMNS

  availableQuantity: {
    type: 'numeric',
    key: 'availableQuantity',
    title: tableStrings.available_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  numberOfItems: {
    type: 'numeric',
    key: 'numberOfItems',
    title: tableStrings.items,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  ourStockOnHand: {
    type: 'numeric',
    key: 'ourStockOnHand',
    title: tableStrings.current_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  suggestedQuantity: {
    type: 'numeric',
    key: 'suggestedQuantity',
    title: tableStrings.suggested_quantity,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  difference: {
    type: 'numeric',
    key: 'difference',
    title: tableStrings.difference,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  snapshotTotalQuantity: {
    type: 'numeric',
    key: 'snapshotTotalQuantity',
    title: tableStrings.snapshot_quantity,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  theirStockOnHand: {
    type: 'numeric',
    key: 'stockOnHand',
    title: tableStrings.their_stock,
    alignText: 'right',
    sortable: true,
    editable: false,
  },
  price: {
    type: 'numeric',
    key: 'price',
    title: tableStrings.price,
    alignText: 'center',
    editable: false,
    sortable: true,
  },
  monthlyUsage: {
    type: 'numeric',
    key: 'monthlyUsage',
    title: tableStrings.monthly_usage,
    alignText: 'right',
    sortable: true,
    editable: false,
  },

  // EDITABLE NUMERIC COLUMNS

  requiredQuantity: {
    type: 'editableNumeric',
    key: 'requiredQuantity',
    title: tableStrings.required_quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },
  countedTotalQuantity: {
    type: 'editableNumeric',
    key: 'countedTotalQuantity',
    title: tableStrings.actual_quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },
  totalQuantity: {
    type: 'editableNumeric',
    key: 'totalQuantity',
    title: tableStrings.quantity,
    alignText: 'right',
    sortable: true,
    editable: true,
  },

  // DATE COLUMNS

  createdDate: {
    type: 'date',
    key: 'createdDate',
    title: tableStrings.created_date,
    alignText: 'left',
    sortable: true,
    editable: false,
  },
  entryDate: {
    type: 'date',
    key: 'entryDate',
    title: tableStrings.entered_date,
    sortable: true,
    editable: false,
  },

  // EDITABLE DATE COLUMNS
  expiryDate: {
    type: 'editableDate',
    key: 'expiryDate',
    title: tableStrings.batch_expiry,
    alignText: 'center',
    sortable: false,
    editable: true,
  },

  // CHECKABLE COLUMNS
  remove: {
    type: 'checkable',
    key: 'remove',
    title: tableStrings.remove,
    alignText: 'center',
    sortable: false,
    editable: false,
  },

  selected: {
    type: 'checkable',
    key: 'selected',
    title: tableStrings.selected,
    alignText: 'center',
    sortable: false,
    editable: false,
  },

  // MISC COLUMNS

  batches: {
    type: 'icon',
    key: 'batch',
    title: tableStrings.batches,
    sortable: false,
    alignText: 'center',
    editable: false,
  },
  reason: {
    type: 'dropDown',
    key: 'mostUsedReasonTitle',
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
