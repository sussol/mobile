/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { MODALS } from '../constants';

import { getColumns, recordKeyExtractor, getItemLayout } from '../../pages/dataTableUtilities';

import { DataTable, DataTableRow, DataTableHeaderRow } from '../DataTable';
import { FlexRow } from '../FlexRow';

import { selectSortedPatientHistory } from '../../selectors/patient';
import { PatientActions } from '../../actions/PatientActions';

import { WHITE, APP_FONT_FAMILY } from '../../globalStyles';
import { dispensingStrings } from '../../localization';

const PatientHistory = ({ sortKey, onSortColumn, isAscending, data }) => {
  const columns = React.useMemo(() => getColumns(MODALS.PATIENT_HISTORY), []);

  const renderHeader = React.useCallback(
    () => (
      <DataTableHeaderRow
        columns={getColumns(MODALS.PATIENT_HISTORY)}
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
      {data.length ? (
        <DataTable
          renderRow={renderRow}
          data={data}
          renderHeader={renderHeader}
          keyExtractor={recordKeyExtractor}
          getItemLayout={getItemLayout}
          columns={getColumns(MODALS.PATIENT_HISTORY)}
        />
      ) : (
        <FlexRow alignItems="center" justifyContent="center" flex={1}>
          <Text style={localStyles.placeholder}>
            {dispensingStrings.no_history_for_this_patient}
          </Text>
        </FlexRow>
      )}
    </View>
  );
};

const mapStateToProps = state => {
  const { patient } = state;
  const { isAscending, sortKey } = patient;
  const data = selectSortedPatientHistory(state);

  return { isAscending, sortKey, data };
};

const mapDispatchToProps = dispatch => ({
  onSortColumn: sortKey => dispatch(PatientActions.sortPatientHistory(sortKey)),
});

export const PatientHistoryModal = connect(mapStateToProps, mapDispatchToProps)(PatientHistory);

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
  placeholder: { fontFamily: APP_FONT_FAMILY, fontSize: 20 },
};

PatientHistory.propTypes = {
  sortKey: PropTypes.string.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  isAscending: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
};
