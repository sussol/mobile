/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import {
  formatDate,
  parsePositiveInteger,
  sortDataBy,
} from '../utilities';
import { createRecord } from '../database';
import { GenericPage } from './GenericPage';
import globalStyles, { dataTableStyles } from '../globalStyles';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageContentModal,
  PageInfo,
  TextEditor,
  ExpiryTextInput,
} from '../widgets';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

const SORT_DATA_TYPES = {
  itemName: 'string',
  itemCode: 'string',
  batch: 'string',
  numberOfPacks: 'number',
  packSize: 'number',
};

export class SupplierInvoicePage extends React.Component {
  constructor(props) {
    super(props);
    this.dataFilters = {
      searchKey: '',
      sortBy: 'itemName',
      isAscending: true,
    };
    this.state = {
      modalKey: null,
      modalIsOpen: false,
      selection: [],
    };
    autobind(this);
  }

  // Delete transaction batch then delete transactionItem if no more
  // transaction batches
  onDeleteConfirm() {
    const { selection } = this.state;
    const { transaction, database } = this.props;
    database.write(() => {
      transaction.removeTransactionBatchesById(database, selection);
    });
    this.setState({ selection: [] }, this.refreshData);
  }

  onDeleteCancel() {
    this.setState({ selection: [] }, this.refreshData);
  }

  onSelectionChange(newSelection) {
    this.setState({ selection: newSelection });
  }

  /**
   * Respond to the user editing fields
   * @param  {string} key             key of edited field
   * @param  {object} transactionBatch The transaction batch from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionBatch, newValue) {
    const { database } = this.props;
    database.write(() => {
      switch (key) {
        case 'quantity':
          // Should edit the numberOfPacks directly if packSize becomes an editable column
          // that represents the number of packs counted
          transactionBatch.setTotalQuantity(database, parsePositiveInteger(newValue));
          break;
        case 'expiryDate':
          transactionBatch.expiryDate = newValue;
          break;
        default:
          break;
      }
      database.save('TransactionBatch', transactionBatch);
    });
  }

  getModalTitle() {
    const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_invoice_comment;
      case THEIR_REF_EDIT:
        return modalStrings.edit_their_reference;
    }
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
    const { database, transaction } = this.props;
    const transactionBatches = transaction
      .getTransactionBatches(database)
      .filtered('itemName BEGINSWITH[c] $0', searchTerm);

    const sortDataType = SORT_DATA_TYPES[sortBy] || 'realm';

    this.setState({
      data: sortDataBy(transactionBatches, sortBy, sortDataType, isAscending),
    });
  }

  addNewLine(item) {
    const { database, transaction } = this.props;
    database.write(() => {
      const transactionItem = createRecord(database, 'TransactionItem', transaction, item);
      createRecord(
        database,
        'TransactionBatch',
        transactionItem,
        createRecord(database, 'ItemBatch', item, '')
      );
    });
  }

  openModal(key) {
    this.setState({
      modalKey: key,
      modalIsOpen: true,
    });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  openItemSelector() {
    this.openModal(MODAL_KEYS.ITEM_SELECT);
  }

  openCommentEditor() {
    this.openModal(MODAL_KEYS.COMMENT_EDIT);
  }

  openTheirRefEditor() {
    this.openModal(MODAL_KEYS.THEIR_REF_EDIT);
  }

  renderPageInfo() {
    const { transaction } = this.props;
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(transaction.entryDate),
        },
        {
          title: `${pageInfoStrings.confirm_date}:`,
          info: formatDate(transaction.confirmDate),
        },
      ],
      [
        {
          title: `${pageInfoStrings.supplier}:`,
          info: this.props.transaction.otherParty && this.props.transaction.otherParty.name,
        },
        {
          title: `${pageInfoStrings.their_ref}:`,
          info: transaction.theirRef,
          onPress: this.openTheirRefEditor,
          editableType: 'text',
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: transaction.comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return (
      <PageInfo columns={infoColumns} isEditingDisabled={this.props.transaction.isFinalised} />
    );
  }

  renderCell(key, transactionBatch) {
    const isEditable = !this.props.transaction.isFinalised;
    const type = isEditable ? 'editable' : 'text';
    const editableCell = {
      type: type,
      cellContents: String(transactionBatch[key]),
    };
    switch (key) {
      default:
        return {
          cellContents: transactionBatch[key],
        };
      case 'numberOfPacks':
        return editableCell;
      case 'expiryDate': {
        return (
          <ExpiryTextInput
            isEditable={isEditable}
            onEndEditing={(newValue) => this.onEndEditing(key, transactionBatch, newValue)}
            text={transactionBatch[key]}
            style={dataTableStyles.text}
          />
        );
      }
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: this.props.transaction.isFinalised,
        };
    }
  }

  renderModalContent() {
    const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
    const { database, transaction } = this.props;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString={'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'}
            queryStringSecondary={'name CONTAINS[c] $0'}
            sortByString={'name'}
            onSelect={item => {
              this.addNewLine(item);
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={transaction.comment}
            onEndEditing={newComment => {
              if (newComment !== transaction.comment) {
                database.write(() => {
                  transaction.comment = newComment;
                  database.save('Transaction', transaction);
                });
              }
              this.closeModal();
            }}
          />
        );
      case THEIR_REF_EDIT:
        return (
          <TextEditor
            text={transaction.theirRef}
            onEndEditing={newTheirRef => {
              if (newTheirRef !== transaction.theirRef) {
                database.write(() => {
                  transaction.theirRef = newTheirRef;
                  database.save('Transaction', transaction);
                });
              }
              this.closeModal();
            }}
          />
        );
    }
  }

  renderAddBatchButton() {
    return (
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.new_line}
        onPress={this.openItemSelector}
        isDisabled={this.props.transaction.isFinalised}
      />
    );
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopLeftComponent={this.renderPageInfo}
        renderTopRightComponent={this.renderAddBatchButton}
        onEndEditing={this.onEndEditing}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'itemCode',
            width: 1,
            title: tableStrings.item_code,
            sortable: true,
          },
          {
            key: 'itemName',
            width: 3,
            title: tableStrings.item_name,
            sortable: true,
          },
          {
            key: 'quantity',
            width: 1,
            title: tableStrings.quantity,
            alignText: 'right',
          },
          {
            key: 'expiryDate',
            width: 1,
            title: tableStrings.batch_expiry,
            alignText: 'center',
          },
          {
            key: 'remove',
            width: 1,
            title: tableStrings.remove,
            alignText: 'center',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        finalisableDataType={'Transaction'}
        database={this.props.database}
        selection={this.state.selection}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      >
        <BottomConfirmModal
          isOpen={this.state.selection.length > 0 && !this.props.transaction.isFinalised}
          questionText={modalStrings.remove_these_items}
          onCancel={() => this.onDeleteCancel()}
          onConfirm={() => this.onDeleteConfirm()}
          confirmText={modalStrings.remove}
        />
        <PageContentModal
          isOpen={this.state.modalIsOpen && !this.props.transaction.isFinalised}
          onClose={this.closeModal}
          title={this.getModalTitle()}
        >
          {this.renderModalContent()}
        </PageContentModal>
      </GenericPage>
    );
  }
}

export function checkForFinaliseError(transaction) {
  if (!transaction.isExternalSupplierInvoice) return null;
  if (transaction.items.length === 0) return modalStrings.add_at_least_one_item_before_finalising;
  if (transaction.totalQuantity === 0) return modalStrings.stock_quantity_greater_then_zero;
  return null;
}

SupplierInvoicePage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  transaction: PropTypes.object,
};
