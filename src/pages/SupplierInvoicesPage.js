/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View } from 'react-native';
import { SelectModal, PageButton } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericPage } from './GenericPage';
import { createRecord } from '../database';
import { formatStatus, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Transaction'];

/**
* Renders the page for displaying SupplierInvoices.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class SupplierInvoicesPage extends GenericPage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'entryDate';
    this.state.isAscending = false;
    this.state.isCreatingInvoice = false;
    this.state.transactions = props.database.objects('Transaction')
                                            .filtered('type == "supplier_invoice"')
                                            .filtered('otherParty.type != "inventory_adjustment"');
    this.state.columns = [
      {
        key: 'serialNumber',
        width: 1,
        title: tableStrings.invoice_number,
        sortable: true,
      },
      {
        key: 'status',
        width: 1,
        title: tableStrings.status,
        sortable: true,
      },
      {
        key: 'entryDate',
        width: 1,
        title: tableStrings.entered_date,
        sortable: true,
      },
      {
        key: 'comment',
        width: 3,
        title: tableStrings.comment,
      },
    ];
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.getFilteredSortedData = this.getFilteredSortedData.bind(this);
    this.onNewSupplierInvoice = this.onNewSupplierInvoice.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
  }

  /**
   * Create new Supplier Invoice and takes user to the editing SI page
   */
  onNewSupplierInvoice(otherParty) {
    const { database, currentUser } = this.props;
    let invoice;
    database.write(() => {
      invoice = createRecord(database, 'SupplierInvoice', otherParty, currentUser);
    });
    this.onRowPress(invoice);
  }

  onRowPress(invoice) {
    // For a supplier invoice to be opened for in the supplier invoice page, we need it to be
    // either new or finalised, but not confirmed - if someone were to reduce the amount of stock on
    // a confirmed supplier invoice, but it had already been issued in a customer invoice, we would
    // have to deal with a tricky situation. We create supplier invoices with the status 'new', and
    // then jump to 'finalised', so this is in case a 'cn' invoice came in through sync (an anomaly)
    if (invoice.isConfirmed) {
      this.props.database.write(() => {
        invoice.finalise(this.props.database);
        this.props.database.save('Transaction', invoice);
      });
    }
    this.props.navigateTo('supplierInvoice',
                          `${navStrings.invoice} ${invoice.serialNumber}`,
                          { transaction: invoice });
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getFilteredSortedData(searchTerm, sortBy, isAscending) {
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

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderSearchBar()}
            </View>
            <View style={globalStyles.pageTopRightSectionContainer}>
              <PageButton
                text={buttonStrings.new_invoice}
                onPress={() => this.setState({ isCreatingInvoice: true })}
              />
            </View>
          </View>
            {this.renderDataTable()}
          <SelectModal
            isOpen={this.state.isCreatingInvoice}
            options={this.props.database.objects('Supplier')}
            placeholderText={modalStrings.start_typing_to_select_customer}
            queryString={'name BEGINSWITH[c] $0'}
            sortByString={'name'}
            onSelect={name => {
              this.onNewSupplierInvoice(name);
              this.setState({ isCreatingInvoice: false });
            }}
            onClose={() => this.setState({ isCreatingInvoice: false })}
            title={modalStrings.search_for_the_customer}
          />
        </View>
      </View>
    );
  }
}

SupplierInvoicesPage.propTypes = {
  database: React.PropTypes.object,
  navigateTo: React.PropTypes.func.isRequired,
};
