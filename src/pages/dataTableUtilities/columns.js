/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { tableStrings } from '../../localization';

const customerInvoice = ['itemCode', 'itemName', 'availableQuantity', 'totalQuantity', 'remove'];

const PAGE_COLUMNS = {
  customerInvoice,
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

const getColumns = (page, widths) => {
  const columnKeys = PAGE_COLUMNS[page];
  if (!columnKeys) return [];
  if (!(columnKeys.length === widths.length)) return [];
  const columns = COLUMNS();
  return columnKeys.map((columnKey, i) => ({ ...columns[columnKey], width: widths[i] }));
};

export default getColumns;
