/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import { View } from 'react-native';

import { createCustomerInvoice } from '../database';
import { Button } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { formatStatus } from '../utilities';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionItem'];

/**
* Renders the page for displaying Invoices for a Customer.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @prop   {Realm.Object}        currentUser   User object representing the current user logged in.
* @prop   {Realm.Object}        customer      Current customer object being viewed
* @state  {Realm.Results}       transactions  Results object containing all Transaction records
*                                             filtered to be only be those belonging to the Customer
*                                             being viewed.
*/
export class CustomerPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.transactions = props.database.objects('Transaction')
                                          .filtered('otherParty.name == $0', props.customer.name);
    this.state.sortBy = 'entryDate';
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.navigateToInvoice = this.navigateToInvoice.bind(this);
    this.onNewInvoice = this.onNewInvoice.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
    this.renderCell = this.renderCell.bind(this);
  }

  onNewInvoice() {
    let invoice;
    this.props.database.write(() => {
      invoice = createCustomerInvoice(this.props.database, this.props.customer);
    });
    this.navigateToInvoice(invoice);
  }

  onRowPress(invoice) {
    this.navigateToInvoice(invoice);
  }

  navigateToInvoice(invoice) {
    const pageTitle = `Invoice ${invoice.serialNumber}`;
    this.props.navigateTo('customerInvoice', pageTitle, { transaction: invoice });
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending. Special case for
   * 'serialNumber' to sort numbers correctly. Special case for lines.length for correct number
   * sort and also realm does not allow sorting on the properties of an object property.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.transactions;
    switch (sortBy) {
      case 'serialNumber': // Special case for correct number based sorting
        // Convert to javascript array obj then sort with standard array functions.
        data = data.slice().sort((a, b) => Number(a.serialNumber) - b.serialNumber); // 0,1,2,3...
        if (!isAscending) data.reverse(); // ...3,2,1,0
        break;
      case 'items': // Cannot use realm Result.sorted() with a property of a property
        data = data.slice().sort((a, b) => a.items.length - b.items.length); // 0,1,2,3...
        if (!isAscending) data.reverse(); // ...3,2,1,0
        break;
      default:
        data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
    }
    return data;
  }

  renderCell(key, transaction) {
    switch (key) {
      default:
      case 'serialNumber':
        return transaction.serialNumber;
      case 'status':
        return formatStatus(transaction.status);
      case 'entryDate':
        return transaction.entryDate.toDateString();
      case 'items':
        return transaction.items.length;
      case 'comment':
        return transaction.comment ? transaction.comment : '';
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <Button
              style={globalStyles.button}
              textStyle={globalStyles.buttonText}
              text="New Invoice"
              onPress={this.onNewInvoice}
            />
          </View>
          {this.renderDataTable()}
        </View>
      </View>
    );
  }
}

CustomerPage.propTypes = {
  database: React.PropTypes.object.isRequired,
  currentUser: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'serialNumber',
    width: 1,
    title: 'ID',
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
    width: 2,
    title: 'ENTERED DATE',
    sortable: true,
  },
  {
    key: 'items',
    width: 1,
    title: 'ITEMS',
    sortable: true,
  },
  {
    key: 'comment',
    width: 3,
    title: 'COMMENT',
  },
];
