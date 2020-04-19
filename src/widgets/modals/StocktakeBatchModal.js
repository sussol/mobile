/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect, batch } from 'react-redux';

import { ROUTES } from '../../navigation/constants';
import { MODALS } from '../constants';

import { MODAL_KEYS, getModalTitle } from '../../utilities';
import { usePageReducer } from '../../hooks';
import { getItemLayout } from '../../pages/dataTableUtilities';
import { COLUMN_KEYS } from '../../pages/dataTableUtilities/constants';

import { GenericChoiceList } from '../modalChildren/GenericChoiceList';
import { PageInfo, DataTablePageView, PageButton } from '..';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../DataTable';

import globalStyles from '../../globalStyles';

import { UIDatabase } from '../../database';
import { ModalContainer } from './ModalContainer';
import { buttonStrings } from '../../localization';

import { selectUsingPayments, selectUsingHideSnapshotColumn } from '../../selectors/modules';
import { AutocompleteSelector } from '../modalChildren';

const {
  STOCKTAKE_BATCH_EDIT,
  STOCKTAKE_BATCH_EDIT_WITH_REASONS,
  STOCKTAKE_BATCH_EDIT_WITH_PRICES,
  STOCKTAKE_BATCH_EDIT_WITH_REASONS_AND_PRICES,
} = MODALS;

/**
 * Renders a stateful modal with a stocktake item and it's batches loaded
 * for editing.
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
 * @prop {Object} stocktakeItem The realm transsingHaction object for this invoice.
 * @prop {Object} page the current routeName for this modal.
 *
 */
export const StocktakeBatchModalComponent = ({
  stocktakeItem,
  usingPayments,
  usingReasons,
  usingHideSnapshotColumn,
  dispatch: reduxDispatch,
}) => {
  const initialState = useMemo(() => {
    const pageObject = stocktakeItem;
    if (usingReasons && usingPayments) {
      return { page: STOCKTAKE_BATCH_EDIT_WITH_REASONS_AND_PRICES, pageObject };
    }
    if (usingReasons) return { page: STOCKTAKE_BATCH_EDIT_WITH_REASONS, pageObject };
    if (usingPayments) return { page: STOCKTAKE_BATCH_EDIT_WITH_PRICES, pageObject };
    return { page: STOCKTAKE_BATCH_EDIT, pageObject };
  }, [stocktakeItem, usingPayments, usingReasons]);

  if (usingReasons) {
    initialState.page += 'WithReasons';
    if (usingPayments) initialState.page += 'AndPrices';
  } else if (usingPayments) initialState.page += 'WithPrices';

  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(initialState);

  const {
    pageObject,
    data,
    dataState,
    sortKey,
    isAscending,
    modalKey,
    modalValue,
    keyExtractor,
    PageActions,
    columns: pageColumns,
    getPageInfoColumns,
    suppliers,
  } = state;

  const columns = usingHideSnapshotColumn
    ? pageColumns.filter(({ key }) => key !== COLUMN_KEYS.SNAPSHOT_TOTAL_QUANTITY)
    : pageColumns;

  const { stocktake = {} } = stocktakeItem;
  const { isFinalised = false } = stocktake;
  const { difference = 0 } = modalValue || {};

  const reasonsSelection =
    difference > 0
      ? UIDatabase.objects('PositiveAdjustmentReason')
      : UIDatabase.objects('NegativeAdjustmentReason');

  const editStocktakeBatchCountedQuantity = usingReasons
    ? PageActions.editStocktakeBatchCountedQuantityWithReason
    : PageActions.editStocktakeBatchCountedQuantity;

  const onEditSupplier = value => dispatch(PageActions.editBatchSupplier(value, modalValue));
  const onSelectSupplier = rowKey =>
    dispatch(PageActions.openModal('selectItemBatchSupplier', rowKey));
  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onApplyReason = ({ item }) => dispatch(PageActions.applyReason(item));
  const onAddBatch = () => dispatch(PageActions.addStocktakeBatch());
  const onEditBatch = (value, rowKey, columnKey) =>
    dispatch(PageActions.editStocktakeBatchName(value, rowKey, columnKey));
  const onEditReason = rowKey =>
    batch(() => {
      dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_REASON, rowKey));
      reduxDispatch(PageActions.refreshRow(stocktakeItem.id, ROUTES.STOCKTAKE_EDITOR));
    });
  const onEditCountedQuantity = (newValue, rowKey, columnKey) =>
    batch(() => {
      dispatch(editStocktakeBatchCountedQuantity(newValue, rowKey, columnKey));
      reduxDispatch(PageActions.refreshRow(stocktakeItem.id, ROUTES.STOCKTAKE_EDITOR));
    });
  const onEditDate = (date, rowKey, columnKey) =>
    dispatch(PageActions.editStocktakeBatchExpiryDate(date, rowKey, columnKey));
  const onEditSellPrice = (newValue, rowKey) =>
    dispatch(PageActions.editSellPrice(newValue, rowKey));

  const toggles = useCallback(getPageInfoColumns(pageObject, dispatch, PageActions), []);

  const getCallback = useCallback(colKey => {
    switch (colKey) {
      case 'countedTotalQuantity':
        return onEditCountedQuantity;
      case 'batch':
        return onEditBatch;
      case 'expiryDate':
        return onEditDate;
      case 'reasonTitle':
        return onEditReason;
      case 'sellPriceString':
        return onEditSellPrice;
      case 'otherPartyName':
        return onSelectSupplier;
      default:
        return null;
    }
  }, []);

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
          isFinalised={isFinalised}
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
          <PageInfo columns={toggles} />
        </View>
        <View style={pageTopRightSectionContainer}>
          <PageButton
            text={buttonStrings.add_batch}
            onPress={onAddBatch}
            isDisabled={isFinalised}
          />
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
        windowSize={1}
        initialNumToRender={0}
      />
      <ModalContainer
        fullScreen={false}
        isVisible={!!modalKey}
        onClose={onCloseModal}
        title={getModalTitle(modalKey)}
      >
        {modalKey === MODAL_KEYS.SELECT_ITEM_BATCH_SUPPLIER ? (
          <AutocompleteSelector
            options={suppliers}
            onSelect={onEditSupplier}
            sortKeyString="name"
            queryString="name contains[c] $0"
            renderRightText={({ code }) => code}
          />
        ) : (
          <GenericChoiceList
            data={reasonsSelection}
            highlightValue={(modalValue && modalValue.reasonTitle) || ''}
            keyToDisplay="title"
            onPress={onApplyReason}
          />
        )}
      </ModalContainer>
    </DataTablePageView>
  );
};

StocktakeBatchModalComponent.propTypes = {
  stocktakeItem: PropTypes.object.isRequired,
  usingPayments: PropTypes.bool.isRequired,
  usingReasons: PropTypes.bool.isRequired,
  usingHideSnapshotColumn: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const usingPayments = selectUsingPayments(state);
  const usingReasons =
    UIDatabase.objects('NegativeAdjustmentReason').length > 0 &&
    UIDatabase.objects('PositiveAdjustmentReason').length > 0;
  const usingHideSnapshotColumn = selectUsingHideSnapshotColumn(state);
  return { usingPayments, usingReasons, usingHideSnapshotColumn };
};

export const StocktakeBatchModal = connect(mapStateToProps)(StocktakeBatchModalComponent);
