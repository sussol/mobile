/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { MODAL_KEYS, debounce } from '../utilities';

import { DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageView, PageButton, PageInfo, SearchBar } from '../widgets';

import { getItemLayout } from './dataTableUtilities';

import { usePageReducer, useRecordListener } from '../hooks';

import globalStyles from '../globalStyles';
import { buttonStrings } from '../localization';

/**
 * Renders a mSupply mobile page with a customer requisition loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isDisabled },
 *
 * @prop {Object} requisition The realm transaction object for this invoice.
 * @prop {Func}   runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 */
export const CustomerRequisitionPage = ({ requisition, runWithLoadingIndicator, routeName }) => {
  const initialState = { page: routeName, pageObject: requisition };
  const [state, dispatch] = usePageReducer(initialState);

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    modalKey,
    pageObject,
    keyExtractor,
    modalValue,
    searchTerm,
    PageActions,
    columns,
    getPageInfoColumns,
  } = state;

  // Listen for changes to this pages requisition. Refreshing data on side effects i.e. finalizing.
  useRecordListener(() => dispatch(PageActions.refreshData()), requisition, 'Requisition');

  const { isFinalised, comment } = pageObject;

  // On click handlers
  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onAddItem = value => dispatch(PageActions.addRequisitionItem(value));
  const onEditComment = value => dispatch(PageActions.editComment(value, 'Requisition'));
  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onEditSuppliedQuantity = (newValue, rowKey, columnKey) =>
    dispatch(PageActions.editSuppliedQuantity(newValue, rowKey, columnKey));
  const onSetSuppliedToRequested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setSuppliedToRequested()));
  const onSetSuppliedToSuggested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setSuppliedToSuggested()));
  const onSortColumn = useCallback(
    debounce(columnKey => dispatch(PageActions.sortData(columnKey)), 250, true),
    []
  );
  const pageInfoColumns = useCallback(getPageInfoColumns(pageObject, dispatch, PageActions), [
    comment,
    isFinalised,
  ]);

  const getCallback = useCallback(colKey => {
    switch (colKey) {
      case 'suppliedQuantity':
        return onEditSuppliedQuantity;
      default:
        return null;
    }
  }, []);

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddItem;
      case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
        return onEditComment;
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
          <PageButton
            style={globalStyles.topButton}
            text={buttonStrings.use_requested_quantities}
            onPress={onSetSuppliedToRequested}
            isDisabled={requisition.isFinalised}
          />
          <PageButton
            style={globalStyles.topButton}
            text={buttonStrings.use_suggested_quantities}
            onPress={onSetSuppliedToSuggested}
            isDisabled={isFinalised}
          />
        </View>
      </View>
      <DataTable
        data={data}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
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
CustomerRequisitionPage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
};
