/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS, debounce } from '../utilities';
import { useRecordListener } from '../hooks';
import { getItemLayout } from './dataTableUtilities';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';

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
export const CustomerInvoice = ({
  runWithLoadingIndicator,
  dispatch,
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
}) => {
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
  const onCheck = rowKey => dispatch(PageActions.selectRow(rowKey));
  const onUncheck = rowKey => dispatch(PageActions.deselectRow(rowKey));
  const onEditTotalQuantity = (newValue, rowKey) =>
    dispatch(PageActions.editTotalQuantity(newValue, rowKey));

  const onAddMasterList = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.addMasterListItems('Transaction')));

  const onSortColumn = useCallback(
    debounce(columnKey => dispatch(PageActions.sortData(columnKey)), 250, true),
    []
  );

  const pageInfoColumns = useCallback(getPageInfoColumns(pageObject, dispatch, PageActions), [
    comment,
    theirRef,
    isFinalised,
  ]);

  const getCallback = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'totalQuantity':
        return onEditTotalQuantity;
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
        onPress={onSortColumn}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const { verticalContainer, topButton } = globalStyles;
  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
    searchBar,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar onChangeText={onFilterData} style={searchBar} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
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

const mapStateToProps = state => {
  const { pages } = state;
  const { customerInvoice } = pages;
  return customerInvoice;
};

export const CustomerInvoicePage = connect(mapStateToProps)(CustomerInvoice);

CustomerInvoice.defaultProps = {
  modalValue: null,
};

CustomerInvoice.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  pageObject: PropTypes.object.isRequired,
  sortBy: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  modalKey: PropTypes.string.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  modalValue: PropTypes.any,
  columns: PropTypes.array.isRequired,
  PageActions: PropTypes.object.isRequired,
  getPageInfoColumns: PropTypes.func.isRequired,
};
