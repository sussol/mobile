/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { tableStrings } from '../../localization';

const PAGE_COLUMN_WIDTHS = {
  customerInvoice: [2, 4, 2, 2, 1],
  supplierInvoice: [2, 4, 2, 2, 1],
  customerInvoices: [1.5, 2.5, 2, 3, 1],
  supplierRequisitions: [1.5, 2, 1, 1, 1, 1],
  supplierRequisition: [1.4, 3.5, 2, 1.5, 2, 2, 1],
};

const PAGE_COLUMNS = {
  customerInvoice: ['itemCode', 'itemName', 'availableQuantity', 'totalQuantity', 'remove'],
  supplierInvoice: ['itemCode', 'itemName', 'totalQuantity', 'editableExpiryDate', 'remove'],
  customerInvoices: ['serialNumber', 'otherPartyName', 'status', 'comment', 'delete'],
  supplierRequisitions: [
    'serialNumber',
    'otherPartyName',
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
};

const COLUMNS = () => ({
  serialNumber: {
    key: 'serialNumber',
    title: tableStrings.invoice_number,
    sortable: true,
  },
  otherPartyName: {
    key: 'otherPartyName',
    title: tableStrings.customer,
    sortable: true,
  },
  comment: {
    key: 'comment',
    title: tableStrings.comment,
    lines: 2,
  },
  itemCode: {
    key: 'itemCode',
    title: tableStrings.item_code,
    sortable: true,
  },
  itemName: {
    key: 'itemName',
    title: tableStrings.item_name,
    sortable: true,
  },
  availableQuantity: {
    key: 'availableQuantity',
    title: tableStrings.available_stock,
    sortable: true,
    alignText: 'right',
  },
  totalQuantity: {
    key: 'totalQuantity',
    type: 'editable',
    title: tableStrings.quantity,
    sortable: true,
    alignText: 'right',
  },
  remove: {
    key: 'remove',
    type: 'checkable',
    title: tableStrings.remove,
    alignText: 'center',
  },
  editableExpiryDate: {
    key: 'expiryDate',
    type: 'date',
    title: tableStrings.batch_expiry,
    alignText: 'center',
  },
  serialNumber: {
    key: 'serialNumber',
    title: tableStrings.requisition_number,
    sortable: true,
  },
  supplierName: {
    key: 'supplierName',
    title: tableStrings.supplier,
    sortable: true,
  },
  entryDate: {
    type: 'entryDate',
    key: 'entryDate',
    title: tableStrings.entered_date,
    sortable: true,
  },
  numberOfItems: {
    key: 'numberOfItems',
    title: tableStrings.items,
    sortable: true,
    alignText: 'right',
  },
  status: {
    type: 'status',
    key: 'status',
    title: tableStrings.status,
    sortable: true,
  },
  ourStockOnHand: {
    key: 'ourStockOnHand',
    title: tableStrings.current_stock,
    sortable: true,
    alignText: 'right',
  },
  monthlyUsage: {
    key: 'monthlyUsage',
    title: tableStrings.monthly_usage,
    sortable: true,
    alignText: 'right',
  },
  suggestedQuantity: {
    key: 'suggestedQuantity',
    title: tableStrings.suggested_quantity,
    sortable: true,
    alignText: 'right',
  },
  requiredQuantity: {
    key: 'requiredQuantity',
    title: tableStrings.required_quantity,
    sortable: true,
    alignText: 'right',
  },
  price: {
    key: 'price',
    title: tableStrings.price,
    alignText: 'center',
  },
  unit: {
    key: 'unit',
    title: tableStrings.unit,
    alignText: 'center',
  },
});

const getColumns = page => {
  const columnKeys = PAGE_COLUMNS[page];
  const widths = PAGE_COLUMN_WIDTHS[page];
  if (!columnKeys) return [];
  if (!(columnKeys.length === widths.length)) return [];
  const columns = COLUMNS();
  return columnKeys.map((columnKey, i) => ({ ...columns[columnKey], width: widths[i] }));
};

export default getColumns;
