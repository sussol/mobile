/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/prop-types */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { MODAL_KEYS } from '../utilities';
import { buttonStrings, modalStrings } from '../localization';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import DataTablePageView from './containers/DataTablePageView';

import {
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  closeBasicModal,
  editComment,
  focusNext,
  focusCell,
  sortData,
  refreshData,
  deleteItemsById,
  editCountedTotalQuantity,
  openStocktakeBatchModal,
  closeStocktakeBatchModal,
} from './dataTableUtilities/actions';

import { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import usePageReducer from '../hooks/usePageReducer';
import { gotoStocktakeManagePage } from '../navigation/actions';

const keyExtractor = item => item.id;

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
export const StocktakeEditPage = ({ stocktake, routeName, dispatch: reduxDispatch }) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    pageObject: stocktake,
    backingData: stocktake.items,
    data: stocktake.items.sorted('item.name').slice(),
    currentStocktakeItem: null,
    keyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
  });

  const { STOCKTAKE_COMMENT_EDIT, EDIT_STOCKTAKE_BATCH } = MODAL_KEYS;
  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    pageInfo,
    pageObject,
    hasSelection,
    backingData,
    currentStocktakeItem,
  } = state;

  const { isFinalised, comment, program } = pageObject;

  // Transaction is impure - finalization logic prunes items, deleting them from the transaction.
  // Since this does not manipulate the state through the reducer, state is not updated (in
  // particular `data`) so a manual syncing of `backingData` and `data` needs to occur.
  if (isFinalised && data.length !== backingData.length) dispatch(refreshData());

  const renderPageInfo = useCallback(
    () => <PageInfo columns={pageInfo(pageObject, dispatch)} isEditingDisabled={isFinalised} />,
    [comment, isFinalised]
  );

  const getItemLayout = useCallback((item, index) => {
    const { height } = newDataTableStyles.row;
    return {
      length: height,
      offset: height * index,
      index,
    };
  }, []);

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'countedTotalQuantity':
        return editCountedTotalQuantity;
      case 'modalControl':
        return openStocktakeBatchModal;
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
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={() => dispatch(deselectAll())}
        onConfirm={() => dispatch(deleteItemsById('Requisition'))}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(closeBasicModal())}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={pageObject[modalKey]}
        modalObject={currentStocktakeItem}
      />
    </DataTablePageView>
  );
};

StocktakeEditPage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
};

console.disableYellowBox = true;
