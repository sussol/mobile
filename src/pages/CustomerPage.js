/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import { View } from 'react-native';

import { createRecord } from '../database';
import { PageButton, PageInfo } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';
import { formatStatus, sortDataBy } from '../utilities';
import { buttonStrings, navStrings, pageInfoStrings } from '../localization';

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
export class CustomerPage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.transactions = props.database.objects('Transaction')
                                            .filtered('type == "customer_invoice"')
                                            .filtered('otherParty.name == $0', props.customer.name);
    this.state.sortBy = 'entryDate';
    this.columns = COLUMNS;
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.navigateToInvoice = this.navigateToInvoice.bind(this);
    this.onNewInvoice = this.onNewInvoice.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
    this.renderPageInfo = this.renderPageInfo.bind(this);
    this.renderCell = this.renderCell.bind(this);
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

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const data = this.state.transactions;
    let sortDataType;
    switch (sortBy) {
      case 'serialNumber':
      case 'numberOfItems':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    return sortDataBy(data, sortBy, sortDataType, isAscending);
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

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderPageInfo()}
            </View>
            <PageButton
              text={buttonStrings.new_invoice}
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
  currentUser: React.PropTypes.object.isRequired,
  customer: React.PropTypes.object.isRequired,
  database: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'serialNumber',
    width: 1,
    titleKey: 'id',
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
    width: 2,
    titleKey: 'entered_date',
    sortable: true,
  },
  {
    key: 'numberOfItems',
    width: 1,
    titleKey: 'items',
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'comment',
    width: 3,
    titleKey: 'comment',
  },
];
