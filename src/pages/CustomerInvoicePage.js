/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState, useReducer, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import { createRecord } from '../database';
import { formatDate, debounce } from '../utilities';
import { buttonStrings, modalStrings, pageInfoStrings } from '../localization';
import { AutocompleteSelector, PageButton, PageInfo, TextEditor } from '../widgets';
import { BottomConfirmModal, PageContentModal } from '../widgets/modals';
import {
  DataTable,
  Row,
  Cell,
  EditableCell,
  CheckableCell,
  HeaderCell,
  HeaderRow,
} from '../widgets/DataTable';

import {
  editTotalQuantity,
  focusCell,
  focusNext,
  selectRow,
  deselectRow,
  deselectAll,
  sortData,
  filterData,
} from './dataTableUtilities/actions';

import getReducer from './dataTableUtilities/reducer/getReducer';
import getColumns from './dataTableUtilities/columns';
import globalStyles, { dataTableColors } from '../globalStyles';

const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

const SortNeutralIcon = <FAIcon name="sort" size={15} color="purple" />;
const SortDescIcon = <FAIcon name="sort-desc" size={15} color="purple" />;
const SortAscIcon = <FAIcon name="sort-asc" size={15} color="purple" />;

const CheckedComponent = () => (
  <Icon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellChecked} />
);
const UncheckedComponent = () => (
  <Icon name="md-radio-button-off" size={15} color={dataTableColors.checkableCellUnchecked} />
);
const DisabledCheckedComponent = () => (
  <Icon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellDisabled} />
);
const DisabledUncheckedComponent = () => (
  <Icon name="md-radio-button-off" size={15} color={dataTableColors.checkableCellDisabled} />
);

const keyExtractor = item => item.id;

/**
 * Renders a mSupply mobile page with customer invoice loaded for editing
 *
 * @prop {transaction} prop0
 * @prop {database} prop0
 * @prop {genericTablePageStyles} prop0
 * @prop {runWithLoadingIndicator} prop0
 * @prop {topRoute} prop0
 */
export const CustomerInvoicePage = ({
  transaction,
  database,
  genericTablePageStyles: pageStyles,
  runWithLoadingIndicator,
}) => {
  const reducer = useMemo(() => getReducer('customerInvoice'), []);
  const columns = useMemo(() => getColumns('customerInvoice', [2, 4, 2, 2, 1]), []);
  const [tableState, dispatch] = useReducer(reducer, {
    backingData: transaction.items,
    data: transaction.items.slice(),
    database,
    keyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: '',
    isAscending: true,
  });
  const [modalKey, setModalKey] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
  const { data, dataState, sortBy, isAscending } = tableState;
  let isSelection = false;

  // eslint-disable-next-line no-restricted-syntax
  for (const row of dataState.values()) {
    if (row.isSelected) {
      isSelection = true;
      break;
    }
  }

  const openItemSelector = () => {
    setModalKey(ITEM_SELECT);
    setModalIsOpen(true);
  };

  const openCommentEditor = () => {
    setModalKey(COMMENT_EDIT);
    setModalIsOpen(true);
  };

  const openTheirRefEditor = () => {
    setModalKey(THEIR_REF_EDIT);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

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

  const onDeleteConfirm = () => {};

  const onDeleteCancel = () => {
    dispatch(deselectAll());
  };

  const onAddMasterItems = () => {
    runWithLoadingIndicator(() => {
      database.write(() => {
        transaction.addItemsFromMasterList(database);
        database.save('Transaction', transaction);
      });
    });
  };

  const onSearchChange = searchTerm => {
    dispatch(filterData(searchTerm));
  };

  const instantDebouncedDispatch = useMemo(() => debounce(dispatch, 250, true), []);
  const searchBarDispatch = useMemo(() => debounce(onSearchChange, 500), []);

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

  const renderCells = useCallback(
    (rowData, rowState = {}, rowKey) =>
      columns.map(column => {
        const { key: colKey, type } = column;
        switch (type) {
          case 'editable':
            return (
              <EditableCell
                key={colKey}
                value={rowData[colKey]}
                rowKey={rowKey}
                columnKey={colKey}
                editAction={editTotalQuantity}
                isFocused={colKey === (rowState && rowState.focusedColumn)}
                disabled={rowState && rowState.disabled}
                focusAction={focusCell}
                focusNextAction={focusNext}
                dispatch={dispatch}
              />
            );
          case 'checkable':
            return (
              <CheckableCell
                key={colKey}
                rowKey={rowKey}
                columnKey={colKey}
                isChecked={rowState && rowState.isSelected}
                disabled={rowState && rowState.disabled}
                CheckedComponent={CheckedComponent}
                UncheckedComponent={UncheckedComponent}
                DisabledCheckedComponent={DisabledCheckedComponent}
                DisabledUncheckedComponent={DisabledUncheckedComponent}
                onCheckAction={selectRow}
                onUncheckAction={deselectRow}
                dispatch={dispatch}
              />
            );
          default:
            return <Cell key={colKey} value={rowData[colKey]} />;
        }
      }),
    []
  );

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <Row
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          renderCells={renderCells}
        />
      );
    },
    [data, dataState, renderCells]
  );

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

  const renderHeader = useCallback(
    () => (
      <HeaderRow
        renderCells={() =>
          columns.map(({ key, title, sortable }) => {
            const sortDirection = isAscending ? 'ASC' : 'DESC';
            const directionForThisColumn = key === sortBy ? sortDirection : null;
            return (
              <HeaderCell
                key={key}
                title={title}
                SortAscComponent={SortAscIcon}
                SortDescComponent={SortDescIcon}
                SortNeutralComponent={SortNeutralIcon}
                columnKey={key}
                onPressAction={sortable ? sortData : null}
                dispatch={instantDebouncedDispatch}
                sortDirection={directionForThisColumn}
              />
            );
          })
        }
      />
    ),
    [sortBy, isAscending]
  );

  return (
    <View style={[defaultStyles.pageContentContainer, pageStyles.pageContentContainer]}>
      <View style={[defaultStyles.container, pageStyles.container]}>
        <View style={[defaultStyles.pageTopSectionContainer, pageStyles.pageTopSectionContainer]}>
          <View
            style={[
              defaultStyles.pageTopLeftSectionContainer,
              pageStyles.pageTopLeftSectionContainer,
            ]}
          >
            {renderPageInfo()}
            <SearchBar
              onChange={searchBarDispatch}
              style={pageStyles.searchBar}
              color="blue"
              placeholder="fuck off"
            />
          </View>
          <View
            style={[
              defaultStyles.pageTopRightSectionContainer,
              pageStyles.pageTopRightSectionContainer,
            ]}
          >
            {renderButtons()}
          </View>
        </View>
        <DataTable
          data={data}
          extraData={dataState}
          renderRow={renderRow}
          renderHeader={renderHeader}
          keyExtractor={keyExtractor}
        />
        <BottomConfirmModal
          isOpen={isSelection && !transaction.isFinalised}
          questionText={modalStrings.remove_these_items}
          onCancel={onDeleteCancel}
          onConfirm={onDeleteConfirm}
          confirmText={modalStrings.remove}
        />
        <PageContentModal
          isOpen={modalIsOpen && !transaction.isFinalised}
          onClose={closeModal}
          title={getModalTitle()}
        >
          {renderModalContent()}
        </PageContentModal>
      </View>
    </View>
  );
};

/* eslint-disable react/forbid-prop-types */
CustomerInvoicePage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,

  transaction: PropTypes.object.isRequired,
};

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
  },
  pageContentContainer: {
    flex: 1,
  },
  pageTopSectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  pageTopLeftSectionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: 500,
  },
  pageTopRightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  listView: {
    flex: 1,
  },
  alignTextLeft: {
    marginLeft: 20,
    textAlign: 'left',
  },
  alignTextCenter: {
    textAlign: 'center',
  },
  alignTextRight: {
    marginRight: 20,
    textAlign: 'right',
  },
});

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
