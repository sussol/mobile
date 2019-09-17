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

import { DataTable, Row, Cell, DataTableHeaderRow } from '../widgets/DataTable';

import { newDataTableStyles } from '../globalStyles';
import { usePageReducer } from '../hooks';

import { DataTablePageView, SearchBar } from '../widgets';

import { ItemDetails } from '../widgets/ItemDetails';

const initialState = () => {
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
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(routeName, initialState());

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

  const renderCells = useCallback(rowData => {
    const { cellContainer, cellText } = newDataTableStyles;
    return columns.map(({ key: colKey, width, alignText }, index) => {
      const isLastCell = index === columns.length - 1;
      return (
        <Cell
          key={colKey}
          value={rowData[colKey]}
          width={width}
          viewStyle={cellContainer[alignText || 'left']}
          textStyle={cellText[alignText || 'left']}
          isLastCell={isLastCell}
          debug
        />
      );
    });
  });

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = recordKeyExtractor(item);

      return (
        <Row
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          renderCells={renderCells}
          onPress={({ id }) => dispatch(PageActions.selectOneRow(id))}
        />
      );
    },
    [data, dataState, renderCells]
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

  return (
    <DataTablePageView>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
        }}
      >
        <View style={{ flex: 5, justifyContent: 'flex-end', marginBottom: 20, paddingLeft: 20 }}>
          <SearchBar onChange={value => PageActions.filterData(value)} value={searchTerm} />
        </View>
      </View>
      <View style={{ flex: 4 }}>
        <DataTable
          data={data}
          extraData={dataState}
          renderRow={renderRow}
          renderHeader={renderHeader}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
        />
      </View>
      <ItemDetails
        isOpen={!!selectedRow}
        item={selectedRow}
        onClose={() => dispatch(PageActions.deselectRow(selectedRow.id))}
      />
    </DataTablePageView>
  );
};

StockPage.propTypes = {
  routeName: PropTypes.string.isRequired,
};
