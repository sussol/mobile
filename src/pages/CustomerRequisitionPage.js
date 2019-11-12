/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../utilities';

import { DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageView, PageButton, PageInfo, SearchBar } from '../widgets';
import { ROUTES } from '../navigation/constants';
import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';

import { useRecordListener } from '../hooks';

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
 */
export const CustomerRequisition = ({
  runWithLoadingIndicator,
  data,
  dispatch,
  dataState,
  sortBy,
  isAscending,
  modalKey,
  pageObject,
  keyExtractor,
  modalValue,
  searchTerm,
  columns,
  getPageInfoColumns,
  refreshData,
  onEditComment,
  onFilterData,
  onCloseModal,
  onSortColumn,
  onEditSuppliedQuantity,
  route,
}) => {
  // Listen for changes to this pages requisition. Refreshing data on side effects i.e. finalizing.
  useRecordListener(refreshData, pageObject, 'Requisition');

  const { isFinalised, comment } = pageObject;

  const onSetSuppliedToRequested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setSuppliedToRequested(route)));
  const onSetSuppliedToSuggested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setSuppliedToSuggested(route)));

  const pageInfoColumns = useCallback(getPageInfoColumns(pageObject, dispatch, route), [
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
            isDisabled={isFinalised}
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

const mapDispatchToProps = (dispatch, ownProps) =>
  getPageDispatchers(dispatch, ownProps, 'Requisition', ROUTES.CUSTOMER_REQUISITION);

const mapStateToProps = state => {
  const { pages } = state;
  const { customerRequisition } = pages;
  return customerRequisition;
};

export const CustomerRequisitionPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerRequisition);

CustomerRequisition.defaultProps = {
  modalValue: null,
};

CustomerRequisition.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  sortBy: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  dataState: PropTypes.object.isRequired,
  modalKey: PropTypes.string.isRequired,
  pageObject: PropTypes.object.isRequired,
  modalValue: PropTypes.any,
  getPageInfoColumns: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onEditSuppliedQuantity: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
};
