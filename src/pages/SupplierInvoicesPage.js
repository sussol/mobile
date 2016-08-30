/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { GenericTablePage } from './GenericTablePage';
import { formatStatus, sortDataBy } from '../utilities';
import { navStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Transaction'];

/**
* Renders the page for displaying SupplierInvoices.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class SupplierInvoicesPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'entryDate';
    this.state.isAscending = false;
    this.state.transactions = props.database.objects('Transaction')
                                            .filtered('type == "supplier_invoice"')
                                            .filtered('otherParty.type != "inventory_adjustment"');
    this.columns = COLUMNS;
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
  }

  onRowPress(invoice) {
    this.props.navigateTo('supplierInvoice',
                          `${navStrings.invoice} ${invoice.serialNumber}`,
                          { transaction: invoice });
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const data = this.state.transactions.filtered('serialNumber BEGINSWITH[c] $0', searchTerm);
    let sortDataType;
    switch (sortBy) {
      case 'serialNumber':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    return sortDataBy(data, sortBy, sortDataType, isAscending);
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
}

SupplierInvoicesPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'serialNumber',
    width: 1,
    titleKey: 'invoice_number',
    sortable: true,
  },
  {
    key: 'status',
    width: 1,
    titleKey: 'status',
    sortable: true,
  },
  {
    key: 'entryDate',
    width: 1,
    titleKey: 'entered_date',
    sortable: true,
  },
  {
    key: 'comment',
    width: 3,
    titleKey: 'comment',
  },
];
