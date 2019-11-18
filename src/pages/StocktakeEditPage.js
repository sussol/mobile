/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { MODAL_KEYS } from '../utilities';
import { usePageReducer } from '../hooks/usePageReducer';
import { getItemLayout } from './dataTableUtilities';

import { DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, DataTablePageView, SearchBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { gotoStocktakeManagePage } from '../navigation/actions';

import { buttonStrings } from '../localization';
import globalStyles from '../globalStyles';
import { useRecordListener, useNavigationFocus } from '../hooks/index';

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
 * @prop {Func}   runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 * @prop {Func}   dispatch  Redux store dispatch function.
 * @prop {Object} navigation App-wide stack navigator reference
 *
 */
export const StocktakeEditPage = ({
  runWithLoadingIndicator,
  stocktake,
  routeName,
  dispatch: reduxDispatch,
  navigation,
}) => {
  const initialState = { page: routeName, pageObject: stocktake };
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(initialState);

  const {
    pageObject,
    data,
    dataState,
    searchTerm,
    sortKey,
    isAscending,
    modalKey,
    modalValue,
    keyExtractor,
    PageActions,
    columns,
    getPageInfoColumns,
  } = state;

  const { isFinalised, comment, program, name } = pageObject;

  // Listen to the stocktake become the top of the stack or being finalised,
  // as these events are side-effects. Refreshing makes the state consistent again.
  const refreshCallback = () => dispatch(PageActions.refreshData());
  useRecordListener(refreshCallback, pageObject, 'Stocktake');
  useNavigationFocus(refreshCallback, navigation);

  // If the Stocktake is outdated, force a reset of the stocktake on mount.
  useEffect(() => {
    if (stocktake.isOutdated) dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM));
  }, []);

  const onEditName = value => dispatch(PageActions.editPageObjectName(value, 'Stocktake'));
  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onEditBatch = rowKey => PageActions.openModal(MODAL_KEYS.EDIT_STOCKTAKE_BATCH, rowKey);
  const onEditReason = rowKey => PageActions.openModal(MODAL_KEYS.STOCKTAKE_REASON, rowKey);
  const onEditComment = value => dispatch(PageActions.editComment(value, 'Stocktake'));
  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onApplyReason = ({ item }) => dispatch(PageActions.applyReason(item));
  const onConfirmBatchEdit = () => dispatch(PageActions.closeAndRefresh());
  const onManageStocktake = () => reduxDispatch(gotoStocktakeManagePage(name, stocktake));
  const onResetStocktake = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.resetStocktake()));

  const pageInfoColumns = useCallback(getPageInfoColumns(pageObject, dispatch, PageActions), [
    comment,
    isFinalised,
    name,
  ]);

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'countedTotalQuantity':
        return PageActions.editCountedQuantity;
      case 'batch':
        return onEditBatch;
      case 'remove':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
      case 'reasonTitle':
        return onEditReason;
      default:
        return null;
    }
  }, []);

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.STOCKTAKE_NAME_EDIT:
        return onEditName;
      case MODAL_KEYS.STOCKTAKE_COMMENT_EDIT:
        return onEditComment;
      case MODAL_KEYS.EDIT_STOCKTAKE_BATCH:
        return onConfirmBatchEdit;
      case MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM:
        return onResetStocktake;
      case MODAL_KEYS.ENFORCE_STOCKTAKE_REASON:
      case MODAL_KEYS.STOCKTAKE_REASON:
        return onApplyReason;
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
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending]
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
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
          {!program && (
            <PageButton
              text={buttonStrings.manage_stocktake}
              onPress={onManageStocktake}
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
        columns={columns}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={modalKey === MODAL_KEYS.EDIT_STOCKTAKE_BATCH ? onConfirmBatchEdit : onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />
    </DataTablePageView>
  );
};

StocktakeEditPage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  stocktake: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};
