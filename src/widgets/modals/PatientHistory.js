/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import { PREFERENCE_KEYS } from '../../database/utilities/preferenceConstants';
import { MODALS } from '../constants';

import { UIDatabase } from '../../database';
import { getColumns } from '../../pages/dataTableUtilities';
import { useLocalAndRemotePatientHistory } from '../../hooks/useLocalAndRemoteHistory';

import { PageButton } from '..';
import { FlexView } from '../FlexView';

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

const SearchOnlineButton = ({ loading, search }) => {
  const canView = UIDatabase.getPreference(PREFERENCE_KEYS.CAN_VIEW_ALL_PATIENTS_HISTORY);
  if (!canView) return null;

  const onPress = () => search();

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
  search: PropTypes.func.isRequired,
};

export const PatientHistoryModal = ({ isVaccine, patientId, patientHistory, sortKey }) => {
  const columns = React.useMemo(
    () => getColumns(isVaccine ? MODALS.VACCINE_HISTORY : MODALS.PATIENT_HISTORY),
    []
  );
  // const { id: patientId } = patient;
  const [
    { data, loading, searchedWithNoResults, error },
    fetchOnline,
  ] = useLocalAndRemotePatientHistory({
    isVaccine,
    patientId,
    initialValue: patientHistory,
    sortKey,
  });
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
      <SearchOnlineButton loading={loading} search={fetchOnline} />
    </View>
  );
};

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
  placeholder: { fontFamily: APP_FONT_FAMILY, fontSize: 20 },
};

PatientHistoryModal.defaultProps = {
  isVaccine: false,
};

PatientHistoryModal.propTypes = {
  isVaccine: PropTypes.bool,
  patientId: PropTypes.string.isRequired,
  patientHistory: PropTypes.array.isRequired,
  sortKey: PropTypes.string.isRequired,
};
