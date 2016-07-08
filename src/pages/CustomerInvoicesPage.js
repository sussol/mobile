/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import { View } from 'react-native';
import { PageButton, SelectModal } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { createCustomerInvoice } from '../database';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionLine'];

/**
* Renders the page for displaying CustomerInvoices.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only customer_invoice.
*/
export class CustomerInvoicesPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.transactions = props.database.objects('Transaction')
                                            .filtered('type == "customer_invoice"');
    this.state.sortBy = 'otherParty.name';
    this.state.isCreatingInvoice = false;
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onNewInvoice = this.onNewInvoice.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
    this.navigateToInvoice = this.navigateToInvoice.bind(this);
    this.renderCell = this.renderCell.bind(this);
  }

  onNewInvoice(otherParty) {
    const invoice = createCustomerInvoice(this.props.database, otherParty);
    this.navigateToInvoice(invoice);
  }

  onRowPress(invoice) {
    this.navigateToInvoice(invoice);
  }

  navigateToInvoice(invoice) {
    this.props.navigateTo('customerInvoice',
                          `Invoice ${invoice.serialNumber}`,
                          { transaction: invoice });
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending. Special
   * case for otherParty.name as realm does not allow sorting on object properties
   * properties.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.state.transactions.filtered(`otherParty.name CONTAINS[c] "${searchTerm}"`);
    if (sortBy === 'otherParty.name') {
      // Convert to javascript array obj then sort with standard array functions.
      data = data.slice().sort((a, b) => a.otherParty.name.localeCompare(b.otherParty.name));
      if (!isAscending) data.reverse();
    } else {
      data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
    }
    return data;
  }

  renderCell(key, invoice) {
    switch (key) {
      default:
      case 'otherParty.name':
        return invoice.otherParty && invoice.otherParty.name;
      case 'serialNumber':
        return invoice.serialNumber;
      case 'status':
        return invoice.status;
      case 'entryDate':
        return invoice.entryDate.toDateString();
      case 'comment':
        return invoice.comment;
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            {this.renderSearchBar()}
            <PageButton
              text="New Invoice"
              onPress={() => this.setState({ isCreatingInvoice: true })}
            />
          </View>
          {this.renderDataTable()}
          <SelectModal
            isOpen={this.state.isCreatingInvoice}
            options={this.props.database.objects('Name').filtered('isCustomer == true')}
            placeholderText="Start typing to select customer"
            queryString={'name BEGINSWITH[c] $0'}
            onSelect={name => {
              this.onNewInvoice(name);
              this.setState({ isCreatingInvoice: false });
            }}
            onCancel={() => this.setState({ isCreatingInvoice: false })}
          />
        </View>
      </View>
    );
  }
}

CustomerInvoicesPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'otherParty.name',
    width: 4,
    title: 'CUSTOMER',
    sortable: true,
  },
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
    width: 2,
    title: 'ENTERED DATE',
    sortable: true,
  },
  {
    key: 'comment',
    width: 4,
    title: 'COMMENT',
  },
];
