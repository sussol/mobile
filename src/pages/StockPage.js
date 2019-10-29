/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { getItemLayout } from './dataTableUtilities/utilities';

import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import globalStyles from '../globalStyles';
import { usePageReducer, useSyncListener } from '../hooks';

import { DataTablePageView, SearchBar } from '../widgets';

import { ItemDetails } from '../widgets/modals/ItemDetails';
import { debounce } from '../utilities/index';

/**
 * Renders a mSupply mobile page with Items and their stock levels.
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
 * @prop {Object} routeName Name of the current route.
 */
export const StockPage = ({ routeName }) => {
  const initialState = { page: routeName };
  const [state, dispatch] = usePageReducer(initialState);

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
  const onFilterData = value => dispatch(PageActions.filterData(value));

  const onSortColumn = useCallback(
    debounce(columnKey => dispatch(PageActions.sortData(columnKey)), 250, true),
    []
  );

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
      onPress={onSortColumn}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

  const { pageTopSectionContainer } = globalStyles;
  return (
    <DataTablePageView captureUncaughtGestures={false}>
      <View style={pageTopSectionContainer}>
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
