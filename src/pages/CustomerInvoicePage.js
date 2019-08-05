/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';

import { GenericPage } from './GenericPage';

import { createRecord } from '../database';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import { AutocompleteSelector, PageButton, PageInfo, TextEditor } from '../widgets';
import { BottomConfirmModal, PageContentModal } from '../widgets/modals';

import globalStyles from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];
const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

export const CustomerInvoicePage = props => {
  const [state, setState] = useState({
    selection: [],
    modalKey: null,
    modalIsOpen: false,
  });
  const dataFilters = {
    searchTerm: '',
    sortBy: 'itemName',
    isAscending: true,
  };
  const { selection, modalKey, modalIsOpen, data } = state;
  const { transaction, database, genericTablePageStyles, topRoute } = props;
  const { searchTerm, sortBy, isAscending } = dataFilters;
  const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;

  const updateDataFilters = (newSearchTerm, newSortBy, newIsAscending) => {
    // (... != null) checks for null or undefined (implicitly type coerced to null).
    if (newSearchTerm != null) dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) dataFilters.isAscending = newIsAscending;
  };

  /**
   * Returns updated data fitlered by |searchTerm| and ordered by |sortBy| and |isAscending|.
   */
  const refreshData = (newSearchTerm, newSortBy, newIsAscending) => {
    updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const newData = props.transaction.items.filtered(
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
    setState({
      ...state,
      data: sortDataBy(newData, sortBy, sortDataType, isAscending),
    });
  };

  const onAddMasterItems = () => {
    props.runWithLoadingIndicator(() => {
      props.database.write(() => {
        props.transaction.addItemsFromMasterList(props.database);
        props.database.save('Transaction', props.transaction);
      });
      refreshData();
    });
  };

  /**
   * Respond to the user editing the number in the number received column.
   *
   * @param   {string}  key              Should always be |totalQuantity|.
   * @param   {object}  transactionItem  The transaction item from the row being edited.
   * @param   {string}  newValue         The value the user entered in the cell.
   * @return  {none}
   */
  const onEndEditing = (key, transactionItem, newValue) => {
    if (key !== 'totalQuantity') return;
    database.write(() => {
      transactionItem.setTotalQuantity(database, parsePositiveInteger(newValue));
      database.save('TransactionItem', transactionItem);
    });
  };

  const onDeleteConfirm = () => {
    database.write(() => {
      transaction.removeItemsById(database, selection);
      database.save('Transaction', transaction);
    });
    setState(...state, { selection: [] }, refreshData);
  };

  const onDeleteCancel = () => {
    setState(...state, { selection: [] }, refreshData);
  };

  const onSelectionChange = newSelection => {
    setState(...state, { selection: newSelection });
  };

  const openModal = key => {
    setState(...state, { modalKey: key, modalIsOpen: true });
  };

  const closeModal = () => {
    setState(...state, { modalIsOpen: false });
  };

  const openItemSelector = () => {
    openModal(ITEM_SELECT);
  };

  const openCommentEditor = () => {
    openModal(COMMENT_EDIT);
  };

  const openTheirRefEditor = () => {
    openModal(THEIR_REF_EDIT);
  };

  const getModalTitle = () => {
    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_invoice_comment;
      case THEIR_REF_EDIT:
        return modalStrings.edit_their_reference;
    }
  };

  const renderPageInfo = () => {
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(transaction.entryDate) || 'N/A',
        },
        {
          title: `${pageInfoStrings.confirm_date}:`,
          info: formatDate(transaction.confirmDate),
        },
        {
          title: `${pageInfoStrings.entered_by}:`,
          info: transaction.enteredBy && transaction.enteredBy.username,
        },
      ],
      [
        {
          title: `${pageInfoStrings.customer}:`,
          info: transaction.otherParty && transaction.otherParty.name,
        },
        {
          title: `${pageInfoStrings.their_ref}:`,
          info: transaction.theirRef,
          onPress: openTheirRefEditor,
          editableType: 'text',
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: transaction.comment,
          onPress: openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return <PageInfo columns={infoColumns} isEditingDisabled={transaction.isFinalised} />;
  };

  const renderCell = (key, transactionItem) => {
    switch (key) {
      default:
        return transactionItem[key];
      case 'totalQuantity':
        return {
          type: props.transaction.isFinalised ? 'text' : 'editable',
          cellContents: transactionItem.totalQuantity,
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: props.transaction.isFinalised,
        };
    }
  };

  const renderModalContent = () => {
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
              database.write(() => {
                if (!transaction.hasItem(item)) {
                  createRecord(database, 'TransactionItem', transaction, item);
                }
              });
              refreshData();
              closeModal();
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
              closeModal();
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
              closeModal();
            }}
          />
        );
    }
  };

  const renderButtons = () => (
    <View style={globalStyles.verticalContainer}>
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.new_item}
        onPress={openItemSelector}
        isDisabled={transaction.isFinalised}
      />
      <PageButton
        text={buttonStrings.add_master_list_items}
        onPress={onAddMasterItems}
        isDisabled={transaction.isFinalised}
      />
    </View>
  );

  return (
    <GenericPage
      data={data}
      refreshData={refreshData}
      renderCell={renderCell}
      renderTopLeftComponent={renderPageInfo}
      renderTopRightComponent={renderButtons}
      onSelectionChange={onSelectionChange}
      onEndEditing={onEndEditing}
      defaultSortKey={dataFilters.sortBy}
      defaultSortDirection={dataFilters.isAscending ? 'ascending' : 'descending'}
      columns={[
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
          key: 'availableQuantity',
          width: 2,
          title: tableStrings.available_stock,
          sortable: true,
          alignText: 'right',
        },
        {
          key: 'totalQuantity',
          width: 2,
          title: tableStrings.quantity,
          sortable: true,
          alignText: 'right',
        },
        {
          key: 'remove',
          width: 1,
          title: tableStrings.remove,
          alignText: 'center',
        },
      ]}
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
        onCancel={() => onDeleteCancel()}
        onConfirm={() => onDeleteConfirm()}
        confirmText={modalStrings.remove}
      />
      <PageContentModal
        isOpen={modalIsOpen && !transaction.isFinalised}
        onClose={closeModal}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </PageContentModal>
    </GenericPage>
  );
};

/* eslint-disable react/forbid-prop-types */
CustomerInvoicePage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  topRoute: PropTypes.bool.isRequired,
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
