/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { MODAL_KEYS } from '../utilities';
import { usePageReducer, useRecordListener } from '../hooks';
import { getItemLayout } from './dataTableUtilities';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';

export const SupplierInvoicePage = ({ routeName, transaction }) => {
  const initialState = { page: routeName, pageObject: transaction };
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(initialState);

  const {
    pageObject,
    data,
    dataState,
    keyExtractor,
    sortBy,
    isAscending,
    modalKey,
    modalValue,
    hasSelection,
    searchTerm,
    PageActions,
    columns,
    getPageInfoColumns,
  } = state;

  // Listen for this transaction being finalised, so data can be refreshed and kept consistent.
  const refreshCallback = () => dispatch(PageActions.refreshData());
  useRecordListener(refreshCallback, pageObject, 'Transaction');

  const { isFinalised, comment, theirRef } = pageObject;

  const onAddBatch = item => dispatch(PageActions.addTransactionBatch(item));
  const onEditComment = value => dispatch(PageActions.editComment(value, 'Transaction'));
  const onEditTheirRef = value => dispatch(PageActions.editTheirRef(value, 'Transaction'));
  const onAddRow = () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_ITEM));
  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onCancelDelete = () => dispatch(PageActions.deselectAll());
  const onConfirmDelete = () => dispatch(PageActions.deleteTransactionBatches());
  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onCheck = (rowKey, columnKey) => dispatch(PageActions.selectRow(rowKey, columnKey));
  const onUncheck = (rowKey, columnKey) => dispatch(PageActions.deselectRow(rowKey, columnKey));
  const onEditDate = (date, rowKey, columnKey) =>
    dispatch(PageActions.editTransactionBatchExpiryDate(date, rowKey, columnKey));
  const onEditTotalQuantity = (newValue, rowKey, columnKey) =>
    dispatch(PageActions.editTotalQuantity(newValue, rowKey, columnKey));

  const pageInfoColumns = useCallback(getPageInfoColumns(pageObject, dispatch, PageActions), [
    comment,
    theirRef,
    isFinalised,
  ]);

  const getCallback = useCallback((columnKey, propName) => {
    switch (columnKey) {
      case 'totalQuantity':
        return onEditTotalQuantity;
      case 'expiryDate':
        return onEditDate;
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  }, []);

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddBatch;
      case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
        return onEditComment;
      case MODAL_KEYS.THEIR_REF_EDIT:
        return onEditTheirRef;
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          columns={columns}
          isFinalised={isFinalised}
          getCallback={getCallback}
          rowIndex={index}
        />
      );
    },
    [data, dataState]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        dispatch={instantDebouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
          <PageButton text={buttonStrings.new_item} onPress={onAddRow} isDisabled={isFinalised} />
        </View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />
    </DataTablePageView>
  );
};

/* eslint-disable react/forbid-prop-types */
SupplierInvoicePage.propTypes = {
  routeName: PropTypes.string.isRequired,
  transaction: PropTypes.object.isRequired,
};
