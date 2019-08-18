/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { tableStrings } from '../../localization';

const PAGE_COLUMN_WIDTHS = {
  customerInvoice: [2, 4, 2, 2, 1],
};

const PAGE_COLUMNS = {
  customerInvoice: ['itemCode', 'itemName', 'availableQuantity', 'totalQuantity', 'remove'],
};

const COLUMNS = () => ({
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
