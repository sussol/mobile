/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { BottomConfirmModal } from '../widgets/modals';
import { SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { UIDatabase } from '../database';

import { newSortDataBy } from '../utilities';
import { usePageReducer, useNavigationFocus, useSyncListener } from '../hooks';
import { gotoCustomerRequisition } from '../navigation/actions';
import { getItemLayout, recordKeyExtractor } from './dataTableUtilities';

import { SUSSOL_ORANGE, newPageStyles } from '../globalStyles';
import { modalStrings } from '../localization';

const initialiseState = () => {
  const backingData = UIDatabase.objects('ResponseRequisition');
  const data = newSortDataBy(backingData.slice(), 'serialNumber');
  return {
    backingData,
    data,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber', 'otherStoreName.name'],
    sortBy: 'serialNumber',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
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

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    hasSelection,
    searchTerm,
    PageActions,
    columns,
  } = state;

  // Custom hook to refresh data on this page when becoming the head of the stack again.
  const callback = () => dispatch(PageActions.refreshData(), []);
  useNavigationFocus(callback, navigation);
  // Custom hook to listen to sync changes - refreshing data when requisitions are synced.
  useSyncListener(callback, 'Requisition');

  const onPressRow = useCallback(rowData => reduxDispatch(gotoCustomerRequisition(rowData)), []);
  const onConfirmDelete = () => dispatch(PageActions.deleteRequisitions());
  const onCancelDelete = () => dispatch(PageActions.deselectAll());
  const onSearchFiltering = value => dispatch(PageActions.filterData(value));

  const getAction = (colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = recordKeyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          columns={columns}
          dispatch={dispatch}
          getAction={getAction}
          onPress={onPressRow}
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
        dispatch={debouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const { newPageTopSectionContainer, newPageTopLeftSectionContainer, searchBar } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <View style={newPageTopLeftSectionContainer}>
          <SearchBar
            onChangeText={onSearchFiltering}
            style={searchBar}
            color={SUSSOL_ORANGE}
            value={searchTerm}
            placeholder=""
          />
        </View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={recordKeyExtractor}
        getItemLayout={getItemLayout}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
        confirmText={modalStrings.remove}
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
