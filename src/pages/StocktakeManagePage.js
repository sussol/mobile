/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { UIDatabase } from '../database';

import { usePageReducer } from '../hooks';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';
import { createStocktake, addItemsToStocktake } from '../navigation/actions';

import { BottomTextEditor } from '../widgets/modals';
import { ToggleBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';

export const StocktakeManagePage = ({
  routeName,
  dispatch: reduxDispatch,
  stocktake,
  runWithLoadingIndicator,
}) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    pageObject: stocktake,
    backingData: UIDatabase.objects('Item'),
    data: UIDatabase.objects('Item')
      .sorted('name')
      .slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name', 'code'],
    sortBy: 'name',
    isAscending: true,
    hasSelection: false,
    allSelected: false,
    showAll: true,
    name: stocktake ? stocktake.name : '',
  });

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    hasSelection,
    showAll,
    allSelected,
    name,
    keyExtractor,
    searchTerm,
    PageActions,
    columns,
  } = state;

  // On navigating to this screen, if a stocktake is passed through, update the selection with
  // the items already in the stocktake.
  useEffect(() => {
    if (stocktake) dispatch(PageActions.selectItems(stocktake.itemsInStocktake));
  }, []);

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'selected':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
      default:
        return null;
    }
  });

  const confirmStocktake = () => {
    const itemIds = Array.from(dataState.keys()).filter(id => id);

    const updateExistingStocktake = () => reduxDispatch(addItemsToStocktake(stocktake, itemIds));
    const createNewStocktake = () =>
      reduxDispatch(createStocktake({ stocktakeName: name, itemIds }));

    runWithLoadingIndicator(() => {
      if (stocktake) return updateExistingStocktake();
      return createNewStocktake();
    });
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      const { row, alternateRow } = newDataTableStyles;

      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          style={index % 2 === 0 ? alternateRow : row}
          columns={columns}
          dispatch={dispatch}
          getAction={getAction}
        />
      );
    },
    [data, dataState, showAll, hasSelection]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        dispatch={instantDebouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    []
  );

  const Toggle = useCallback(
    () => (
      <ToggleBar
        toggles={[
          {
            text: buttonStrings.hide_stockouts,
            onPress: () => dispatch(PageActions.toggleStockOut(showAll)),
            isOn: !showAll,
          },
          {
            text: buttonStrings.all_items_selected,
            onPress: () => dispatch(PageActions.toggleAllSelected(allSelected)),
            isOn: allSelected,
          },
        ]}
      />
    ),
    [showAll, allSelected]
  );

  const {
    newPageTopSectionContainer,
    newPageTopLeftSectionContainer,
    newPageTopRightSectionContainer,
    searchBar,
  } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <View style={newPageTopLeftSectionContainer}>
          <SearchBar
            onChangeText={value => debouncedDispatch(PageActions.filterData(value))}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
            value={searchTerm}
          />
        </View>
        <View style={newPageTopRightSectionContainer}>
          <Toggle />
        </View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
      />
      <BottomTextEditor
        isOpen={hasSelection}
        buttonText={stocktake ? modalStrings.confirm : modalStrings.create}
        value={name}
        placeholder={modalStrings.give_your_stocktake_a_name}
        onConfirm={confirmStocktake}
        onChangeText={value => dispatch(PageActions.editName(value))}
      />
    </DataTablePageView>
  );
};

StocktakeManagePage.defaultProps = {
  stocktake: null,
};

StocktakeManagePage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  stocktake: PropTypes.object,
};
