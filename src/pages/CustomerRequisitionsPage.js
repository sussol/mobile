/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { SearchBar, DataTablePageView, ToggleBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { useNavigationFocus, useSyncListener } from '../hooks';
import { gotoCustomerRequisition } from '../navigation/actions';
import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';

import globalStyles from '../globalStyles';
import { buttonStrings, generalStrings } from '../localization';

import { ROUTES } from '../navigation/constants';

/**
 * Renders a mSupply mobile page with a list of Customer requisitions.
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from `backingData` to display in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused },
 */
export const CustomerRequisitions = ({
  dispatch,
  navigation,
  data,
  sortKey,
  isAscending,
  searchTerm,
  columns,
  keyExtractor,
  showFinalised,
  refreshData,
  onFilterData,
  toggleFinalised,
  onSortColumn,
}) => {
  // Custom hook to refresh data on this page when becoming the head of the stack again.
  useNavigationFocus(navigation, refreshData);
  useSyncListener(refreshData, 'Requisition');

  const onPressRow = useCallback(rowData => dispatch(gotoCustomerRequisition(rowData)), []);

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowKey={rowKey}
          columns={columns}
          onPress={onPressRow}
          rowIndex={index}
        />
      );
    },
    [data]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        onPress={onSortColumn}
        isAscending={isAscending}
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending]
  );

  const PastCurrentToggleBar = useCallback(
    () => (
      <ToggleBar
        toggles={[
          { text: buttonStrings.current, onPress: toggleFinalised, isOn: !showFinalised },
          { text: buttonStrings.past, onPress: toggleFinalised, isOn: showFinalised },
        ]}
      />
    ),
    [showFinalised]
  );

  const { pageTopSectionContainer, pageTopLeftSectionContainer } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <PastCurrentToggleBar />
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.search_by} ${generalStrings.requisition_number}`}
          />
        </View>
      </View>
      <DataTable
        data={data}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.CUSTOMER_REQUISITIONS),
  onFilterData: value =>
    dispatch(PageActions.filterDataWithFinalisedToggle(value, ROUTES.CUSTOMER_REQUISITIONS)),
  refreshData: () =>
    dispatch(PageActions.refreshDataWithFinalisedToggle(ROUTES.CUSTOMER_REQUISITIONS)),
});

const mapStateToProps = state => {
  const { pages } = state;
  const { customerRequisitions } = pages;
  return customerRequisitions;
};

export const CustomerRequisitionsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerRequisitions);

CustomerRequisitions.defaultProps = {
  showFinalised: false,
};

CustomerRequisitions.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  showFinalised: PropTypes.bool,
  refreshData: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  toggleFinalised: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
};
