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
import { usePageReducer } from '../hooks/usePageReducer';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';

import { DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { gotoStocktakeManagePage } from '../navigation/actions';
import { filterData, sortData } from './dataTableUtilities/actions/tableActions';
import { selectRow, deselectRow } from './dataTableUtilities/actions/rowActions';
import {
  closeModal,
  openModal,
  editComment,
  resetStocktake,
} from './dataTableUtilities/actions/pageActions';
import { applyReason, editCountedQuantity } from './dataTableUtilities/actions/cellActions';

import { buttonStrings } from '../localization';
import { SUSSOL_ORANGE, newPageStyles } from '../globalStyles';

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

  const { STOCKTAKE_OUTDATED_ITEM } = MODAL_KEYS;
  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    getPageInfoColumns,
    pageObject,
    currentStocktakeItem,
    modalValue,
    keyExtractor,
    PageActions,
  } = state;

  const { isFinalised, comment, program } = pageObject;

  useEffect(() => {
    if (stocktake.itemsOutdated.length && !isFinalised) {
      dispatch(openModal(STOCKTAKE_OUTDATED_ITEM));
    }
  }, []);

  const renderPageInfo = useCallback(
    () => (
      <PageInfo
        columns={getPageInfoColumns(pageObject, dispatch, PageActions)}
        isEditingDisabled={isFinalised}
      />
    ),
    [comment, isFinalised]
  );

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'countedTotalQuantity':
        return editCountedQuantity;
      case 'modalControl':
        return rowKey => openModal(MODAL_KEYS.EDIT_STOCKTAKE_BATCH, rowKey);
      case 'remove':
        if (propName === 'onCheckAction') return selectRow;
        return deselectRow;
      case 'mostUsedReasonTitle':
        return rowKey => openModal(MODAL_KEYS.STOCKTAKE_REASON, rowKey);
      default:
        return null;
    }
  });

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.STOCKTAKE_COMMENT_EDIT:
        return value => dispatch(editComment(value, 'Stocktake'));
      case MODAL_KEYS.EDIT_STOCKTAKE_BATCH:
        return () => dispatch(closeModal());
      case MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM:
        return () => runWithLoadingIndicator(() => dispatch(resetStocktake()));
      case MODAL_KEYS.ENFORCE_STOCKTAKE_REASON:
      case MODAL_KEYS.STOCKTAKE_REASON:
        return ({ item }) => dispatch(applyReason(item));
      default:
        return null;
    }
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
          isFinalised={isFinalised}
          dispatch={dispatch}
          getAction={getAction}
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
        dispatch={instantDebouncedDispatch}
        sortAction={sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const PageButtons = useCallback(
    () => (
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
    ),
    [program]
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
          {renderPageInfo()}
          <SearchBar
            onChange={value => debouncedDispatch(filterData(value))}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
          />
        </View>
        <PageButtons />
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
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(closeModal())}
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
