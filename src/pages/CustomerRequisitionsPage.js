/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { SearchBar, DataTablePageView, ToggleBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { usePageReducer, useNavigationFocus, useSyncListener } from '../hooks';
import { gotoCustomerRequisition } from '../navigation/actions';
import { getItemLayout, recordKeyExtractor } from './dataTableUtilities';

import globalStyles from '../globalStyles';
import { buttonStrings } from '../localization';

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
  const initialState = { page: routeName };
  const [state, dispatch, debouncedDispatch] = usePageReducer(initialState);

  const {
    data,
    sortKey,
    isAscending,
    searchTerm,
    PageActions,
    columns,
    keyExtractor,
    showFinalised,
  } = state;

  const refreshCallback = () => dispatch(PageActions.refreshData(), []);
  // Custom hook to refresh data on this page when becoming the head of the stack again.
  useNavigationFocus(refreshCallback, navigation);
  // Custom hook to listen to sync changes - refreshing data when requisitions are synced.
  useSyncListener(refreshCallback, 'Requisition');

  const onPressRow = useCallback(rowData => reduxDispatch(gotoCustomerRequisition(rowData)), []);
  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onToggleShowFinalised = () => dispatch(PageActions.toggleShowFinalised(showFinalised));

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
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending]
  );

  const PastCurrentToggleBar = useCallback(
    () => (
      <ToggleBar
        toggles={[
          { text: buttonStrings.current, onPress: onToggleShowFinalised, isOn: !showFinalised },
          { text: buttonStrings.past, onPress: onToggleShowFinalised, isOn: showFinalised },
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
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>
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

/* eslint-disable react/forbid-prop-types */
CustomerRequisitionsPage.propTypes = {
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

CustomerRequisitionsPage.propTypes = { routeName: PropTypes.string.isRequired };
