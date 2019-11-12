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
import { useRecordListener } from '../hooks';
import { getItemLayout, getPageDispatchers } from './dataTableUtilities';
import { ROUTES } from '../navigation/constants';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';
import { PageActions } from './dataTableUtilities/actions/index';

export const Prescription = ({
  dispatch,
  data,
  dataState,
  pageObject,
  sortBy,
  isAscending,
  modalKey,
  hasSelection,
  keyExtractor,
  searchTerm,
  modalValue,
  columns,
  getPageInfoColumns,
  refreshData,
  onSelectNewItem,
  onEditComment,
  onFilterData,
  onDeleteItems,
  onDeselectAll,
  onCloseModal,
  onCheck,
  onUncheck,
  onSortColumn,
  onEditTotalQuantity,
  onAddTransactionItem,
}) => {
  const { isFinalised, comment, prescriber } = pageObject;

  // Listen for this invoice being finalised which will prune items and cause side effects
  // outside of the reducer. Reconcile differences when triggered.
  useRecordListener(refreshData, pageObject, 'Transaction');

  const pageInfoColumns = useCallback(
    getPageInfoColumns(pageObject, dispatch, ROUTES.PRESCRIPTION),
    [comment, prescriber, isFinalised]
  );

  const getCallback = (colKey, propName) => {
    switch (colKey) {
      case 'totalQuantity':
        return onEditTotalQuantity;
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddTransactionItem;
      case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
        return onEditComment;
      case MODAL_KEYS.SELECT_PRESCRIBER:
        return value => dispatch(PageActions.editPrescriber(value, ROUTES.PRESCRIPTION));
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
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const { verticalContainer, topButton } = globalStyles;
  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
    searchBar,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar onChangeText={onFilterData} style={searchBar} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
          <View style={verticalContainer}>
            <PageButton
              style={{ ...topButton, marginLeft: 0 }}
              text={buttonStrings.new_item}
              onPress={onSelectNewItem}
              isDisabled={isFinalised}
            />
          </View>
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
        onConfirm={onDeleteItems}
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

const mapDispatchToProps = (dispatch, ownProps) =>
  getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.PRESCRIPTION);

const mapStateToProps = state => {
  const { pages } = state;
  const { prescription } = pages;

  return prescription;
};

export const PrescriptionPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Prescription);

Prescription.defaultProps = {
  modalValue: null,
};

Prescription.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  pageObject: PropTypes.object.isRequired,
  sortBy: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  modalKey: PropTypes.string.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  modalValue: PropTypes.any,
  columns: PropTypes.array.isRequired,
  getPageInfoColumns: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  onSelectNewItem: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onDeleteItems: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onEditTotalQuantity: PropTypes.func.isRequired,
  onAddTransactionItem: PropTypes.func.isRequired,
};
