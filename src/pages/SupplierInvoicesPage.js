/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { SelectModal, PageButton, BottomConfirmModal } from '../widgets';
import PropTypes from 'prop-types';
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
export class SupplierInvoicesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: props.database.objects('SupplierInvoice'),
      isCreatingInvoice: false,
      selection: [],
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'serialNumber',
      isAscending: false,
    };
  }

  onDeleteConfirm = () => {
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
    this.setState({ selection: [] }, this.refreshData);
  }

  onDeleteCancel = () => this.setState({ selection: [] }, this.refreshData);

  onSelectionChange = (newSelection) => this.setState({ selection: newSelection });

  onRowPress = (invoice) => this.navigateToInvoice(invoice);

  /**
   * Create new Supplier Invoice and takes user to the editing SI page
   */
  onNewSupplierInvoice = (otherParty) => {
    const { database, currentUser } = this.props;
    let invoice;
    database.write(() => {
      invoice = createRecord(database, 'SupplierInvoice', otherParty, currentUser);
    });
    this.navigateToInvoice(invoice);
  }

  navigateToInvoice = (invoice) => {
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
    this.props.navigateTo('supplierInvoice', `${navStrings.invoice} ${invoice.serialNumber}`, {
      transaction: invoice,
    });
  }

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.state.transactions.filtered('serialNumber BEGINSWITH[c] $0', searchTerm);
    let sortDataType;
    switch (sortBy) {
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

  renderCell = (key, invoice) => {
    switch (key) {
      default:
        return invoice[key];
      case 'status':
        return formatStatus(invoice.status);
      case 'entryDate':
        return invoice.entryDate.toDateString();
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: invoice.isFinalised || !invoice.isExternalSupplierInvoice,
        };
    }
  }

  renderNewInvoiceButton = () => (
    <PageButton
      text={buttonStrings.new_supplier_invoice}
      onPress={() => this.setState({ isCreatingInvoice: true })}
    />
  )

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
            key: 'serialNumber',
            width: 1,
            title: tableStrings.invoice_number,
            sortable: true,
          },
          {
            key: 'otherPartyName',
            width: 2.5,
            title: tableStrings.supplier,
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
            key: 'remove',
            width: 1,
            title: tableStrings.remove,
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
          questionText={modalStrings.remove_these_items}
          onCancel={() => this.onDeleteCancel()}
          onConfirm={() => this.onDeleteConfirm()}
          confirmText={modalStrings.remove}
        />
        <SelectModal
          isOpen={this.state.isCreatingInvoice}
          options={this.props.database.objects('ExternalSupplier')}
          placeholderText={modalStrings.start_typing_to_select_supplier}
          queryString={'name BEGINSWITH[c] $0'}
          sortByString={'name'}
          onSelect={name => {
            this.onNewSupplierInvoice(name);
            this.setState({ isCreatingInvoice: false });
          }}
          onClose={() => this.setState({ isCreatingInvoice: false })}
          title={modalStrings.search_for_the_supplier}
        />
      </GenericPage>
    );
  }
}

SupplierInvoicesPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  database: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
};
