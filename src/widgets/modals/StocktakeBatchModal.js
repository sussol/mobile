/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../../utilities';
import { usePageReducer } from '../../hooks';
import { getItemLayout } from '../../pages/dataTableUtilities';

import { GenericChoiceList } from '../modalChildren/GenericChoiceList';
import { PageInfo, DataTablePageView, PageButton } from '..';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../DataTable';

import globalStyles from '../../globalStyles';

import { UIDatabase } from '../../database';
import ModalContainer from './ModalContainer';
import { buttonStrings } from '../../localization/index';

import { selectUsingPayments } from '../../selectors/modules';

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
 * @prop {Object} stocktakeItem The realm transaction object for this invoice.
 * @prop {Object} page the current routeName for this modal.
 *
 */
export const StocktakeBatchModalComponent = ({ stocktakeItem, page }) => {
  const initialState = {
    page,
    pageObject: stocktakeItem,
  };

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
    columns,
    getPageInfoColumns,
  } = state;

  const { stocktake = {} } = stocktakeItem;
  const { isFinalised = false } = stocktake;
  const { difference = 0 } = modalValue || {};

  const reasonsSelection =
    difference > 0
      ? UIDatabase.objects('PositiveAdjustmentReason')
      : UIDatabase.objects('NegativeAdjustmentReason');

  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onApplyReason = ({ item }) => dispatch(PageActions.applyReason(item));
  const onAddBatch = () => dispatch(PageActions.addStocktakeBatch());
  const onEditBatch = (value, rowKey, columnKey) =>
    dispatch(PageActions.editStocktakeBatchName(value, rowKey, columnKey));
  const onEditReason = rowKey =>
    dispatch(PageActions.openModal(MODAL_KEYS.STOCKTAKE_REASON, rowKey));
  const onEditCountedQuantity = (newValue, rowKey, columnKey) =>
    dispatch(PageActions.editStocktakeBatchCountedQuantity(newValue, rowKey, columnKey));
  const onEditDate = (date, rowKey, columnKey) =>
    dispatch(PageActions.editTransactionBatchExpiryDate(date, rowKey, columnKey));
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
        fullScreen={modalKey === MODAL_KEYS.ENFORCE_STOCKTAKE_REASON}
        isVisible={!!modalKey}
        onClose={onCloseModal}
      >
        <GenericChoiceList
          data={reasonsSelection}
          highlightValue={(modalValue && modalValue.reasonTitle) || ''}
          keyToDisplay="title"
          onPress={onApplyReason}
        />
      </ModalContainer>
    </DataTablePageView>
  );
};

StocktakeBatchModalComponent.propTypes = {
  stocktakeItem: PropTypes.object.isRequired,
  page: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  const usingPaymentsModule = selectUsingPayments(state);
  const usingReasons =
    UIDatabase.objects('NegativeAdjustmentReason').length > 0 &&
    UIDatabase.objects('PositiveAdjustmentReason').length > 0;

  if (usingReasons) {
    if (usingPaymentsModule) return { page: 'stocktakeBatchEditModalWithReasonsAndPrices' };
    return { page: 'stocktakeBatchEditModalWithReasons' };
  }

  if (usingPaymentsModule) return { page: 'stocktakeBatchEditModalWithPrices' };
  return { page: 'stocktakeBatchEditModal' };
};

export const StocktakeBatchModal = connect(mapStateToProps)(StocktakeBatchModalComponent);
