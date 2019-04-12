/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GenericPage } from './GenericPage';

import { createRecord } from '../database';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';

import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageContentModal,
  PageInfo,
  TextEditor,
  ExpiryTextInput,
  IconCell,
  MiniToggleBar,
} from '../widgets';

import globalStyles, { dataTableStyles } from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
  FRIDGE_SELECT: 'fridgeSelect',
  SPLIT_VALUE_SELECT: 'splitValueSelect',
};

const SORT_DATA_TYPES = {
  itemName: 'string',
  itemCode: 'string',
  batch: 'string',
  totalQuantity: 'number',
  packSize: 'number',
};

const COLUMNS = {
  itemCode: {
    key: 'itemCode',
    width: 1,
    title: tableStrings.item_code,
    sortable: true,
  },
  itemName: {
    key: 'itemName',
    width: 3,
    title: tableStrings.item_name,
    sortable: true,
  },
  totalQuantity: {
    key: 'totalQuantity',
    width: 1,
    title: tableStrings.quantity,
    alignText: 'right',
  },
  expiryDate: {
    key: 'expiryDate',
    width: 1,
    title: tableStrings.batch_expiry,
    alignText: 'center',
  },
  remove: {
    key: 'remove',
    width: 1,
    title: tableStrings.remove,
    alignText: 'center',
  },
  vvm: {
    key: 'vvm',
    width: 1.5,
    title: 'VVM STATUS',
    alignText: 'center',
  },
  fridge: {
    key: 'fridge',
    width: 1.5,
    title: 'FRIDGE',
    alignText: 'center',
  },
};

export class SupplierInvoicePage extends React.Component {
  constructor(props) {
    super(props);
    this.dataFilters = {
      searchKey: '',
      sortBy: 'itemName',
      isAscending: true,
    };

    this.defaultFridge = null;

    this.state = {
      modalKey: null,
      modalIsOpen: false,
      selection: [],
      hasVaccine: false,
      selectedBatch: null,
    };
  }

  componentDidMount = () => {
    const { transaction, database } = this.props;
    this.defaultFridge = database.objects('Location').find(location => location.isFridge);
    // If there are no fridges, don't iterate and assign.
    if (this.defaultFridge) {
      database.write(() => {
        transaction.getTransactionBatches(database).forEach(batch => {
          if (!batch.location && batch.isVaccine) batch.location = this.defaultFridge;
          database.save('TransactionBatch', batch);
        });
      });
    }

    this.setState({ hasVaccine: transaction.hasVaccine });
  };

  // Delete transaction batch then delete transaction item if no more transaction batches remain.
  onDeleteConfirm = () => {
    const { selection } = this.state;
    const { transaction, database } = this.props;
    database.write(() => transaction.removeTransactionBatchesById(database, selection));
    this.setState({ selection: [] }, this.refreshData);
  };

  // On toggling the VVM status, set the status [null -> pass -> fail -> pass -> fail].
  // If the status is fail, trigger the doses modal, which will prompt for a number
  // of packs that failed within that batch [splitValue]. A new batch is then made - a
  // clone with the number of packs = originalNumberOfPacks - splitValue
  onVvmToggle = transactionBatch => () => {
    const { database } = this.props;
    const { isVVMPassed } = transactionBatch;
    const { SPLIT_VALUE_SELECT } = MODAL_KEYS;

    this.setState({ selectedBatch: transactionBatch });

    if (!isVVMPassed) {
      database.write(() =>
        database.update('TransactionBatch', { id: transactionBatch.id, isVVMPassed: true })
      );
      this.refreshData();
    } else this.openModal(SPLIT_VALUE_SELECT);
  };

  /**
   * On entering a split value:
   * If the value is non-numeric or splitValue >= totalQuantity - don't split.
   * If splitValue <= 0 - revert to a passing status.
   * If 0 < splitValue < totalQuantity - split into two batches on the
   * splitValue, assign the cloned batch (with the remaining batches) a passing
   * VVM status.
   */
  onEnterSplitValue = newValue => {
    const { database } = this.props;
    const { selectedBatch } = this.state;
    const { totalQuantity } = selectedBatch;
    const splitValue = parseInt(newValue, 10);
    this.closeModal();

    if (splitValue <= 0) return;
    if (splitValue < totalQuantity) {
      selectedBatch.splitBatch({ database, splitValue, newValues: { isVVMPassed: false } });
    } else {
      database.write(() =>
        database.update('TransactionBatch', { id: selectedBatch.id, isVVMPassed: false })
      );
    }
    this.refreshData();
  };

  onDeleteCancel = () => this.setState({ selection: [] }, this.refreshData);

  onSelectionChange = newSelection => this.setState({ selection: newSelection });

  /**
   * Respond to the user editing fields.
   *
   * @param   {string}  key               Key of edited field.
   * @param   {object}  transactionBatch  The transaction batch from the row being edited.
   * @param   {string}  newValue          The value the user entered in the cell.
   * @return  {none}
   */
  onEndEditing = (key, transactionBatch, newValue) => {
    const { database } = this.props;
    database.write(() => {
      switch (key) {
        case 'totalQuantity':
          // Should edit |numberOfPacks| directly if |packSize| becomes an editable column
          // that represents the number of packs counted.
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
  };

  getModalTitle = () => {
    const { modalKey } = this.state;

    const titles = {
      [MODAL_KEYS.ITEM_SELECT]: modalStrings.search_for_an_item_to_add,
      [MODAL_KEYS.COMMENT_EDIT]: modalStrings.edit_the_invoice_comment,
      [MODAL_KEYS.THEIR_REF_EDIT]: modalStrings.edit_their_reference,
      [MODAL_KEYS.FRIDGE_SELECT]: 'Place this Vaccine in a fridge',
      [MODAL_KEYS.SPLIT_VALUE_SELECT]: 'How many vials have a failed VVM status?',
    };

    return titles[modalKey] || titles.ITEM_SELECT;
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
    const { database, transaction } = this.props;
    const transactionBatches = transaction
      .getTransactionBatches(database)
      .filtered('itemName BEGINSWITH[c] $0', searchTerm);

    const sortDataType = SORT_DATA_TYPES[sortBy] || 'realm';

    this.setState({
      data: sortDataBy(transactionBatches, sortBy, sortDataType, isAscending),
    });
  };

  addNewLine = item => {
    const { database, transaction } = this.props;
    database.write(() => {
      const transactionItem = createRecord(database, 'TransactionItem', transaction, item);
      const transactionBatch = createRecord(
        database,
        'TransactionBatch',
        transactionItem,
        createRecord(database, 'ItemBatch', item, '')
      );

      if (item.isVaccine) {
        transactionBatch.location = this.defaultFridge;
        this.setState({ hasVaccine: true });
      }
      database.save('TransactionBatch', transactionBatch);
    });
  };

  openModal = key => this.setState({ modalKey: key, modalIsOpen: true });

  closeModal = () => this.setState({ modalIsOpen: false });

  openItemSelector = () => this.openModal(MODAL_KEYS.ITEM_SELECT);

  openCommentEditor = () => this.openModal(MODAL_KEYS.COMMENT_EDIT);

  openTheirRefEditor = () => this.openModal(MODAL_KEYS.THEIR_REF_EDIT);

  openFridgeSelector = transactionBatch => () => {
    this.setState({ selectedBatch: transactionBatch });
    this.openModal(MODAL_KEYS.FRIDGE_SELECT);
  };

  renderPageInfo = () => {
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
          info: transaction.otherParty && transaction.otherParty.name,
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
    return <PageInfo columns={infoColumns} isEditingDisabled={transaction.isFinalised} />;
  };

  renderCell = (key, transactionBatch) => {
    const { transaction } = this.props;
    const { isVVMPassed, isVaccine, id, locationDescription, location } = transactionBatch;
    const isEditable = !transaction.isFinalised;
    const type = isEditable ? 'editable' : 'text';
    const editableCell = {
      type,
      cellContents: String(transactionBatch[key]),
    };
    const emptycell = {
      type: 'text',
      cellContents: '',
    };
    switch (key) {
      default:
        return {
          cellContents: transactionBatch[key],
        };
      case 'totalQuantity':
        return editableCell;
      case 'expiryDate': {
        return (
          <ExpiryTextInput
            key={id}
            isEditable={isEditable}
            onEndEditing={newValue => this.onEndEditing(key, transactionBatch, newValue)}
            text={transactionBatch[key]}
            style={dataTableStyles.text}
          />
        );
      }
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: transaction.isFinalised,
        };
      case 'vvm': {
        if (!isVaccine) return emptycell;
        return (
          <MiniToggleBar
            leftText="PASS"
            rightText="FAIL"
            currentState={isVVMPassed}
            onPress={this.onVvmToggle(transactionBatch)}
          />
        );
      }
      case 'fridge': {
        if (!isVaccine) return emptycell;
        const failed = isVVMPassed === false;
        const hasFridges = !location;
        let props;
        if (hasFridges) props = { text: 'No fridges', icon: 'times', disabled: true };
        else {
          props = {
            text: failed ? 'Discarded' : locationDescription,
            onPress: failed ? null : this.openFridgeSelector(transactionBatch),
            icon: failed ? 'times' : 'caret-up',
            disabled: failed,
          };
        }
        return <IconCell {...props} />;
      }
    }
  };

  renderModalContent = () => {
    const { database, transaction } = this.props;
    const { modalKey, selectedBatch } = this.state;
    const {
      ITEM_SELECT,
      COMMENT_EDIT,
      THEIR_REF_EDIT,
      FRIDGE_SELECT,
      SPLIT_VALUE_SELECT,
    } = MODAL_KEYS;
    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
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
      case FRIDGE_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Location')}
            queryString="description BEGINSWITH[c] $0"
            sortByString="description"
            onSelect={item => {
              database.write(() => {
                selectedBatch.location = item;
              });
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={({ description }) => description}
          />
        );
      case SPLIT_VALUE_SELECT: {
        const { totalQuantity } = selectedBatch;
        return (
          <TextEditor
            text={totalQuantity}
            keyboardType="numeric"
            onEndEditing={this.onEnterSplitValue}
          />
        );
      }
    }
  };

  renderAddBatchButton = () => {
    const { transaction } = this.props;
    return (
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.new_line}
        onPress={this.openItemSelector}
        isDisabled={transaction.isFinalised}
      />
    );
  };

  getColumns = () => {
    const { hasVaccine } = this.state;
    const vaccineColumns = [
      'itemCode',
      'itemName',
      'totalQuantity',
      'expiryDate',
      'vvm',
      'fridge',
      'remove',
    ];
    const normalColumns = ['itemCode', 'itemName', 'totalQuantity', 'expiryDate', 'remove'];
    const columns = hasVaccine ? vaccineColumns : normalColumns;
    return columns.map(columnKey => COLUMNS[columnKey]);
  };

  render() {
    const { database, genericTablePageStyles, transaction, topRoute } = this.props;
    const { data, modalIsOpen, selection } = this.state;
    return (
      <GenericPage
        data={data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopLeftComponent={this.renderPageInfo}
        renderTopRightComponent={this.renderAddBatchButton}
        onEndEditing={this.onEndEditing}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={this.getColumns()}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        finalisableDataType="Transaction"
        database={database}
        selection={selection}
        {...genericTablePageStyles}
        topRoute={topRoute}
      >
        <BottomConfirmModal
          isOpen={selection.length > 0 && !transaction.isFinalised}
          questionText={modalStrings.remove_these_items}
          onCancel={() => this.onDeleteCancel()}
          onConfirm={() => this.onDeleteConfirm()}
          confirmText={modalStrings.remove}
        />

        <PageContentModal
          isOpen={modalIsOpen && !transaction.isFinalised}
          onClose={this.closeModal}
          title={this.getModalTitle()}
        >
          {this.renderModalContent()}
        </PageContentModal>
      </GenericPage>
    );
  }
}

/**
 * Check whether a given transaction is safe to be finalised. If safe to finalise,
 * return null, else return an appropriate error message.
 *
 * @param   {object}  transaction  The transaction to check.
 * @return  {string}               Error message if unsafe to finalise, else null.
 */
export function checkForFinaliseError(transaction) {
  if (!transaction.isExternalSupplierInvoice) return null;
  if (transaction.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  }
  if (transaction.totalQuantity === 0) {
    return modalStrings.stock_quantity_greater_then_zero;
  }

  return null;
}

/* eslint-disable react/forbid-prop-types, react/require-default-props */
SupplierInvoicePage.propTypes = {
  database: PropTypes.object,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  transaction: PropTypes.object,
};
