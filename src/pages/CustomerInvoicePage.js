/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
} from 'react-native';

import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { formatDate, parsePositiveInteger } from '../utilities';
import { createRecord } from '../database';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageContentModal,
  PageInfo,
  TextEditor,
} from '../widgets';

const DATA_TYPES_DISPLAYED =
        ['Transaction', 'TransactionBatch', 'TransactionItem', 'Item', 'ItemBatch'];
const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

export class CustomerInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.state.modalKey = null;
    this.state.pageContentModalIsOpen = false;
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onAddMasterItems = this.onAddMasterItems.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.openModal = this.openModal.bind(this);
    this.openItemSelector = this.openItemSelector.bind(this);
    this.openCommentEditor = this.openCommentEditor.bind(this);
    this.openTheirRefEditor = this.openTheirRefEditor.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.renderPageInfo = this.renderPageInfo.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    let data = this.props.transaction.items
                .filtered('item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0', searchTerm);
    switch (sortBy) {
      case 'itemCode':
        data = data.slice().sort((a, b) =>
          a.item.code.localeCompare(b.item.code));
        if (!isAscending) data.reverse();
        break;
      case 'itemName':
        data = data.slice().sort((a, b) =>
          a.item.name.localeCompare(b.item.name));
        if (!isAscending) data.reverse();
        break;
      case 'availableQuantity':
        data = data.slice().sort((a, b) =>
          Number(a.availableQuantity) - Number(b.availableQuantity));
        if (!isAscending) data.reverse();
        break;
      case 'totalQuantity': // Special case for correct number based sorting
        // Convert to javascript array obj then sort with standard array functions.
        data = data.slice().sort((a, b) =>
          Number(a.totalQuantity) - Number(b.totalQuantity)); // 0,1,2,3...
        if (!isAscending) data.reverse(); // ...3,2,1,0
        break;
      default:
        data = data.sorted(sortBy, !isAscending); // 2nd arg: reverse sort
        break;
    }
    return data;
  }

  onAddMasterItems() {
    this.props.database.write(() => {
      this.props.transaction.addItemsFromMasterList(this.props.database);
      this.props.database.save('Transaction', this.props.transaction);
    });
  }

  /**
   * Respond to the user editing the number in the number received column
   * @param  {string} key             Should always be 'totalQuantity'
   * @param  {object} transactionItem The transaction item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionItem, newValue) {
    if (key !== 'totalQuantity') return;
    this.props.database.write(() => {
      const quantity = Math.min(parsePositiveInteger(newValue), transactionItem.availableQuantity);
      transactionItem.setTotalQuantity(this.props.database, quantity);
      this.props.database.save('TransactionItem', transactionItem);
    });
  }

  onDeleteConfirm() {
    const { selection } = this.state;
    const { transaction, database } = this.props;
    database.write(() => {
      transaction.removeItemsById(database, selection);
      database.save('Transaction', transaction);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel() {
    this.setState({ selection: [] });
    this.refreshData();
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

  openModal(key) {
    this.setState({ modalKey: key, pageContentModalIsOpen: true });
  }

  closeModal() {
    this.setState({ pageContentModalIsOpen: false });
  }

  renderPageInfo() {
    const infoColumns = [
      [
        {
          title: 'Entry Date:',
          info: formatDate(this.props.transaction.entryDate),
        },
        {
          title: 'Confirm Date:',
          info: formatDate(this.props.transaction.confirmDate),
        },
        {
          title: 'Entered By:',
          info: this.props.transaction.enteredBy && this.props.transaction.enteredBy.username,
        },
      ],
      [
        {
          title: 'Customer:',
          info: this.props.transaction.otherParty && this.props.transaction.otherParty.name,
        },
        {
          title: 'Their Ref:',
          info: this.props.transaction.theirRef,
          onPress: this.openTheirRefEditor,
          editableType: 'text',
        },
        {
          title: 'Comment:',
          info: this.props.transaction.comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return (
      <PageInfo
        columns={infoColumns}
        isEditingDisabled={this.props.transaction.isFinalised}
      />
    );
  }

  renderCell(key, transactionItem) {
    switch (key) {
      default:
        return transactionItem[key];
      case 'totalQuantity':
        return {
          cellContents: transactionItem.totalQuantity,
          type: this.props.transaction.isFinalised ? 'text' : 'editable',
        };
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
            sortByString={'name'}
            onSelect={(item) => {
              database.write(() => {
                createRecord(database, 'TransactionItem', transaction, item);
              });
              this.closeModal();
            }}
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
            <View style={globalStyles.verticalContainer}>
              <PageButton
                style={globalStyles.topButton}
                text="New Item"
                onPress={this.openItemSelector}
                isDisabled={this.props.transaction.isFinalised}
              />
              <PageButton
                text="Add Master List Items"
                loadingText="Adding..."
                onPress={this.onAddMasterItems}
                isDisabled={this.props.transaction.isFinalised}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0 && !this.props.transaction.isFinalised}
            questionText="Are you sure you want to remove these items?"
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText="Remove"
          />
          <PageContentModal
            isOpen={this.state.pageContentModalIsOpen && !this.props.transaction.isFinalised}
            onClose={this.closeModal}
          >
            {this.renderModalContent()}
          </PageContentModal>
        </View>
      </View>
    );
  }
}

CustomerInvoicePage.propTypes = {
  database: React.PropTypes.object,
  transaction: React.PropTypes.object,
};

const COLUMNS = [
  {
    key: 'itemCode',
    width: 2,
    title: 'CODE',
    sortable: true,
  },
  {
    key: 'itemName',
    width: 4,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'availableQuantity',
    width: 2,
    title: 'AVAILABLE STOCK',
    sortable: true,
  },
  {
    key: 'totalQuantity',
    width: 2,
    title: 'QUANTITY',
    sortable: true,
  },
  {
    key: 'remove',
    width: 1,
    title: 'REMOVE',
  },
];

/**
 * Check whether a given customer invoice is safe to be finalised. Return null if it is,
 * otherwise return an appropriate error message if not.
 * @param  {object}  customerInvoice  The customer invoice to check
 * @return {string}  An error message if not able to be finalised
 */
export function checkForFinaliseError(customerInvoice) {
  if (customerInvoice.items.length === 0) {
    return 'You need to add at least one item before finalising';
  } else if (customerInvoice.totalQuantity === 0) {
    return 'You need to record how much stock to issue before finalising';
  }
  return null;
}
