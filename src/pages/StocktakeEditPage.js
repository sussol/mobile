/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { MODAL_KEYS } from '../utilities';
import { buttonStrings } from '../localization';
import { DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import DataTablePageView from './containers/DataTablePageView';

import {
  filterData,
  selectRow,
  deselectRow,
  closeBasicModal,
  editComment,
  focusNext,
  focusCell,
  sortData,
  editCountedTotalQuantity,
  closeStocktakeBatchModal,
  openModal,
  resetStocktake,
} from './dataTableUtilities/actions';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities/utilities';
import { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import usePageReducer from '../hooks/usePageReducer';
import { gotoStocktakeManagePage } from '../navigation/actions';

/**
 * Renders a mSupply page with a stocktake loaded for editing
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
 * @prop {Object} stocktake The realm transaction object for this invoice.
 * @prop {Func} runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 * @prop {Func}   dispatch  Redux store dispatch function.
 *
 */
export const StocktakeEditPage = ({
  runWithLoadingIndicator,
  stocktake,
  routeName,
  dispatch: reduxDispatch,
}) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    pageObject: stocktake,
    backingData: stocktake.items,
    data: stocktake.items.sorted('item.name').slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    modalValue: null,
  });

  const { STOCKTAKE_COMMENT_EDIT, EDIT_STOCKTAKE_BATCH, STOCKTAKE_OUTDATED_ITEM } = MODAL_KEYS;
  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    pageInfo,
    pageObject,
    currentStocktakeItem,
    modalValue,
    keyExtractor,
  } = state;

  const { isFinalised, comment, program } = pageObject;

  useEffect(() => {
    if (stocktake.itemsOutdated.length && !isFinalised) {
      dispatch(openModal(STOCKTAKE_OUTDATED_ITEM));
    }
  }, []);

  const renderPageInfo = useCallback(
    () => <PageInfo columns={pageInfo(pageObject, dispatch)} isEditingDisabled={isFinalised} />,
    [comment, isFinalised]
  );

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'countedTotalQuantity':
        return editCountedTotalQuantity;
      case 'modalControl':
        return rowKey => openModal(EDIT_STOCKTAKE_BATCH, rowKey);
      case 'remove':
        if (propName === 'onCheckAction') return selectRow;
        return deselectRow;
      default:
        return null;
    }
  });

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
          isFinalised={isFinalised}
          dispatch={dispatch}
          focusCellAction={focusCell}
          focusNextAction={focusNext}
          getAction={getAction}
        />
      );
    },
    [data, dataState]
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

  const getModalOnSelect = () => {
    switch (modalKey) {
      case STOCKTAKE_COMMENT_EDIT:
        return value => dispatch(editComment(value, 'Stocktake'));
      case EDIT_STOCKTAKE_BATCH:
        return () => dispatch(closeStocktakeBatchModal());
      case STOCKTAKE_OUTDATED_ITEM:
        return () => runWithLoadingIndicator(() => dispatch(resetStocktake()));
      default:
        return null;
    }
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
          {renderPageInfo()}
          <SearchBar
            onChange={value => debouncedDispatch(filterData(value))}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
          />
        </View>
        <View style={newPageTopRightSectionContainer}>
          {!program && (
            <PageButton
              text={buttonStrings.manage_stocktake}
              onPress={() =>
                reduxDispatch(gotoStocktakeManagePage({ stocktake, stocktakeName: stocktake.name }))
              }
              isDisabled={isFinalised}
            />
          )}
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
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(closeBasicModal())}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
        modalObject={currentStocktakeItem}
      />
    </DataTablePageView>
  );
};

StocktakeEditPage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  stocktake: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
