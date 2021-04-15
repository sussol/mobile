import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { WHITE } from '../../globalStyles/colors';
import { APP_FONT_FAMILY } from '../../globalStyles/fonts';
import { dispensingStrings } from '../../localization/index';
import getColumns from '../../pages/dataTableUtilities/getColumns';
import { getItemLayout, recordKeyExtractor } from '../../pages/dataTableUtilities/utilities';
import { selectVaccinePatientHistoryHistory } from '../../selectors/Entities/name';
import { MODALS } from '../constants';
import DataTable from '../DataTable/DataTable';
import DataTableHeaderRow from '../DataTable/DataTableHeaderRow';
import DataTableRow from '../DataTable/DataTableRow';
import { FlexRow } from '../FlexRow';

const VaccineHistory = ({ data }) => {
  const columns = useMemo(() => getColumns(MODALS.PATIENT_HISTORY), []);

  const renderHeader = () => (
    <DataTableHeaderRow columns={columns} onPress={() => {}} isAscending={true} sortKey="" />
  );

  const getCallback = () => null;

  const renderRow = listItem => {
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
  };

  return (
    <View style={localStyles.mainContainer}>
      {data.length ? (
        <DataTable
          renderRow={renderRow}
          data={data}
          renderHeader={renderHeader}
          keyExtractor={recordKeyExtractor}
          getItemLayout={getItemLayout}
          columns={columns}
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

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
  placeholder: { fontFamily: APP_FONT_FAMILY, fontSize: 20 },
};

VaccineHistory.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.array.isRequired,
};

const stateToProps = state => {
  const data = selectVaccinePatientHistoryHistory(state);

  return { isAscending: false, sortKey: 'totalQuantity', data };
};

export const PatientVaccineHistory = connect(stateToProps)(VaccineHistory);
