/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { selectPageState, selectBalance, selectTransactionData } from '../selectors/cashRegister';

import { getItemLayout, getPageDispatchers } from './dataTableUtilities';

import { DataTablePageView, PageButton } from '../widgets';
import { SimpleLabel } from '../widgets/SimpleLabel';
import { ToggleBar } from '../widgets/ToggleBar';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageModal } from '../widgets/modals';

import { ROUTES } from '../navigation/constants';
import { buttonStrings, pageInfoStrings } from '../localization';
import globalStyles from '../globalStyles';

export const CashRegister = ({
  dispatch,
  data,
  dataState,
  sortKey,
  keyExtractor,
  modalKey,
  columns,
  currentBalance,
  transactionType,
  onNewCashTransaction,
  onCloseModal,
  onAddCashTransaction,
  onToggleTransactionType,
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
      <DataTableHeaderRow columns={columns} onPress={null} isAscending={true} sortKey={sortKey} />
    ),
    [sortKey]
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
      { text: 'Payments', onPress: onToggleTransactionType, isOn: transactionType === 'payment' },
      { text: 'Receipts', onPress: onToggleTransactionType, isOn: transactionType === 'receipt' },
    ],
    [transactionType]
  );

  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
    verticalContainer,
  } = globalStyles;

  const topLeftContainerStyle = useMemo(() => ({ ...pageTopLeftSectionContainer, flex: 1 }));
  const topRightContainerStyle = useMemo(() => ({ ...pageTopRightSectionContainer, flex: 4 }));

  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={topLeftContainerStyle}>
          <SimpleLabel
            label={pageInfoStrings.current_balance}
            text={currentBalance}
            textAlign="left"
          />
        </View>
        <View style={topRightContainerStyle}>
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.CASH_REGISTER),
});

const mapStateToProps = state => {
  const pageState = selectPageState(state);
  const data = selectTransactionData(state);
  const currentBalance = selectBalance(state);

  return { ...pageState, data, currentBalance };
};

export const CashRegisterPage = connect(mapStateToProps, mapDispatchToProps)(CashRegister);

CashRegister.defaultProps = {};

CashRegister.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortKey: PropTypes.string.isRequired,
  modalKey: PropTypes.string.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  currentBalance: PropTypes.string.isRequired,
  transactionType: PropTypes.string.isRequired,
  onToggleTransactionType: PropTypes.func.isRequired,
  onNewCashTransaction: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onAddCashTransaction: PropTypes.func.isRequired,
};
