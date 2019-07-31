/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericPage } from './GenericPage';

import { createRecord } from '../database';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';
import { formatStatus, sortDataBy } from '../utilities';
import { BottomConfirmModal, PageButton, SelectModal } from '../widgets';

const DATA_TYPES_SYNCHRONISED = ['Transaction'];

/**
 * Renders the page for displaying customer invoices.
 *
 * @prop   {Realm}          database      App database.
 * @prop   {func}           navigateTo    Callback for navigation stack.
 * @state  {Realm.Results}  transactions  Transactions filtered by |customer_invoice|.
 */
export class CustomerInvoicesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: props.database.objects('CustomerInvoice'),
      selection: [],
      isCreatingInvoice: false,
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'serialNumber',
      isAscending: false,
    };
  }

  onNewInvoice = otherParty => {
    const { database, currentUser } = this.props;
    let invoice;
    database.write(() => {
      invoice = createRecord(database, 'CustomerInvoice', otherParty, currentUser);
    });
    this.navigateToInvoice(invoice);
  };

  onDeleteConfirm = () => {
    const { selection, transactions } = this.state;
    const { database } = this.props;

    database.write(() => {
      const transactionsToDelete = [];
      for (let i = 0; i < selection.length; i += 1) {
        const transaction = transactions.find(
          currentTransaction => currentTransaction.id === selection[i]
        );
        if (transaction.isValid() && !transaction.isFinalised) {
          transactionsToDelete.push(transaction);
        }
      }
      database.delete('Transaction', transactionsToDelete);
    });
    this.setState({ selection: [] });
    this.refreshData();
  };

  onDeleteCancel = () => {
    this.setState({ selection: [] });
    this.refreshData();
  };

  onRowPress = invoice => this.navigateToInvoice(invoice);

  onSelectionChange = newSelection => this.setState({ selection: newSelection });

  navigateToInvoice = invoice => {
    const { database, navigateTo } = this.props;

    // For a customer invoice to be opened for editing in the customer invoice page, it must be
    // confirmed. If this is not enforced, it is possible for a particular item being issued
    // across multiple invoices in larger quantities than are available.

    // Customer invoices are generally created with the status confirmed. This handles unexpected
    // cases of an incoming sycned invoice with status 'nw' or 'sg'.
    if (!invoice.isConfirmed && !invoice.isFinalised) {
      database.write(() => {
        invoice.confirm(database);
        database.save('Transaction', invoice);
      });
    }
    this.setState({ selection: [] }, this.refreshData); // Clear any invoices selected for deletion.
    navigateTo('customerInvoice', `${navStrings.invoice} ${invoice.serialNumber}`, {
      transaction: invoice,
    });
  };

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // (... != null) checks for null or undefined (implicitly type coerced to null).
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  };

  /**
   * Returns updated data filtered by |searchTerm| and ordered by |sortBy| and |isAscending|.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    const { transactions } = this.state;

    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;

    const data = transactions.filtered(
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
    this.setState({
      data: sortDataBy(data, sortBy, sortDataType, isAscending),
    });
  };

  renderCell = (key, invoice) => {
    switch (key) {
      default:
        return invoice[key];
      case 'status':
        return formatStatus(invoice.status);
      case 'entryDate':
        return (invoice.entryDate && invoice.entryDate.toDateString()) || 'N/A';
      case 'delete':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: invoice.isFinalised || invoice.isLinkedToRequisition,
        };
    }
  };

  renderNewInvoiceButton = () => (
    <PageButton
      text={buttonStrings.new_invoice}
      onPress={() => this.setState({ isCreatingInvoice: true })}
    />
  );

  render() {
    const { database, genericTablePageStyles, topRoute } = this.props;
    const { data, isCreatingInvoice, selection } = this.state;

    return (
      <GenericPage
        data={data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopRightComponent={this.renderNewInvoiceButton}
        onRowPress={this.onRowPress}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'serialNumber',
            width: 1.5,
            title: tableStrings.invoice_number,
            sortable: true,
          },
          {
            key: 'otherPartyName',
            width: 2.5,
            title: tableStrings.customer,
            sortable: true,
          },
          {
            key: 'status',
            width: 2,
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
            key: 'comment',
            width: 3,
            title: tableStrings.comment,
            lines: 2,
          },
          {
            key: 'delete',
            width: 1,
            title: tableStrings.delete,
            alignText: 'center',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        database={database}
        selection={selection}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        <BottomConfirmModal
          isOpen={selection.length > 0}
          questionText={modalStrings.delete_these_invoices}
          onCancel={this.onDeleteCancel}
          onConfirm={this.onDeleteConfirm}
          confirmText={modalStrings.delete}
        />
        <SelectModal
          isOpen={isCreatingInvoice}
          options={database.objects('Customer')}
          placeholderText={modalStrings.start_typing_to_select_customer}
          queryString="name BEGINSWITH[c] $0"
          sortByString="name"
          onSelect={name => {
            this.onNewInvoice(name);
            this.setState({ isCreatingInvoice: false });
          }}
          onClose={() => this.setState({ isCreatingInvoice: false })}
          title={modalStrings.search_for_the_customer}
        />
      </GenericPage>
    );
  }
}

export default CustomerInvoicesPage;

/* eslint-disable react/require-default-props, react/forbid-prop-types */
CustomerInvoicesPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  database: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
};
