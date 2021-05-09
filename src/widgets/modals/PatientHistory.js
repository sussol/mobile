/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PREFERENCE_KEYS } from '../../database/utilities/preferenceConstants';
import { MODALS } from '../constants';

import { UIDatabase } from '../../database';
import { getColumns } from '../../pages/dataTableUtilities';
import { useLocalAndRemotePatientHistory } from '../../hooks/useLocalAndRemoteHistory';

import { PageButton } from '..';
import { FlexView } from '../FlexView';

import { PatientActions } from '../../actions/PatientActions';

import { WHITE, APP_FONT_FAMILY, SUSSOL_ORANGE, APP_GENERAL_FONT_SIZE } from '../../globalStyles';
import { dispensingStrings, generalStrings } from '../../localization';
import { SimpleTable } from '../SimpleTable';

const getMessage = (noResults, error) => {
  if (noResults) return dispensingStrings.no_history_for_this_patient;
  if (error) return generalStrings.error_communicating_with_server;
  return '';
};

const EmptyComponent = ({ loading, error, searchedWithNoResults }) => (
  <FlexView flex={1} justifyContent="center" alignItems="center" style={{ marginTop: 20 }}>
    {loading ? (
      <ActivityIndicator color={SUSSOL_ORANGE} size="small" />
    ) : (
      <Text style={{ fontFamily: APP_FONT_FAMILY, fontSize: APP_GENERAL_FONT_SIZE }}>
        {getMessage(searchedWithNoResults, error)}
      </Text>
    )}
  </FlexView>
);

EmptyComponent.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
  searchedWithNoResults: PropTypes.bool.isRequired,
};

const SearchOnlineButton = ({ loading, patient, search }) => {
  const canView = UIDatabase.getPreference(PREFERENCE_KEYS.CAN_VIEW_ALL_PATIENTS_HISTORY);
  if (!canView) return null;

  const onPress = () => search(patient);

  return (
    <PageButton
      text={generalStrings.search_online}
      onPress={onPress}
      style={{ margin: 10, alignSelf: 'center' }}
      isDisabled={loading}
    />
  );
};
SearchOnlineButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  patient: PropTypes.object.isRequired,
  search: PropTypes.func.isRequired,
};

const PatientHistory = ({ patient }) => {
  const columns = React.useMemo(() => getColumns(MODALS.PATIENT_HISTORY), []);
  const [
    { data, loading, searchedWithNoResults, error },
    fetchOnline,
  ] = useLocalAndRemotePatientHistory(patient, []);

  return (
    <View style={localStyles.mainContainer}>
      <SimpleTable
        data={data}
        columns={columns}
        ListEmptyComponent={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <EmptyComponent
            searchedWithNoResults={searchedWithNoResults}
            error={error}
            loading={loading}
          />
        }
      />
      <SearchOnlineButton loading={loading} search={fetchOnline} patient={patient} />
    </View>
  );
};

const mapStateToProps = state => {
  const { patient } = state;
  return { patient };
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
  patient: PropTypes.object.isRequired,
};
