/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { useNavigationFocus, useSyncListener } from '../hooks';
import { getItemLayout, getPageDispatchers } from './dataTableUtilities';

import globalStyles from '../globalStyles';

import { ROUTES } from '../navigation/constants';

export const Prescribers = ({
  navigation,
  data,
  sortBy,
  isAscending,
  searchTerm,
  columns,
  keyExtractor,
  refreshData,
  onFilterData,
  onSortColumn,
}) => {
  // Custom hook to refresh data on this page when becoming the head of the stack again.
  useNavigationFocus(refreshData, navigation);
  useSyncListener(refreshData, 'Prescriber');

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow rowData={data[index]} rowKey={rowKey} columns={columns} rowIndex={index} />
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
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const { pageTopSectionContainer, pageTopLeftSectionContainer } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
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

const mapDispatchToProps = (dispatch, ownProps) =>
  getPageDispatchers(dispatch, ownProps, 'Prescriber', ROUTES.PRESCRIBERS);

const mapStateToProps = state => {
  const { pages } = state;
  const { prescribers } = pages;
  return prescribers;
};

export const PrescribersPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Prescribers);

Prescribers.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  sortBy: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
};
