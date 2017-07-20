/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { View } from 'react-native';

import { createRecord } from '../database';
import { PageButton, PageInfo } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericPage } from './GenericPage';
import { formatStatus, sortDataBy } from '../utilities';
import { buttonStrings, navStrings, pageInfoStrings, tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Transaction'];

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
export class CustomerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: props.database.objects('Transaction')
                                  .filtered('type == "customer_invoice"')
                                  .filtered('otherParty.name == $0', props.customer.name),
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'entryDate',
      isAscending: true,
    };
    autobind(this);
  }

  onNewInvoice() {
    const { database, customer, currentUser } = this.props;
    let invoice;
    database.write(() => {
      invoice = createRecord(database, 'CustomerInvoice', customer, currentUser);
    });
    this.navigateToInvoice(invoice);
  }

  onRowPress(invoice) {
    this.navigateToInvoice(invoice);
  }

  navigateToInvoice(invoice) {
    const pageTitle = `${navStrings.invoice} ${invoice.serialNumber}`;
    this.props.navigateTo('customerInvoice', pageTitle, { transaction: invoice });
  }

  updateDataFilters(newSearchTerm, newSortBy, newIsAscending) {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  refreshData(newSearchTerm, newSortBy, newIsAscending) {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.state.transactions.filtered(
      'serialNumber BEGINSWITH[c] $0',
      searchTerm,
    );
    let sortDataType;
    switch (sortBy) {
      case 'serialNumber':
      case 'numberOfItems':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({ data: sortDataBy(data, sortBy, sortDataType, isAscending) });
  }

  renderPageInfo() {
    const { customer } = this.props;
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.address}:`,
          info: customer.billingAddress && customer.billingAddress.line1,
        },
        {
          info: customer.billingAddress && customer.billingAddress.line2,
        },
        {
          info: customer.billingAddress && customer.billingAddress.line3,
        },
        {
          info: customer.billingAddress && customer.billingAddress.line4,
        },
      ],
      [
        {
          title: `${pageInfoStrings.code}:`,
          info: customer.code,
        },
      ],
    ];
    return <PageInfo columns={infoColumns} />;
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
      case 'numberOfItems':
        return transaction.numberOfItems;
      case 'comment':
        return transaction.comment ? transaction.comment : '';
    }
  }

  renderNewInvoiceButton() {
    return (
      <View style={globalStyles.pageTopRightSectionContainer}>
        <PageButton
          text={buttonStrings.new_invoice}
          onPress={this.onNewInvoice}
        />
      </View>
    );
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopLeftComponent={this.renderPageInfo}
        renderTopRightComponent={this.renderNewInvoiceButton}
        onRowPress={this.onRowPress}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'serialNumber',
            width: 1,
            title: tableStrings.id,
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
            width: 2,
            title: tableStrings.entered_date,
            sortable: true,
          },
          {
            key: 'numberOfItems',
            width: 1,
            title: tableStrings.items,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'comment',
            width: 3,
            title: tableStrings.comment,
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        database={this.props.database}
        {...this.props.genericTablePageStyles}
      />
    );
  }
}

CustomerPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  customer: PropTypes.object.isRequired,
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
};
