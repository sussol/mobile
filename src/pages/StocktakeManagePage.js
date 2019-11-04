/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { getItemLayout } from './dataTableUtilities';
import { createStocktake, updateStocktake } from '../navigation/actions';

import { BottomTextEditor } from '../widgets/modals';
import { ToggleBar, DataTablePageView, SearchBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';
import { debounce } from '../utilities/index';

export const StocktakeManage = ({
  dispatch,
  runWithLoadingIndicator,
  data,
  pageObject,
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
}) => {
  // On navigating to this screen, if a stocktake is passed through, update the selection with
  // the items already in the stocktake.
  useEffect(() => {
    if (pageObject) dispatch(PageActions.selectItems(pageObject.itemsInStocktake));
  }, []);

  const onCheck = rowKey => dispatch(PageActions.selectRow(rowKey));
  const onUncheck = rowKey => dispatch(PageActions.deselectRow(rowKey));

  const onSortColumn = useCallback(
    debounce(columnKey => dispatch(PageActions.sortData(columnKey)), 250, true),
    []
  );

  const getCallback = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'selected':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  }, []);

  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onNameChange = value => dispatch(PageActions.editName(value));
  const onSelectAll = () => dispatch(PageActions.toggleAllSelected(allSelected));
  const onHideStock = () => dispatch(PageActions.toggleStockOut(showAll));

  const onConfirmStocktake = () => {
    runWithLoadingIndicator(() => {
      const itemIds = Array.from(dataState.keys()).filter(id => dataState.get(id).isSelected && id);
      if (pageObject) return dispatch(updateStocktake(pageObject, itemIds, name));
      return dispatch(createStocktake({ stocktakeName: name, itemIds }));
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
          getCallback={getCallback}
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
        onPress={onSortColumn}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const toggles = useMemo(
    () => [
      { text: buttonStrings.hide_stockouts, onPress: onHideStock, isOn: !showAll },
      { text: buttonStrings.all_items_selected, onPress: onSelectAll, isOn: allSelected },
    ],
    [showAll, allSelected]
  );

  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>

        <View style={pageTopRightSectionContainer}>
          <ToggleBar toggles={toggles} />
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
        isOpen
        buttonText={pageObject ? modalStrings.confirm : modalStrings.create}
        value={name}
        placeholder={modalStrings.give_your_stocktake_a_name}
        onConfirm={onConfirmStocktake}
        onChangeText={onNameChange}
      />
    </DataTablePageView>
  );
};

const mapStateToProps = state => {
  const { pages } = state;
  const { stocktakeManager } = pages;
  return stocktakeManager;
};

export const StocktakeManagePage = connect(mapStateToProps)(StocktakeManage);

StocktakeManage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortBy: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  PageActions: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  showAll: PropTypes.bool.isRequired,
  allSelected: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  pageObject: PropTypes.object.isRequired,
};
