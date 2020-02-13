/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import {
  selectCashRegisterInfoColumns,
  selectCashRegisterState,
  selectFilteredTransactions,
} from '../selectors/cashRegister';

import { getItemLayout, getPageDispatchers } from './dataTableUtilities';

import { DropDown, DataTablePageView, PageButton, SearchBar } from '../widgets';
import { ToggleBar } from '../widgets/ToggleBar';
import { PageInfo } from '../widgets/PageInfo';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageModal } from '../widgets/modals';

import { ROUTES } from '../navigation/constants';
import { buttonStrings, generalStrings, dispensingStrings } from '../localization';
import globalStyles from '../globalStyles';

import { updatePaymentType } from './dataTableUtilities/actions/pageActions';

export const CashRegister = ({
  dispatch,
  data,
  dataState,
  searchTerm,
  sortKey,
  isAscending,
  keyExtractor,
  modalKey,
  columns,
  pageInfoColumns,
  transactionType,
  onFilterData,
  onSortColumn,
  onNewCashTransaction,
  onCloseModal,
  onAddCashTransaction,
  onToggleTransactionType,
  paymentTypes,
  currentPaymentType,
  onUpdatePaymentType,
}) => {
  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const { isFinalised } = item;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          columns={columns}
          isFinalised={isFinalised}
          getCallback={() => ({})}
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
    [isAscending, sortKey]
  );

  const AddNewTransactionButton = () => (
    <PageButton
      style={globalStyles.wideButton}
      text={buttonStrings.new_transaction}
      onPress={onNewCashTransaction}
    />
  );

  const toggles = useMemo(
    () => [
      {
        text: dispensingStrings.payments,
        onPress: onToggleTransactionType,
        isOn: transactionType === 'payment',
      },
      {
        text: dispensingStrings.receipts,
        onPress: onToggleTransactionType,
        isOn: transactionType === 'receipt',
      },
    ],
    [transactionType]
  );

  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
    verticalContainer,
  } = globalStyles;

  const onSelectPaymentType = React.useCallback(
    (_, index) => {
      onUpdatePaymentType(paymentTypes[index]);
    },
    [paymentTypes, onUpdatePaymentType]
  );

  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <DropDown
            style={{ height: 25 }}
            values={paymentTypes.map(({ description }) => description)}
            selectedValue={currentPaymentType.description}
            onValueChange={onSelectPaymentType}
          />
          <PageInfo columns={pageInfoColumns} isEditingDisabled={true} />
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.search_by} ${generalStrings.name}`}
          />
        </View>
        <View style={pageTopRightSectionContainer}>
          <View style={verticalContainer}>
            <ToggleBar toggles={toggles} />
            <AddNewTransactionButton />
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
      <DataTablePageModal
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={onAddCashTransaction}
        dispatch={dispatch}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const onUpdatePaymentType = paymentType =>
    dispatch(updatePaymentType(paymentType, ROUTES.CASH_REGISTER));

  return {
    ...getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.CASH_REGISTER),
    onUpdatePaymentType,
  };
};

const mapStateToProps = state => {
  const pageState = selectCashRegisterState(state);
  const data = selectFilteredTransactions(state);
  const pageInfoColumns = selectCashRegisterInfoColumns(state);
  return { ...pageState, data, pageInfoColumns };
};

export const CashRegisterPage = connect(mapStateToProps, mapDispatchToProps)(CashRegister);

CashRegister.defaultProps = {};

CashRegister.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  modalKey: PropTypes.string.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  pageInfoColumns: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  transactionType: PropTypes.string.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onToggleTransactionType: PropTypes.func.isRequired,
  onNewCashTransaction: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onAddCashTransaction: PropTypes.func.isRequired,
  paymentTypes: PropTypes.object.isRequired,
  currentPaymentType: PropTypes.object.isRequired,
  onUpdatePaymentType: PropTypes.func.isRequired,
};
