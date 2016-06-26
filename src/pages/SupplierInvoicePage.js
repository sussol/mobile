/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';

import { GenericTablePage } from './GenericTablePage';
const SORT_PROPERTIES = {
  name: 'itemName',
  code: 'itemName', // TODO Sorting by code
  numSent: 'totalQuantity',
  numReceived: 'totalQuantity',
};

export class SupplierInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.columns = COLUMNS;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.props.transaction.lines.filtered(`itemName BEGINSWITH "${searchTerm}"`);
    data = data.sorted(SORT_PROPERTIES[sortBy], !isAscending); // 2nd arg: reverse sort
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
      transactionLine.quantity = parseFloat(newValue); // eslint-disable-line no-param-reassign
    });
  }

  renderCell(key, transactionLine) {
    switch (key) {
      default:
      case 'name':
        return transactionLine.itemName;
      case 'code': {
        const item = transactionLine.itemLine && transactionLine.itemLine.item;
        return item && item.code;
      }
      case 'numSent':
        return transactionLine.totalQuantity;
      case 'numReceived':
        return transactionLine.totalQuantity;
    }
  }
}

SupplierInvoicePage.propTypes = {
  database: React.PropTypes.object,
};

const COLUMNS = [
  {
    key: 'name',
    width: 2,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'code',
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
    editable: true,
  },
];
