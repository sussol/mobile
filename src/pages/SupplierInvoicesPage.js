/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { SearchBar } from '../widgets';
import { GenericTablePage } from './GenericTablePage';
import { formatStatus } from '../utilities';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionItem', 'TransactionBatch'];

/**
* Renders the page for displaying SupplierInvoices.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class SupplierInvoicesPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'serialNumber';
    this.state.transactions = props.database.objects('Transaction')
                                            .filtered('type == "supplier_invoice"');
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
  }

  onRowPress(invoice) {
    this.props.navigateTo('supplierInvoice',
                          `Invoice ${invoice.serialNumber}`,
                          { transaction: invoice });
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending. Special
   * case for sorting by serialNumber due to needing number based sorting but the
   * value is stored as a string.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.transactions.filtered(`serialNumber BEGINSWITH "${searchTerm}"`);
    if (sortBy === 'serialNumber') { // Special case for correct number based sorting
      // Convert to javascript array obj then sort with standard array functions.
      data = data.slice().sort((a, b) => Number(a.serialNumber) - b.serialNumber); // 0,1,2,3...
      if (!isAscending) data.reverse(); // ...3,2,1,0
    } else {
      data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
    }
    return data;
  }

  renderCell(key, invoice) {
    switch (key) {
      default:
      case 'serialNumber':
        return invoice.serialNumber;
      case 'status':
        return formatStatus(invoice.status);
      case 'entryDate':
        return invoice.entryDate.toDateString();
      case 'comment':
        return invoice.comment;
    }
  }

  renderSearchBar() {
    return (
      <SearchBar
        onChange={(event) => this.onSearchChange(event)}
        keyboardType="numeric"
      />);
  }
}

SupplierInvoicesPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'serialNumber',
    width: 1,
    title: 'INVOICE NO.',
    sortable: true,
  },
  {
    key: 'status',
    width: 1,
    title: 'STATUS',
    sortable: true,
  },
  {
    key: 'entryDate',
    width: 1,
    title: 'ENTERED DATE',
    sortable: true,
  },
  {
    key: 'comment',
    width: 3,
    title: 'COMMENT',
  },
];
