/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View } from 'react-native';
import {
  formatDate,
  parsePositiveFloat,
  parsePositiveInteger,
  formatExpiryDate,
  parseExpiryDate,
  sortDataBy,
} from '../utilities';
import { createRecord } from '../database';
import { GenericPage } from './GenericPage';
import globalStyles from '../globalStyles';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageContentModal,
  PageInfo,
  TextEditor,
} from '../widgets';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

export class ExternalSupplierInvoicePage extends GenericPage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.state.totalPrice = 0;
    this.state.expiryModelIsOpen = false;
    this.state.columns = [
      {
        key: 'itemCode',
        width: 2,
        title: tableStrings.item_code,
        sortable: true,
      },
      {
        key: 'itemName',
        width: 4,
        title: tableStrings.item_name,
        sortable: true,
      },
      {
        key: 'packSize',
        width: 1.3,
        title: tableStrings.pack_size,
        alignText: 'center',
      },
      {
        key: 'numberOfPacks',
        width: 1.3,
        title: tableStrings.quantity,
        alignText: 'center',
      },
      {
        key: 'batch',
        width: 1.8,
        title: tableStrings.batch_name,
        alignText: 'center',
      },
      {
        key: 'expiryDate',
        width: 2,
        title: tableStrings.batch_expiry,
        alignText: 'center',
      },
      {
        key: 'costPrice',
        width: 1.4,
        title: tableStrings.batch_cost_price,
        alignText: 'center',
      },
      {
        key: 'remove',
        width: 1,
        title: tableStrings.remove,
        alignText: 'center',
      },
    ];
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.finalisableDataType = 'Transaction';
    this.getFilteredSortedData = this.getFilteredSortedData.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.openItemSelector = this.openItemSelector.bind(this);
    this.openCommentEditor = this.openCommentEditor.bind(this);
    this.openTheirRefEditor = this.openTheirRefEditor.bind(this);
    this.getModalTitle = this.getModalTitle.bind(this);
    this.addNewLine = this.addNewLine.bind(this);
  }
  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   * Dealing with TransactionBatch as oppose to TransactionItems
   * to be able to add miltiple batches for item
   * also total price is calculated here
   */
  getFilteredSortedData(searchTerm, sortBy, isAscending) {
    const { database, transaction } = this.props;
    console.log(transaction.items);
    const transactionBatches = transaction.transactionBatches(database)
      .filtered('itemName BEGINSWITH[c] $0', searchTerm);

    // check to see if transactionBatches exist
    if (transactionBatches.length === 0) {
      this.setState({ totalPrice: 0 });
      return [];
    }

    let sortDataType;
    switch (sortBy) {
      case 'itemName':
      case 'itemCode':
      case 'batch':
        sortDataType = 'string';
        break;
      case 'numberOfPacks':
      case 'packSize':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    // calculate and set total price
    const tPrice = transactionBatches.reduce(
      (sum, tBatch) => sum + tBatch.costPrice * tBatch.numberOfPacks,
      0
    );
    this.setState({ totalPrice: tPrice });
    return sortDataBy(transactionBatches, sortBy, sortDataType, isAscending);
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
        case 'numberOfPacks':
          transactionBatch.numberOfPacks = parsePositiveFloat(newValue);
          break;
        case 'costPrice':
          transactionBatch.costPrice = parsePositiveFloat(newValue);
          break;
        case 'packSize': {
          const tempPackSize = parsePositiveInteger(newValue);
          transactionBatch.packSize = tempPackSize !== 0 ? tempPackSize : 1;
          break;
        }
        case 'batch':
          if (newValue) transactionBatch.batch = newValue;
          break;
        case 'expiryDate':
          {
            const expiryDate = parseExpiryDate(newValue);
            if (expiryDate) {
              transactionBatch.expiryDate = expiryDate;
            }
          }
          break;
        default:
          break;
      }
      database.save('TransactionBatch', transactionBatch);
    });
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
        {
          title: `${pageInfoStrings.total_price}:`,
          info: this.state.totalPrice,
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
    switch (key) {
      default:
        return transactionBatch[key];
      case 'packSize': {
        const renderedCell = {
          type: type,
          cellContents: String(transactionBatch.packSize),
        };
        return renderedCell;
      }
      case 'numberOfPacks': {
        const renderedCell = {
          type: type,
          cellContents: String(transactionBatch.numberOfPacks),
        };
        return renderedCell;
      }
      case 'batch': {
        const renderedCell = {
          type: type,
          cellContents: transactionBatch.batch,
          keyboardType: 'default',
        };
        return renderedCell;
      }
      case 'costPrice': {
        const renderedCell = {
          type: type,
          cellContents: String(transactionBatch.costPrice),
        };
        return renderedCell;
      }
      case 'expiryDate': {
        const expiryDate = formatExpiryDate(transactionBatch.expiryDate);
        const renderedCell = {
          type: type,
          cellContents: expiryDate || 'month/year',
        };
        return renderedCell;
      }
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: this.props.transaction.isFinalised,
        };
    }
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

  // Delete transaction batch then delete transactionItem if no more
  // transaction batches
  onDeleteConfirm() {
    const { selection } = this.state;
    const { transaction, database } = this.props;
    const transactionBatches = transaction.transactionBatches(database);
    database.write(() => {
      // Find each selected trasnaction batch by id
      selection.forEach(transactionBatchID => {
        const transactionBatch = transactionBatches.find(tBatch =>
                                    tBatch.id === transactionBatchID);

        database.delete('ItemBatch', transactionBatch.itemBatch);
        database.delete('TransactionBatch', transactionBatch);
      });

      transaction.pruneBatchlessItems(database);
    });
    this.setState({ selection: [] }, this.refreshData);
  }

  onDeleteCancel() {
    this.setState({ selection: [] }, this.refreshData);
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
  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderPageInfo()}
              {this.renderSearchBar()}
            </View>
            <View style={globalStyles.pageTopRightSectionContainer}>
              <PageButton
                style={globalStyles.topButton}
                text={buttonStrings.add_batch}
                onPress={this.openItemSelector}
                isDisabled={this.props.transaction.isFinalised}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0 && !this.props.transaction.isFinalised}
            questionText={modalStrings.remove_these_items}
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText={modalStrings.remove}
          />
          <PageContentModal
            isOpen={this.state.pageContentModalIsOpen && !this.props.transaction.isFinalised}
            onClose={this.closeModal}
            title={this.getModalTitle()}
          >
            {this.renderModalContent()}
          </PageContentModal>
        </View>
      </View>
    );
  }
}
export function checkForFinaliseError(transaction) {
  if (transaction.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  } else if (transaction.totalQuantity === 0) {
    return modalStrings.stock_quantity_greater_then_zero;
  }
  return null;
}
ExternalSupplierInvoicePage.propTypes = {
  database: React.PropTypes.object,
  transaction: React.PropTypes.object,
};
