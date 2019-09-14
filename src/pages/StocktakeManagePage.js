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
import { SUSSOL_ORANGE, newPageStyles } from '../globalStyles';

const stateInitialiser = pageObject => {
  const backingData = UIDatabase.objects('Item');
  return {
    pageObject,
    backingData,
    data: backingData.sorted('name').slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name', 'code'],
    name: pageObject ? pageObject.name : '',
    sortBy: 'name',
    isAscending: true,
    hasSelection: false,
    allSelected: false,
    showAll: true,
  };
};

export const StocktakeManagePage = ({
  routeName,
  dispatch: reduxDispatch,
  stocktake,
  runWithLoadingIndicator,
}) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(
    routeName,
    {},
    stateInitialiser,
    stocktake
  );

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

  const onNameChange = value => dispatch(PageActions.editName(value));
  const onSelectAll = () => dispatch(PageActions.toggleAllSelected(allSelected));
  const onHideStock = () => dispatch(PageActions.toggleStockOut(showAll));

  const onConfirmStocktake = () => {
    runWithLoadingIndicator(() => {
      const itemIds = Array.from(dataState.keys()).filter(id => id);
      if (stocktake) return reduxDispatch(addItemsToStocktake(stocktake, itemIds));
      return reduxDispatch(createStocktake({ stocktakeName: name, itemIds }));
    });
  };

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
          dispatch={dispatch}
          getAction={getAction}
          rowIndex={index}
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
          { text: buttonStrings.hide_stockouts, onPress: onHideStock, isOn: !showAll },
          { text: buttonStrings.all_items_selected, onPress: onSelectAll, isOn: allSelected },
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
        onConfirm={onConfirmStocktake}
        onChangeText={onNameChange}
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
