/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { MODAL_KEYS } from '../utilities';
import { useRecordListener, usePageReducer } from '../hooks';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles, { newPageStyles } from '../globalStyles';

const stateInitialiser = pageObject => ({
  pageObject,
  backingData: pageObject.items,
  data: pageObject.items.sorted('item.name').slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  searchTerm: '',
  filterDataKeys: ['item.name'],
  sortBy: 'itemName',
  isAscending: true,
  modalKey: '',
  modalValue: null,
  hasSelection: false,
});

/**
 * Renders a mSupply mobile page with customer invoice loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused, isDisabled },
 *
 * @prop {Object} transaction The realm transaction object for this invoice.
 * @prop {Func} runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 */
export const CustomerInvoicePage = ({ transaction, runWithLoadingIndicator, routeName }) => {
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(
    routeName,
    {},
    stateInitialiser,
    transaction
  );

  const {
    data,
    dataState,
    pageObject,
    sortBy,
    isAscending,
    modalKey,
    hasSelection,
    keyExtractor,
    searchTerm,
    modalValue,
    columns,
    PageActions,
    getPageInfoColumns,
  } = state;

  const { isFinalised, comment, theirRef } = pageObject;

  // Listen for this invoice being finalised which will prune items and cause side effects
  // outside of the reducer. Reconcile differences when triggered.
  const refreshCallback = () => dispatch(PageActions.refreshData());
  useRecordListener(refreshCallback, pageObject, 'Transaction');

  const onAddItem = item => dispatch(PageActions.addTransactionItem(item));
  const onNewRow = () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_ITEM));
  const onEditComment = value => dispatch(PageActions.editComment(value, 'Transaction'));
  const onEditTheirRef = value => dispatch(PageActions.editTheirRef(value, 'Transaction'));
  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onConfirmDelete = () => dispatch(PageActions.deleteTransactions());
  const onCancelDelete = () => dispatch(PageActions.deselectAll());
  const onCloseModal = () => dispatch(PageActions.closeModal());

  const onAddMasterList = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.addMasterListItems('Transaction')));

  const renderPageInfo = useCallback(
    () => (
      <PageInfo
        columns={getPageInfoColumns(pageObject, dispatch, PageActions)}
        isEditingDisabled={isFinalised}
      />
    ),
    [comment, theirRef, isFinalised]
  );

  const getAction = (colKey, propName) => {
    switch (colKey) {
      case 'totalQuantity':
        return PageActions.editTotalQuantity;
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

  const renderButtons = () => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton
          style={{ ...topButton, marginLeft: 0 }}
          text={buttonStrings.new_item}
          onPress={onNewRow}
          isDisabled={isFinalised}
        />
        <PageButton
          text={buttonStrings.add_master_list_items}
          onPress={onAddMasterList}
          isDisabled={isFinalised}
        />
      </View>
    );
  };

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
          <SearchBar onChangeText={onFilterData} style={searchBar} value={searchTerm} />
        </View>
        <View style={newPageTopRightSectionContainer}>{renderButtons()}</View>
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

CustomerInvoicePage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
};
