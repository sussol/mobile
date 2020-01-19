/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getColumns, recordKeyExtractor, getItemLayout } from '../../pages/dataTableUtilities';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../DataTable';

import { PatientActions } from '../../actions/PatientActions';

import { WHITE } from '../../globalStyles';
import { UIDatabase } from '../../database/index';

const SupplierRefundComponent = ({ sortKey, onSortColumn, isAscending, data }) => {
  const columns = React.useMemo(() => getColumns('supplierRefund'), []);

  const renderHeader = React.useCallback(
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

  const getCallback = React.useCallback(colKey => {
    switch (colKey) {
      case '':
        return null;
      default:
        return null;
    }
  });

  const renderRow = React.useCallback(
    listItem => {
      const { item, index } = listItem;

      const rowKey = recordKeyExtractor(item);
      return (
        <DataTableRow
          rowData={item}
          rowKey={rowKey}
          columns={columns}
          getCallback={getCallback}
          rowIndex={index}
        />
      );
    },
    [columns]
  );

  return (
    <View style={localStyles.mainContainer}>
      <DataTable
        renderRow={renderRow}
        data={data}
        renderHeader={renderHeader}
        keyExtractor={recordKeyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
    </View>
  );
};

const mapStateToProps = () => {
  const data = UIDatabase.objects('TransactionBatch');
  return { data };
};

const mapDispatchToProps = dispatch => ({
  onSortColumn: sortKey => dispatch(PatientActions.sortPatientHistory(sortKey)),
});

export const SupplierRefund = connect(mapStateToProps, mapDispatchToProps)(SupplierRefundComponent);

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
};

SupplierRefundComponent.propTypes = {
  sortKey: PropTypes.string.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  isAscending: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
};
