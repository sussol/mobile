/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { recordKeyExtractor, getItemLayout } from './dataTableUtilities/utilities';
import { UIDatabase } from '../database';

import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { newPageStyles } from '../globalStyles';
import { usePageReducer, useSyncListener } from '../hooks';

import { DataTablePageView, SearchBar } from '../widgets';

import { ItemDetails } from '../widgets/modals/ItemDetails';

const stateInitialiser = () => {
  const backingData = UIDatabase.objects('Item').sorted('name');

  return {
    backingData,
    data: backingData.slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: 'itemName',
    isAscending: true,
    selectedRow: null,
  };
};

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
export const StockPage = ({ routeName }) => {
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(
    routeName,
    {},
    stateInitialiser
  );

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    selectedRow,
    searchTerm,
    keyExtractor,
    columns,
    PageActions,
  } = state;

  //  Refresh data on retrieving item or itembatch records from sync.
  const refreshCallback = () => dispatch(PageActions.refreshData());
  useSyncListener(refreshCallback, ['Item', 'ItemBatch']);

  const onSelectRow = useCallback(({ id }) => dispatch(PageActions.selectOneRow(id)), []);
  const onDeselectRow = () => dispatch(PageActions.deselectRow(selectedRow.id));
  const onFilterData = value => PageActions.filterData(value);

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
          isFinalised={false}
          dispatch={dispatch}
          rowIndex={index}
          onPress={onSelectRow}
        />
      );
    },
    [data, dataState]
  );

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={PageActions.sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

  const { newPageTopSectionContainer } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <SearchBar
          onChangeText={onFilterData}
          value={searchTerm}
          onFocusOrBlur={selectedRow && onDeselectRow}
        />
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

      <ItemDetails isOpen={!!selectedRow} item={selectedRow} onClose={onDeselectRow} />
    </DataTablePageView>
  );
};

StockPage.propTypes = {
  routeName: PropTypes.string.isRequired,
};
