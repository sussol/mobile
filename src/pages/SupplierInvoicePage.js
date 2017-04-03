/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View } from 'react-native';
import { formatDate, parsePositiveInteger, parsePositiveDouble, sortDataBy } from '../utilities';
import { createRecord } from '../database';
import { GenericPage } from './GenericPage';
import globalStyles from '../globalStyles';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import {
  AutocompleteSelector,
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

export class SupplierInvoicePage extends GenericPage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    const isNotExternalSI = this.props.transaction.isNotExternalSI;
    this.state.columns = [
      {
        key: 'itemCode',
        width: 1,
        title: tableStrings.item_code,
        sortable: true,
      },
      {
        key: 'itemName',
        width: 2,
        title: tableStrings.item_name,
        sortable: true,
      },
    ]; // for supplier invoice
    if (isNotExternalSI) {
      this.state.columns.push(
        {
          key: 'totalQuantitySent',
          width: 1,
          title: tableStrings.number_sent,
          sortable: true,
          alignText: 'right',
        },
        {
          key: 'numReceived',
          width: 1,
          title: tableStrings.number_recieved,
          sortable: true,
          alignText: 'right',
        });
    } // for supplier invoice
    else {
      this.state.columns.push(
        {
          key: 'quantity',
          width: 1,
          title: tableStrings.number_recieved,
          sortable: true,
          alignText: 'right',
        },
        {
          key: 'batchName',
          width: 1,
          title: tableStrings.batch_name,
          sortable: false,
          alignText: 'right',
        },
        {
          key: 'batchExpiry',
          width: 1,
          title: tableStrings.batch_expiry,
          sortable: false,
          alignText: 'right',
        },
        {
          key: 'batchCostPrice',
          width: 1,
          title: tableStrings.batch_cost_price,
          sortable: false,
          alignText: 'right',
        },
      );
    }
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.finalisableDataType = 'Transaction';
    this.getFilteredSortedData = this.getFilteredSortedData.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.openItemSelector = this.openItemSelector.bind(this);
    this.openCommentEditor = this.openCommentEditor.bind(this);
    this.openTheirRefEditor = this.openTheirRefEditor.bind(this);
    this.getModalTitle = this.getModalTitle.bind(this);
    this.renderConditionalInfo = this.renderConditionaInfo.bind(this);
    this.addNewSIitem = this.addNewSIitem.bind(this);
  }
  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getFilteredSortedData(searchTerm, sortBy, isAscending) {
    const data = this.props.transaction.items.filtered(
      'item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0',
      searchTerm
    );
    let sortDataType;
    switch (sortBy) {
      case 'itemName':
      case 'itemCode':
        sortDataType = 'string';
        break;
      case 'totalQuantitySent':
      case 'numReceived':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    return sortDataBy(data, sortBy, sortDataType, isAscending);
  }

  /**
   * Respond to the user editing fields
   * @param  {string} key             key of edited field
   * @param  {object} transactionItem The transaction item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionItem, newValue) {
    console.log(key + ' ' + newValue);
    const { database, transaction } = this.props;
    database.write(() => {
      if (transaction.isNotExternalSI) {
        transactionItem.setTotalQuantity(database, parsePositiveInteger(newValue));
      }
      else {
        switch (key) {
          case 'quantity':
            transactionItem.setActualBatchQuantity(database, parsePositiveInteger(newValue));
            break;
          case 'batchCostPrice':
            transactionItem.setBatchCostPrice(database, parsePositiveDouble(newValue));
            break;
          case 'batchName':
            transactionItem.setBatchName(database, newValue);
            break;
          case 'batchExpiry':
            transactionItem.setBatchExpiry(database, newValue);
            break;
          default:
            break;
        }
      }
      database.save('TransactionItem', transactionItem);
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
      ],
      this.renderConditionalInfo(transaction),
    ];
    return <PageInfo columns={infoColumns} />;
  }

  renderConditionaInfo(transaction) {
    if (!transaction.isNotExternalSI) {
      return [{
        title: `${pageInfoStrings.customer}:`,
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
      }];
    }
    return [{
      title: `${pageInfoStrings.their_ref}:`,
      info: transaction.theirRef,
    },
    {
      title: `${pageInfoStrings.comment}:`,
      info: transaction.comment,
    }];
  }
  renderCell(key, transactionItem) {
    const isEditable = !this.props.transaction.isFinalised;
    const type = isEditable ? 'editable' : 'text';
    switch (key) {
      default:
        return transactionItem[key];
      case 'numReceived': {
        const renderedCell = {
          type: type,
          cellContents: transactionItem.totalQuantity,
        };
        return renderedCell;
      }
      case 'quantity': {
        const renderedCell = {
          type: type,
          cellContents: transactionItem.getBatchQuantity,
        };
        return renderedCell;
      }
      case 'batchName': {
        const renderedCell = {
          type: type,
          cellContents: transactionItem.batchName,
        };
        return renderedCell;
      }
      case 'batchCostPrice': {
        const renderedCell = {
          type: type,
          cellContents: transactionItem.batchCostPrice,
        };
        return renderedCell;
      }
    }
  }

  addNewSIitem(item) {
    const { database, transaction } = this.props;
    database.write(() => {
      const transactionItem = createRecord(database, 'TransactionItem', transaction, item);
      createRecord(database, 'TransactionBatch', transactionItem,
        createRecord(database, 'ItemBatch', item, 'testStr'));
    });
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
            onSelect={(item) => {
              this.addNewSIitem(item);
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={(item) => `${item.name}`}
            renderRightText={(item) => `${item.totalQuantity}`}
          />
        );
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={transaction.comment}
            onEndEditing={(newComment) => {
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
            onEndEditing={(newTheirRef) => {
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
                text={buttonStrings.new_item}
                onPress={this.openItemSelector}
                isDisabled={this.props.transaction.isNotExternalSI}
              />
            </View>
          </View>
          {this.renderDataTable()}
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

SupplierInvoicePage.propTypes = {
  database: React.PropTypes.object,
  transaction: React.PropTypes.object,
};
