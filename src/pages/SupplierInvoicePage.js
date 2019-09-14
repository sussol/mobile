/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { UIDatabase } from '../database';

import { MODAL_KEYS } from '../utilities';
import { usePageReducer } from '../hooks';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles, { SUSSOL_ORANGE, newPageStyles } from '../globalStyles';

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
    modalValue: null,
    hasSelection: false,
  });

  const {
    pageObject,
    data,
    dataState,
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

  const { isFinalised, comment, theirRef } = pageObject;

  const onAddItem = item => dispatch(PageActions.addTransactionBatch(item));
  const onEditComment = value => dispatch(PageActions.editComment(value, 'Transaction'));
  const onEditTheirRef = value => dispatch(PageActions.editTheirRef(value, 'Transaction'));
  const onNewInvoice = () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_ITEM));
  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onCancelDelete = () => dispatch(PageActions.deselectAll());
  const onConfirmDelete = () => dispatch(PageActions.deleteTransactionBatches());
  const onCloseModal = () => dispatch(PageActions.closeModal());

  const renderPageInfo = useCallback(
    () => (
      <PageInfo
        columns={getPageInfoColumns(pageObject, dispatch, PageActions)}
        isEditingDisabled={isFinalised}
      />
    ),
    [comment, theirRef, isFinalised]
  );

  const getAction = (columnKey, propName) => {
    switch (columnKey) {
      case 'totalQuantity':
        return PageActions.editTotalQuantity;
      case 'expiryDate':
        return PageActions.editTransactionBatchExpiryDate;
      case 'remove':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddItem;
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
          dispatch={dispatch}
          getAction={getAction}
          rowIndex={index}
        />
      );
    },
    [data, dataState]
  );

  const PageButtons = useCallback(() => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton
          style={topButton}
          text={buttonStrings.new_item}
          onPress={onNewInvoice}
          isDisabled={isFinalised}
        />
      </View>
    );
  }, []);

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
            onChangeText={onFilterData}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
            value={searchTerm}
          />
        </View>
        <View style={newPageTopRightSectionContainer}>
          <PageButtons />
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

SupplierInvoicePage.propTypes = {
  routeName: PropTypes.string.isRequired,
  transaction: PropTypes.object.isRequired,
};
