/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

// eslint-disable-next-line no-unused-vars
import { createRecord } from '../database';
import { debounce, MODAL_KEYS, getModalTitle } from '../utilities';
import { buttonStrings, modalStrings } from '../localization';

import { BottomConfirmModal, PageContentModal } from '../widgets/modals';
import {
  AutocompleteSelector,
  PageButton,
  PageInfo,
  TextEditor,
  SortAscIcon,
  SortNeutralIcon,
  SortDescIcon,
  CheckedComponent,
  UncheckedComponent,
  DisabledCheckedComponent,
  DisabledUncheckedComponent,
} from '../widgets';
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
  closeBasicModal,
  addMasterListItems,
  addItem,
  editPageObject,
  deleteItemsById,
  openBasicModal,
} from './dataTableUtilities/actions';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import usePageReducer from '../hooks/usePageReducer';
import DataTablePageView from './containers/DataTablePageView';

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
  runWithLoadingIndicator,
  routeName,
}) => {
  const startTime = Date.now();
  const [tableState, dispatch, instantDebouncedDispatch] = usePageReducer(routeName, {
    pageObject: transaction,
    backingData: transaction.items,
    data: transaction.items.sorted('item.name').slice(),
    database,
    keyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: 'itemName',
    isAscending: true,
    modalIsOpen: false,
    modalKey: '',
    hasSelection: false,
  });

  const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalIsOpen,
    modalKey,
    pageInfo,
    pageObject,
    hasSelection,
  } = tableState;

  const onDeleteCancel = () => {
    dispatch(deselectAll());
  };

  const onSearchChange = searchTerm => {
    dispatch(filterData(searchTerm));
  };

  const searchBarDispatch = useMemo(() => debounce(onSearchChange, 500), []);

  const renderPageInfo = useCallback(
    () => (
      <PageInfo
        columns={pageInfo(pageObject, dispatch)}
        isEditingDisabled={transaction.isFinalised}
      />
    ),
    []
  );

  const renderCells = useCallback((rowData, rowState = {}, rowKey) => {
    const {
      cellContainer,
      editableCellText,
      editableCellTextView,
      cellText,
      touchableCellContainer,
    } = newDataTableStyles;
    return columns.map(({ key: colKey, type, width, alignText }, index) => {
      const isLastCell = index === columns.length - 1;
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
              width={width}
              viewStyle={cellContainer[alignText || 'left']}
              textInputStyle={cellText[alignText || 'left']}
              textStyle={editableCellText}
              textViewStyle={editableCellTextView}
              isLastCell={isLastCell}
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
              containerStyle={touchableCellContainer}
              width={width}
              isLastCell={isLastCell}
            />
          );
        default:
          return (
            <Cell
              key={colKey}
              value={rowData[colKey]}
              width={width}
              viewStyle={cellContainer[alignText || 'left']}
              textStyle={cellText[alignText || 'left']}
              isLastCell={isLastCell}
            />
          );
      }
    });
  }, []);

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      const { row, alternateRow } = newDataTableStyles;
      return (
        <Row
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          renderCells={renderCells}
          style={index % 2 === 0 ? alternateRow : row}
        />
      );
    },
    [data, dataState, renderCells]
  );

  const renderModalContent = () => {
    const { comment, theirRef } = transaction;
    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={item => dispatch(addItem(item, 'TransactionItem'))}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={comment}
            onEndEditing={value => dispatch(editPageObject(value, 'Transaction', 'comment'))}
          />
        );
      case THEIR_REF_EDIT:
        return (
          <TextEditor
            text={theirRef}
            onEndEditing={value => dispatch(editPageObject(value, 'Transaction', 'theirRef'))}
          />
        );
    }
  };

  const renderButtons = () => (
    <View style={globalStyles.verticalContainer}>
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.new_item}
        onPress={() => dispatch(openBasicModal(ITEM_SELECT))}
        isDisabled={transaction.isFinalised}
      />
      <PageButton
        text={buttonStrings.add_master_list_items}
        onPress={() => runWithLoadingIndicator(() => dispatch(addMasterListItems('Transaction')))}
        isDisabled={transaction.isFinalised}
      />
    </View>
  );

  const renderHeader = useCallback(
    () => (
      <HeaderRow
        renderCells={() =>
          columns.map(({ key, title, sortable, width, alignText }, index) => {
            const sortDirection = isAscending ? 'ASC' : 'DESC';
            const directionForThisColumn = key === sortBy ? sortDirection : null;
            const isLastCell = index === columns.length - 1;
            const { headerCells, cellText } = newDataTableStyles;
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
                sortable={sortable}
                width={width}
                containerStyle={headerCells[alignText || 'left']}
                textStyle={cellText[alignText || 'left']}
                isLastCell={isLastCell}
              />
            );
          })
        }
      />
    ),
    [sortBy, isAscending]
  );

  useLayoutEffect(() => {
    console.log('===============Layout time=====================');
    console.log(Date.now() - startTime);
    console.log('====================================');
  });

  const {
    newPageTopSectionContainer,
    newPageTopLeftSectionContainer,
    newPageTopRightSectionContainer,
    searchBar,
  } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <View style={newPageTopLeftSectionContainer}>
          {renderPageInfo()}
          <SearchBar
            onChange={searchBarDispatch}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
          />
        </View>
        <View style={newPageTopRightSectionContainer}>{renderButtons()}</View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
      />
      <BottomConfirmModal
        isOpen={hasSelection && !transaction.isFinalised}
        questionText={modalStrings.remove_these_items}
        onCancel={onDeleteCancel}
        onConfirm={() => dispatch(deleteItemsById('Transaction'))}
        confirmText={modalStrings.remove}
      />
      <PageContentModal
        isOpen={modalIsOpen && !transaction.isFinalised}
        onClose={() => dispatch(closeBasicModal())}
        title={getModalTitle(modalKey)}
      >
        {renderModalContent()}
      </PageContentModal>
    </DataTablePageView>
  );
};

/* eslint-disable react/forbid-prop-types */
CustomerInvoicePage.propTypes = {
  database: PropTypes.object.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
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
