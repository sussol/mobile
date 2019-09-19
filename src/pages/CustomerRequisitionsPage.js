/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { UIDatabase } from '../database';

import { newSortDataBy } from '../utilities';
import { usePageReducer, useNavigationFocus, useSyncListener } from '../hooks';
import { gotoCustomerRequisition } from '../navigation/actions';
import { getItemLayout, recordKeyExtractor } from './dataTableUtilities';

import { newPageStyles } from '../globalStyles';

const initialiseState = () => {
  const backingData = UIDatabase.objects('ResponseRequisition');
  const data = newSortDataBy(backingData.slice(), 'serialNumber', false);
  return {
    backingData,
    data,
    keyExtractor: recordKeyExtractor,
    searchTerm: '',
    filterDataKeys: ['serialNumber', 'otherStoreName.name'],
    sortBy: 'serialNumber',
    isAscending: false,
  };
};

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
 *
 * @prop {String} routeName     The current route name for the top of the navigation stack.
 * @prop {Object} currentUser   The currently logged in user.
 * @prop {Func}   reduxDispatch Dispatch method for the app-wide redux store.
 * @prop {Object} navigation    Reference to the main application stack navigator.
 */
export const CustomerRequisitionsPage = ({ routeName, dispatch: reduxDispatch, navigation }) => {
  const [state, dispatch, debouncedDispatch] = usePageReducer(routeName, {}, initialiseState);

  const { data, sortBy, isAscending, searchTerm, PageActions, columns, keyExtractor } = state;

  const refreshCallback = () => dispatch(PageActions.refreshData(), []);
  // Custom hook to refresh data on this page when becoming the head of the stack again.
  useNavigationFocus(refreshCallback, navigation);
  // Custom hook to listen to sync changes - refreshing data when requisitions are synced.
  useSyncListener(refreshCallback, 'Requisition');

  const onPressRow = useCallback(rowData => reduxDispatch(gotoCustomerRequisition(rowData)), []);
  const onSearchFiltering = value => dispatch(PageActions.filterData(value));

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowKey={rowKey}
          columns={columns}
          dispatch={dispatch}
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
        dispatch={debouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const { newPageTopSectionContainer } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <SearchBar onChangeText={onSearchFiltering} value={searchTerm} />
      </View>
      <DataTable
        data={data}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={recordKeyExtractor}
        getItemLayout={getItemLayout}
      />
    </DataTablePageView>
  );
};

CustomerRequisitionsPage.propTypes = {
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

CustomerRequisitionsPage.propTypes = { routeName: PropTypes.string.isRequired };
