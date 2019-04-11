/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';

import { GenericPage } from './GenericPage';

import { createRecord } from '../database';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageContentModal,
  PageInfo,
  TextEditor,
} from '../widgets';

import globalStyles from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];
const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

const DATA_TABLE_COLUMNS = {
  itemCode: {
    key: 'itemCode',
    width: 2,
    title: tableStrings.item_code,
    sortable: true,
  },
  itemName: {
    key: 'itemName',
    width: 4,
    title: tableStrings.item_name,
    sortable: true,
  },
  availableQuantity: {
    key: 'availableQuantity',
    width: 2,
    title: tableStrings.available_stock,
    sortable: true,
    alignText: 'right',
  },
  totalQuantity: {
    key: 'totalQuantity',
    width: 2,
    title: tableStrings.quantity,
    sortable: true,
    alignText: 'right',
  },
  remove: {
    key: 'remove',
    width: 1,
    title: tableStrings.remove,
    alignText: 'center',
  },
  doses: {
    key: 'doses',
    width: 1.5,
    title: tableStrings.doses,
    alignText: 'right',
  },
};

export class CustomerInvoicePage extends GenericPage {
  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      modalKey: null,
      modalIsOpen: false,
      hasVaccine: false,
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'itemName',
      isAscending: true,
    };
  }

  componentDidMount = () => {
    const { transaction } = this.props;
    this.setState({ hasVaccine: transaction.hasVaccine });
  };

  updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // (... != null) checks for null or undefined (implicitly type coerced to null).
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  };

  /**
   * Returns updated data fitlered by |searchTerm| and ordered by |sortBy| and |isAscending|.
   */
  refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.props.transaction.items.filtered(
      'item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0',
      searchTerm
    );
    let sortDataType;
    switch (sortBy) {
      case 'itemCode':
      case 'itemName':
        sortDataType = 'string';
        break;
      case 'availableQuantity':
      case 'totalQuantity':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({
      data: sortDataBy(data, sortBy, sortDataType, isAscending),
    });
  };

  onAddMasterItems = () => {
    const { database, transaction, runWithLoadingIndicator } = this.props;
    runWithLoadingIndicator(() => {
      database.write(() => {
        transaction.addItemsFromMasterList(database);
        database.save('Transaction', transaction);
      });
      this.refreshData();
    });
  };

  /**
   * Respond to the user editing a number in a column.
   * @param   {string}  key              Should always be totalQuantity or doses.
   * @param   {object}  transactionItem  The transaction item from the row being edited.
   * @param   {string}  newValue         The value the user entered in the cell.
   * @return  {none}
   */
  onEndEditing = (key, transactionItem, newValue) => {
    const { database } = this.props;
    const actions = {
      totalQuantity: () => {
        transactionItem.setTotalQuantity(database, parsePositiveInteger(newValue));
        if (transactionItem.item.doses === 1) transactionItem.setDoses(newValue);
      },
      doses: () => {
        transactionItem.setDoses(parsePositiveInteger(newValue));
      },
    };

    const actionToExecute = actions[key];
    if (actionToExecute) database.write(actionToExecute);
    database.save('TransactionItem', transactionItem);
  };

  onDeleteConfirm = () => {
    const { selection } = this.state;
    const { transaction, database } = this.props;

    database.write(() => {
      transaction.removeItemsById(database, selection);
      database.save('Transaction', transaction);
    });
    this.setState({ selection: [] }, this.refreshData);
  };

  onDeleteCancel = () => {
    this.setState({ selection: [] }, this.refreshData);
  };

  onSelectionChange = newSelection => {
    this.setState({ selection: newSelection });
  };

  openModal = key => {
    this.setState({ modalKey: key, modalIsOpen: true });
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  openItemSelector = () => {
    this.openModal(MODAL_KEYS.ITEM_SELECT);
  };

  openCommentEditor = () => {
    this.openModal(MODAL_KEYS.COMMENT_EDIT);
  };

  openTheirRefEditor = () => {
    this.openModal(MODAL_KEYS.THEIR_REF_EDIT);
  };

  getModalTitle = () => {
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
  };

  renderPageInfo = () => {
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(this.props.transaction.entryDate),
        },
        {
          title: `${pageInfoStrings.confirm_date}:`,
          info: formatDate(this.props.transaction.confirmDate),
        },
        {
          title: `${pageInfoStrings.entered_by}:`,
          info: this.props.transaction.enteredBy && this.props.transaction.enteredBy.username,
        },
      ],
      [
        {
          title: `${pageInfoStrings.customer}:`,
          info: this.props.transaction.otherParty && this.props.transaction.otherParty.name,
        },
        {
          title: `${pageInfoStrings.their_ref}:`,
          info: this.props.transaction.theirRef,
          onPress: this.openTheirRefEditor,
          editableType: 'text',
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: this.props.transaction.comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return (
      <PageInfo columns={infoColumns} isEditingDisabled={this.props.transaction.isFinalised} />
    );
  };

  renderCell = (key, transactionItem) => {
    const { transaction } = this.props;
    const { totalQuantity, totalDoses } = transactionItem;
    const { isFinalised } = transaction;
    const emptyCell = { type: 'text', cellContents: '' };
    switch (key) {
      default:
        return transactionItem[key];
      case 'totalQuantity':
        return {
          type: isFinalised ? 'text' : 'editable',
          cellContents: totalQuantity,
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: isFinalised,
        };
      case 'doses': {
        // If not a vaccine item, render an empty cell.
        // If a vaccine, display the doses of the item. Only
        // editable if doses > 1.
        const { item } = transactionItem;
        const { isVaccine, doses } = item;
        const hasDosesOfOne = doses === 1;
        if (!isVaccine) return emptyCell;
        return {
          type: hasDosesOfOne ? 'text' : 'editable',
          cellContents: totalDoses,
          placeholder: tableStrings.not_counted,
          textAlign: 'right',
        };
      }
    }
  };

  onSelectNewItem = item => {
    const { database, transaction } = this.props;
    database.write(() => {
      if (!transaction.hasItem(item)) {
        createRecord(database, 'TransactionItem', transaction, item);
      }
      if (item.isVaccine) this.setState({ hasVaccine: true });
    });
    this.refreshData();
    this.closeModal();
  };

  renderModalContent = () => {
    const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
    const { database, transaction } = this.props;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={this.onSelectNewItem}
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
  };

  renderButtons = () => (
    <View style={globalStyles.verticalContainer}>
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.new_item}
        onPress={this.openItemSelector}
        isDisabled={this.props.transaction.isFinalised}
      />
      <PageButton
        text={buttonStrings.add_master_list_items}
        onPress={this.onAddMasterItems}
        isDisabled={this.props.transaction.isFinalised}
      />
    </View>
  );

  getDataTableColumns = () => {
    const { hasVaccine } = this.state;
    const normal = ['itemCode', 'itemName', 'availableQuantity', 'totalQuantity', 'remove'];
    const withVaccines = [
      'itemCode',
      'itemName',
      'availableQuantity',
      'totalQuantity',
      'doses',
      'remove',
    ];
    const columnsToUse = hasVaccine ? withVaccines : normal;
    return columnsToUse.map(columnKey => DATA_TABLE_COLUMNS[columnKey]);
  };

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopLeftComponent={this.renderPageInfo}
        renderTopRightComponent={this.renderButtons}
        onRowPress={this.onRowPress}
        onSelectionChange={this.onSelectionChange}
        onEndEditing={this.onEndEditing}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={this.getDataTableColumns()}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        finalisableDataType="Transaction"
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

/* eslint-disable react/forbid-prop-types */
CustomerInvoicePage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  transaction: PropTypes.object.isRequired,
};

/**
 * Check whether a given customer invoice is safe to be finalised. If safe to finalise,
 * return null, else return an appropriate error message.
 *
 * @param   {object}  customerInvoice  The customer invoice to check.
 * @return  {string}                   Error message if unsafe to finalise, else null.
 */
export function checkForFinaliseError(customerInvoice) {
  if (customerInvoice.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  }

  if (customerInvoice.totalQuantity === 0) {
    return modalStrings.record_stock_to_issue_before_finalising;
  }

  return null;
}
