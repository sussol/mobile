/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../utilities';
import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';

import { DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, DataTablePageView, SearchBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, generalStrings, tableStrings } from '../localization';
import globalStyles from '../globalStyles';
import { useRecordListener, useNavigationFocus } from '../hooks/index';

import { UIDatabase } from '../database/index';
import { ROUTES } from '../navigation/constants';

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
 */
export const StocktakeEdit = ({
  dispatch,
  navigation,
  pageObject,
  data,
  dataState,
  searchTerm,
  sortKey,
  isAscending,
  modalKey,
  modalValue,
  keyExtractor,
  columns,
  getPageInfoColumns,
  onEditName,
  onEditBatch,
  onFilterData,
  onEditComment,
  onEditReason,
  onCloseModal,
  onApplyReason,
  onConfirmBatchEdit,
  onManageStocktake,
  onCheck,
  onUncheck,
  onEditCountedQuantity,
  onResetStocktake,
  onSortColumn,
  refreshData,
  onOpenOutdatedItemModal,
  route,
}) => {
  const { isFinalised, comment, program, name } = pageObject;

  // Listen to the stocktake become the top of the stack or being finalised,
  // as these events are side-effects. Refreshing makes the state consistent again.
  useRecordListener(refreshData, pageObject, 'Stocktake');
  useNavigationFocus(navigation, refreshData);

  // If the Stocktake is outdated, force a reset of the stocktake on mount.
  useEffect(() => {
    if (pageObject.isOutdated) onOpenOutdatedItemModal();
  }, []);

  const pageInfoColumns = useMemo(() => getPageInfoColumns(pageObject, dispatch, route), [
    comment,
    isFinalised,
    name,
  ]);

  const getCallback = (colKey, propName) => {
    switch (colKey) {
      case 'countedTotalQuantity':
        return onEditCountedQuantity;
      case 'batch':
        return onEditBatch;
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      case 'reasonTitle':
        return onEditReason;
      default:
        return null;
    }
  };

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
          getCallback={getCallback}
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
        onPress={onSortColumn}
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
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.searchBar} ${tableStrings.name}`}
          />
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

const mapDispatchToProps = (dispatch, ownProps) => {
  const hasNegativeAdjustmentReasons = UIDatabase.objects('NegativeAdjustmentReason').length > 0;
  const hasPositiveAdjustmentReasons = UIDatabase.objects('PositiveAdjustmentReason').length > 0;
  const usesReasons = hasNegativeAdjustmentReasons && hasPositiveAdjustmentReasons;
  const editQuantity = usesReasons
    ? PageActions.editCountedQuantityWithReason
    : PageActions.editCountedQuantity;

  return {
    ...getPageDispatchers(dispatch, ownProps, 'Stocktake', ROUTES.STOCKTAKE_EDITOR),
    onEditCountedQuantity: (newValue, rowKey) =>
      dispatch(editQuantity(newValue, rowKey, ROUTES.STOCKTAKE_EDITOR)),
  };
};

const mapStateToProps = state => {
  const { pages } = state;
  const { stocktakeEditor } = pages;
  return stocktakeEditor;
};

export const StocktakeEditPage = connect(mapStateToProps, mapDispatchToProps)(StocktakeEdit);

StocktakeEdit.defaultProps = {
  modalValue: null,
};

StocktakeEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  pageObject: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  modalKey: PropTypes.string.isRequired,
  modalValue: PropTypes.any,
  keyExtractor: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  getPageInfoColumns: PropTypes.func.isRequired,
  onEditName: PropTypes.func.isRequired,
  onEditBatch: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onEditReason: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onApplyReason: PropTypes.func.isRequired,
  onConfirmBatchEdit: PropTypes.func.isRequired,
  onManageStocktake: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onEditCountedQuantity: PropTypes.func.isRequired,
  onResetStocktake: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  onOpenOutdatedItemModal: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
};
