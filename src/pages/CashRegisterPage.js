/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getItemLayout, getPageDispatchers } from './dataTableUtilities';

import { DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { ROUTES } from '../navigation/constants';

export const CashRegister = ({ data, dataState, sortKey, keyExtractor, columns }) => {
  const getCallback = (_colKey, _propName) => null;

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
          onPress={null}
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

  return (
    <DataTablePageView>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.CASH_REGISTER),
});

const mapStateToProps = state => {
  const { pages } = state;
  const { cashRegister } = pages;
  return cashRegister;
};

export const CashRegisterPage = connect(mapStateToProps, mapDispatchToProps)(CashRegister);

CashRegister.defaultProps = {};

CashRegister.propTypes = {
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortKey: PropTypes.string.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
};
