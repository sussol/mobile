/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionLine', 'Item', 'ItemLine'];

export class CustomerInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.databaseListenerId = null;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.props.transaction.items.filtered(`item.name BEGINSWITH[c] "${searchTerm}"`);
    switch (sortBy) {
      case 'itemCode':
        data = data.slice().sort((a, b) =>
          a.item.code.localeCompare(b.item.code));
        if (!isAscending) data.reverse();
        break;
      case 'itemName':
        data = data.slice().sort((a, b) =>
          a.item.name.localeCompare(b.item.name));
        if (!isAscending) data.reverse();
        break;
      default:
        data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
        break;
    }
    return data;
  }

  /**
   * Respond to the user editing the number in the number received column
   * @param  {string} key             Should always be 'numReceived'
   * @param  {object} transactionItem The transaction item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionItem, newValue) {
    if (key !== 'quantityToIssue') return;
    this.props.database.write(() => {
      transactionItem.totalQuantity = parseFloat(newValue); // eslint-disable-line no-param-reassign
      this.props.database.save('TransactionItem', transactionItem);
    });
  }

  renderCell(key, transactionItem) {
    switch (key) {
      default:
      case 'itemName':
        return transactionItem.item && transactionItem.item.name;
      case 'itemCode':
        return transactionItem.item && transactionItem.item.code;
      case 'availableQuantity':
        return transactionItem.availableQuantity;
      case 'quantityToIssue':
        return {
          cellContents: transactionItem.totalQuantity,
          editable: !this.props.transaction.isFinalised,
        };
    }
  }
}

CustomerInvoicePage.propTypes = {
  database: React.PropTypes.object,
};

const COLUMNS = [
  {
    key: 'itemCode',
    width: 2,
    title: 'CODE',
    sortable: true,
  },
  {
    key: 'itemName',
    width: 4,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'availableQuantity',
    width: 2,
    title: 'AVAILABLE STOCK',
    sortable: true,
  },
  {
    key: 'totalQuantity',
    width: 2,
    title: 'QUANTITY',
    sortable: true,
  },
  {
    key: 'remove',
    width: 1,
    title: 'REMOVE',
  },
];
