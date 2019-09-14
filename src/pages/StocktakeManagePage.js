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
import { buttonStrings, modalStrings } from '../localization';
import { UIDatabase } from '../database';
import { BottomTextEditor } from '../widgets/modals';
import { ToggleBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import { usePageReducer } from '../hooks/usePageReducer';

import { createStocktake, addItemsToStocktake } from '../navigation/actions';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities/utilities';
import {
  filterData,
  sortData,
  hideStockOut,
  showStockOut,
} from './dataTableUtilities/actions/tableActions';
import {
  selectRow,
  deselectRow,
  selectAll,
  deselectAll,
  selectItems,
} from './dataTableUtilities/actions/rowActions';
import { editName } from './dataTableUtilities/actions/pageActions';

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
    columns,
    hasSelection,
    showAll,
    allSelected,
    name,
    keyExtractor,
  } = state;

  // On navigating to this screen, if a stocktake is passed through, update the selection with
  // the items already in the stocktake.
  useEffect(() => {
    if (stocktake) dispatch(selectItems(stocktake.itemsInStocktake));
  }, []);

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'selected':
        if (propName === 'onCheckAction') return selectRow;
        return deselectRow;
      default:
        return null;
    }
  });

  const Toggle = () => (
    <ToggleBar
      style={globalStyles.toggleBar}
      textOffStyle={globalStyles.toggleText}
      textOnStyle={globalStyles.toggleTextSelected}
      toggleOffStyle={globalStyles.toggleOption}
      toggleOnStyle={globalStyles.toggleOptionSelected}
      toggles={[
        {
          text: buttonStrings.hide_stockouts,
          onPress: () => (showAll ? dispatch(hideStockOut()) : dispatch(showStockOut())),
          isOn: !showAll,
        },
        {
          text: buttonStrings.all_items_selected,
          onPress: () => (allSelected ? dispatch(deselectAll()) : dispatch(selectAll())),
          isOn: allSelected,
        },
      ]}
    />
  );

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

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

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
            onChange={value => debouncedDispatch(filterData(value))}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
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
        onChangeText={value => dispatch(editName(value))}
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
