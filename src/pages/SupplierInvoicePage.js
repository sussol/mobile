/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionLine', 'Item', 'ItemLine'];

export class SupplierInvoicePage extends GenericTablePage {
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
    let data = this.props.transaction.lines.filtered(`itemName BEGINSWITH "${searchTerm}"`);
    switch (sortBy) {
      case 'itemCode':
        data = data.slice().sort((a, b) =>
          a.itemLine.item.code.localeCompare(b.itemLine.item.code));
        if (!isAscending) data.reverse();
        break;
      case 'numReceived':
        data = data.slice().sort((a, b) => a.totalQuantity - b.totalQuantity);
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
   * @param  {object} transactionLine The transaction line from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionLine, newValue) {
    if (key !== 'numReceived') return;
    this.props.database.write(() => {
      transactionLine.totalQuantity = parseFloat(newValue); // eslint-disable-line no-param-reassign
      this.props.database.save('TransactionLine', transactionLine);
    });
  }

  renderCell(key, transactionLine) {
    switch (key) {
      default:
      case 'itemName':
        return transactionLine.itemName;
      case 'itemCode': {
        const item = transactionLine.itemLine && transactionLine.itemLine.item;
        return item && item.code;
      }
      case 'numSent':
        return transactionLine.totalQuantitySent;
      case 'numReceived': {
        const renderedCell = {
          cellContents: transactionLine.totalQuantity,
          editable: !this.props.transaction.isFinalised,
        };
        return renderedCell;
      }
    }
  }
}

SupplierInvoicePage.propTypes = {
  database: React.PropTypes.object,
};

const COLUMNS = [
  {
    key: 'itemName',
    width: 2,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'itemCode',
    width: 1,
    title: 'CODE',
    sortable: true,
  },
  {
    key: 'numSent',
    width: 1,
    title: 'NO. SENT',
    sortable: true,
  },
  {
    key: 'numReceived',
    width: 1,
    title: 'NO. RECEIVED',
    sortable: true,
  },
];
