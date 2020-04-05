/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../utilities';
import { getItemLayout, getPageDispatchers, getColumns } from './dataTableUtilities';

import { DataTablePageModal } from '../widgets/modals';
import { BottomConfirmModal } from '../widgets/bottomModals';
import { PageButton, PageInfo, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings, generalStrings } from '../localization';
import globalStyles from '../globalStyles';

import { ROUTES } from '../navigation/constants';
import { SupplierCreditActions } from '../actions/SupplierCreditActions';

export const SupplierInvoice = ({
  refund,
  pageObject,
  data,
  dispatch,
  dataState,
  keyExtractor,
  sortKey,
  isAscending,
  modalKey,
  modalValue,
  hasSelection,
  searchTerm,
  columns,
  getPageInfoColumns,
  onSelectNewItem,
  onEditComment,
  onEditTheirRef,
  onFilterData,
  onDeleteBatches,
  onDeselectAll,
  onCloseModal,
  onCheck,
  onUncheck,
  onSortColumn,
  onEditTotalQuantity,
  onEditDate,
  onAddTransactionBatch,
  route,
  onEditSellPrice,
  onEditTransactionBatchName,
  isSupplierInvoice,
  onSelectLocation,
  onApplyTransactionBatchLocation,
  onSelectVvmStatus,
  onApplyTransactionBatchVvmStatus,
}) => {
  const { isFinalised, comment, theirRef } = pageObject;

  const pageInfoColumns = useCallback(getPageInfoColumns(pageObject, dispatch, route), [
    comment,
    theirRef,
    isFinalised,
  ]);

  const getCallback = (columnKey, propName) => {
    switch (columnKey) {
      case 'totalQuantity':
        return onEditTotalQuantity;
      case 'expiryDate':
        return onEditDate;
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      case 'sellPriceString':
        return onEditSellPrice;
      case 'batch':
        return onEditTransactionBatchName;
      case 'currentLocationName':
        return onSelectLocation;
      case 'currentVvmStatusName':
        return onSelectVvmStatus;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddTransactionBatch;
      case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
        return onEditComment;
      case MODAL_KEYS.THEIR_REF_EDIT:
        return onEditTheirRef;
      case MODAL_KEYS.SELECT_LOCATION:
        return onApplyTransactionBatchLocation;
      case MODAL_KEYS.SELECT_VVM_STATUS:
        return onApplyTransactionBatchVvmStatus;
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
            placeholder={`${generalStrings.search_by} ${generalStrings.item_name}`}
          />
        </View>
        <View style={pageTopRightSectionContainer}>
          {(!isFinalised && isSupplierInvoice) || (isFinalised && !isSupplierInvoice) ? (
            <PageButton
              text={buttonStrings.new_item}
              onPress={onSelectNewItem}
              isDisabled={isFinalised}
            />
          ) : (
            <PageButton text={buttonStrings.new_supplier_credit} onPress={refund} />
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
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={onDeselectAll}
        onConfirm={onDeleteBatches}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { route } = ownProps;
  const { params } = route ?? {};
  const { pageObject } = params;

  return {
    ...getPageDispatchers(dispatch, 'Transaction', ROUTES.SUPPLIER_INVOICE),
    refund: () => dispatch(SupplierCreditActions.createFromInvoice(pageObject)),
  };
};

const mapStateToProps = state => {
  const { pages, modules } = state;
  const { supplierInvoice } = pages;
  const { usingPayments } = modules;

  const { pageObject } = supplierInvoice ?? {};

  const { isSupplierInvoice } = pageObject ?? {};
  const columnsKey = usingPayments ? 'supplierInvoiceWithPrices' : 'supplierInvoice';
  const columns = getColumns(columnsKey);

  return { ...supplierInvoice, isSupplierInvoice, columns };
};

export const SupplierInvoicePage = connect(mapStateToProps, mapDispatchToProps)(SupplierInvoice);

SupplierInvoice.defaultProps = {
  modalValue: null,
};

SupplierInvoice.propTypes = {
  pageObject: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  modalKey: PropTypes.string.isRequired,
  modalValue: PropTypes.any,
  hasSelection: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  getPageInfoColumns: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  onSelectNewItem: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onEditTheirRef: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onDeleteBatches: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onEditTotalQuantity: PropTypes.func.isRequired,
  onEditDate: PropTypes.func.isRequired,
  onAddTransactionBatch: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  onEditSellPrice: PropTypes.func.isRequired,
  refund: PropTypes.func.isRequired,
  onEditTransactionBatchName: PropTypes.func.isRequired,
  isSupplierInvoice: PropTypes.bool.isRequired,
  onSelectLocation: PropTypes.func.isRequired,
  onApplyTransactionBatchLocation: PropTypes.func.isRequired,
  onSelectVvmStatus: PropTypes.func.isRequired,
  onApplyTransactionBatchVvmStatus: PropTypes.func.isRequired,
};
