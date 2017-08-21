/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { BottomConfirmModal, PageButton, SelectModal } from '../widgets';
import { GenericPage } from './GenericPage';
import { createRecord } from '../database';
import { formatStatus, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Transaction'];

/**
* Renders the page for displaying CustomerInvoices.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only customer_invoice.
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
      sortBy: 'entryDate',
      isAscending: false,
    };
    autobind(this);
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

  onSelectionChange(newSelection) {
    this.setState({
      selection: newSelection,
    });
  }

  navigateToInvoice(invoice) {
    // For a customer invoice to be opened for editing in the customer invoice page, we need it to
    // be confirmed, otherwise we could end up in with more of a paticular item being issued across
    // multiple invoices than is available. We generally create customer invoices with the status
    // confirmed, so this is in case a 'nw' or 'sg' invoice came in through sync (i.e. an anomaly)
    if (!invoice.isConfirmed && !invoice.isFinalised) {
      this.props.database.write(() => {
        invoice.confirm(this.props.database);
        this.props.database.save('Transaction', invoice);
      });
    }
    this.setState({ selection: [] }, this.refreshData); // Clear any invoices selected for delete
    this.props.navigateTo(
      'customerInvoice',
      `${navStrings.invoice} ${invoice.serialNumber}`,
      { transaction: invoice },
    );
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
          isDisabled: invoice.isFinalised || invoice.isLinkedToRequisition,
        };
    }
  }

  renderNewInvoiceButton() {
    return (
      <PageButton
        text={buttonStrings.new_invoice}
        onPress={() => this.setState({ isCreatingInvoice: true })}
      />
    );
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopRightComponent={this.renderNewInvoiceButton}
        onRowPress={this.onRowPress}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'otherPartyName',
            width: 2.5,
            title: tableStrings.customer,
            sortable: true,
          },
          {
            key: 'serialNumber',
            width: 1,
            title: tableStrings.invoice_number,
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
        database={this.props.database}
        selection={this.state.selection}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      >
        <BottomConfirmModal
          isOpen={this.state.selection.length > 0}
          questionText={modalStrings.delete_these_invoices}
          onCancel={this.onDeleteCancel}
          onConfirm={this.onDeleteConfirm}
          confirmText={modalStrings.delete}
        />
        <SelectModal
          isOpen={this.state.isCreatingInvoice}
          options={this.props.database.objects('Customer')}
          placeholderText={modalStrings.start_typing_to_select_customer}
          queryString={'name BEGINSWITH[c] $0'}
          sortByString={'name'}
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

CustomerInvoicesPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  database: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
};
