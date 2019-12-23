/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  getColumns,
  recordKeyExtractor,
  getItemLayout,
} from '../../pages/dataTableUtilities/index';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../DataTable/index';
import { selectSortedPatientHistory } from '../../selectors/patient';
import { PatientActions } from '../../actions/PatientActions';

import { WHITE } from '../../globalStyles';

const PatientHistory = ({ sortKey, onSortColumn, isAscending, data }) => {
  const columns = React.useMemo(() => getColumns('patientHistory'), []);

  const renderHeader = React.useCallback(
    () => (
      <DataTableHeaderRow
        columns={getColumns('patientHistory')}
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
        columns={getColumns('patientHistory')}
      />
    </View>
  );
};

const mapStateToProps = state => {
  const { patient } = state;
  return { ...patient, data: selectSortedPatientHistory(state) };
};

const mapDispatchToProps = dispatch => ({
  onSortColumn: sortKey => dispatch(PatientActions.sortPatientHistory(sortKey)),
});

export const PatientHistoryModal = connect(mapStateToProps, mapDispatchToProps)(PatientHistory);

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
};

PatientHistory.propTypes = {
  sortKey: PropTypes.string.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  isAscending: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
};
