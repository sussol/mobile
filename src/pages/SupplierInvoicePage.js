/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { recordKeyExtractor, getItemLayout } from './dataTableUtilities/utilities';

import { MODAL_KEYS, getModalTitle } from '../utilities';
import { buttonStrings, modalStrings } from '../localization';
import { UIDatabase } from '../database';

import {
  focusCell,
  focusNext,
  selectRow,
  deselectRow,
  deselectAll,
  sortData,
  filterData,
  closeBasicModal,
  editComment,
  editTheirRef,
  openBasicModal,
  refreshData,
  editTransactionBatchQuantity,
  deleteTransactionBatchesById,
  editTransactionBatchExpiryDate,
  addTransactionBatch,
} from './dataTableUtilities/actions';
import usePageReducer from '../hooks/usePageReducer';

import {
  AutocompleteSelector,
  PageButton,
  PageInfo,
  TextEditor,
  CheckedComponent,
  UncheckedComponent,
  DisabledCheckedComponent,
  DisabledUncheckedComponent,
  NewExpiryDateInput,
  SearchBar,
} from '../widgets';
import { BottomConfirmModal, PageContentModal } from '../widgets/modals';
import {
  DataTable,
  Row,
  Cell,
  EditableCell,
  CheckableCell,
  DataTableHeaderRow,
} from '../widgets/DataTable';
import DataTablePageView from './containers/DataTablePageView';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';

const keyExtractor = item => item.id;

export const SupplierInvoicePage = ({ routeName, transaction }) => {
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(routeName, {
    pageObject: transaction,
    backingData: transaction.getTransactionBatches(UIDatabase),
    data: transaction
      .getTransactionBatches(UIDatabase)
      .sorted('itemName')
      .slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['itemName'],
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
  });

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    pageInfo,
    pageObject,
    hasSelection,
    backingData,
    searchTerm,
  } = state;

  const { isFinalised, comment, theirRef } = pageObject;
  const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;

  if (isFinalised && data.length !== backingData.length) dispatch(refreshData());

  const renderPageInfo = useCallback(
    () => <PageInfo columns={pageInfo(pageObject, dispatch)} isEditingDisabled={isFinalised} />,
    [comment, theirRef, isFinalised]
  );

  const renderCells = useCallback(
    (rowData, rowState = {}, rowKey) => {
      const {
        cellContainer,
        editableCellText,
        editableCellUnfocused,
        editableCellTextView,
        cellText,
        touchableCellContainer,
      } = newDataTableStyles;
      return columns.map(({ key: colKey, type, width, alignText }, index) => {
        const isLastCell = index === columns.length - 1;
        const isDisabled = isFinalised || (rowState && rowState.isDisabled);
        switch (type) {
          case 'editable':
            return (
              <EditableCell
                key={colKey}
                value={rowData[colKey]}
                rowKey={rowKey}
                columnKey={colKey}
                editAction={editTransactionBatchQuantity}
                isFocused={colKey === (rowState && rowState.focusedColumn)}
                isDisabled={isDisabled}
                focusAction={focusCell}
                focusNextAction={focusNext}
                dispatch={dispatch}
                width={width}
                viewStyle={cellContainer[alignText || 'left']}
                textViewStyle={editableCellTextView}
                isLastCell={isLastCell}
                keyboardType="numeric"
                textInputStyle={cellText[alignText || 'left']}
                textStyle={editableCellUnfocused[alignText || 'left']}
                cellTextStyle={editableCellText}
              />
            );
          case 'checkable':
            return (
              <CheckableCell
                key={colKey}
                rowKey={rowKey}
                columnKey={colKey}
                isChecked={rowState && rowState.isSelected}
                isDisabled={isDisabled}
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
          case 'date':
            return (
              <NewExpiryDateInput
                key={colKey}
                value={rowData[colKey]}
                rowKey={rowKey}
                columnKey={colKey}
                editAction={editTransactionBatchExpiryDate}
                isFocused={colKey === (rowState && rowState.focusedColumn)}
                isDisabled={isDisabled}
                focusAction={focusCell}
                focusNextAction={focusNext}
                dispatch={dispatch}
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
    },
    [isFinalised]
  );

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
          debug
        />
      );
    },
    [data, dataState, renderCells]
  );

  const renderModalContent = () => {
    switch (modalKey) {
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={item => dispatch(addTransactionBatch(item))}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={comment}
            onEndEditing={value => dispatch(editComment(value, 'Transaction'))}
          />
        );
      case THEIR_REF_EDIT:
        return (
          <TextEditor
            text={theirRef}
            onEndEditing={value => dispatch(editTheirRef(value, 'Transaction'))}
          />
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton
          style={topButton}
          text={buttonStrings.new_item}
          onPress={() => dispatch(openBasicModal(ITEM_SELECT))}
          isDisabled={isFinalised}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

  const memoizedGetItemLayout = useCallback(getItemLayout, []);

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
            onChangeText={value => dispatch(filterData(value))}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
            value={searchTerm}
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
        getItemLayout={memoizedGetItemLayout}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={() => dispatch(deselectAll())}
        onConfirm={() => dispatch(deleteTransactionBatchesById('Transaction'))}
        confirmText={modalStrings.remove}
      />
      <PageContentModal
        isOpen={!!modalKey}
        onClose={() => dispatch(closeBasicModal())}
        title={getModalTitle(modalKey)}
      >
        {renderModalContent()}
      </PageContentModal>
    </DataTablePageView>
  );
};

SupplierInvoicePage.propTypes = {
  routeName: PropTypes.string.isRequired,
  transaction: PropTypes.object.isRequired,
};
