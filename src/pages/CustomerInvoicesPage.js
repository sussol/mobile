/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import { View } from 'react-native';
import { BottomConfirmModal, PageButton, SelectModal } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { createRecord } from '../database';
import { formatStatus, sortDataBy } from '../utilities';

const DATA_TYPES_DISPLAYED = ['Transaction', 'TransactionItem', 'TransactionBatch'];

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
    this.state.sortBy = 'entryDate';
    this.state.isAscending = false;
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
    const { database, currentUser } = this.props;
    let invoice;
    database.write(() => {
      invoice = createRecord(database, 'CustomerInvoice', otherParty, currentUser);
    });
    this.navigateToInvoice(invoice);
  }

  onDeleteConfirm() {
    const { selection, transactions } = this.state;
    const { database } = this.props;
    database.write(() => {
      const transactionsToDelete = [];
      for (let i = 0; i < selection.length; i++) {
        const transaction = transactions.find(currentTransaction =>
                                                currentTransaction.id === selection[i]);
        if (transaction.isValid() && !transaction.isFinalised) {
          transactionsToDelete.push(transaction);
        }
      }
      database.delete('Transaction', transactionsToDelete);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel() {
    this.setState({ selection: [] });
    this.refreshData();
  }

  onRowPress(invoice) {
    this.navigateToInvoice(invoice);
  }

  navigateToInvoice(invoice) {
    this.setState({ selection: [] }, this.refreshData); // Clear any invoices selected for delete
    this.props.navigateTo('customerInvoice',
                          `Invoice ${invoice.serialNumber}`,
                          { transaction: invoice });
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const data = this.state.transactions.filtered(
      'otherParty.name BEGINSWITH[c] $0 OR serialNumber BEGINSWITH[c] $0',
      searchTerm
    );

    let sortDataType;
    switch (sortBy) {
      case 'otherPartyName':
        sortDataType = 'string';
        break;
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
        return invoice[key];
      case 'status':
        return formatStatus(invoice.status);
      case 'entryDate':
        return invoice.entryDate.toDateString();
      case 'delete':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: invoice.isFinalised,
        };
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderSearchBar()}
            </View>
            <PageButton
              text="New Invoice"
              loadingText="Creating..."
              onPress={() => this.setState({ isCreatingInvoice: true })}
            />
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0}
            questionText="Are you sure you want to delete these invoices?"
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText="Delete"
          />
          <SelectModal
            isOpen={this.state.isCreatingInvoice}
            options={this.props.database.objects('Customer')}
            placeholderText="Start typing to select customer"
            queryString={'name BEGINSWITH[c] $0'}
            sortByString={'name'}
            onSelect={name => {
              this.onNewInvoice(name);
              this.setState({ isCreatingInvoice: false });
            }}
            onClose={() => this.setState({ isCreatingInvoice: false })}
          />
        </View>
      </View>
    );
  }
}

CustomerInvoicesPage.propTypes = {
  currentUser: React.PropTypes.object.isRequired,
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
  settings: React.PropTypes.object.isRequired,
};

const COLUMNS = [
  {
    key: 'otherPartyName',
    width: 3,
    title: 'CUSTOMER',
    sortable: true,
  },
  {
    key: 'serialNumber',
    width: 1,
    title: 'INVOICE\nNUMBER',
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
    width: 3,
    title: 'COMMENT',
    lines: 2,
  },
  {
    key: 'delete',
    width: 1,
    title: 'DELETE',
    alignText: 'center',
  },
];
