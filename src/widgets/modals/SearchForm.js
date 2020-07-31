/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { connect, batch } from 'react-redux';
import PropTypes from 'prop-types';
import { getAuthHeader } from 'sussol-utilities';

import { SETTINGS_KEYS } from '../../settings';
import { UIDatabase } from '../../database';

import { useFetch } from '../../hooks/useFetch';

import { FormControl } from '../FormControl';

import { Spinner } from '..';
import { ConfirmForm } from '../modalChildren/ConfirmForm';
import { ModalContainer } from '.';

import { InsuranceActions } from '../../actions/InsuranceActions';
import { PatientActions } from '../../actions/PatientActions';
import { PrescriberActions } from '../../actions/PrescriberActions';

import { recordKeyExtractor } from '../../pages/dataTableUtilities';

import { modalStrings, generalStrings } from '../../localization';

import { APP_FONT_FAMILY, DARK_GREY, ROW_BLUE, WHITE, SUSSOL_ORANGE } from '../../globalStyles';

import {
  getPatientRequestUrl,
  getPrescriberRequestUrl,
  processPatientResponse,
  processPrescriberResponse,
} from '../../sync/lookupApiUtils';

import {
  selectDataSetInUse,
  selectLookupFormConfig,
  selectLookupListConfig,
} from '../../selectors/dispensary';

const { SYNC_URL, SYNC_SITE_NAME, SYNC_SITE_PASSWORD_HASH } = SETTINGS_KEYS;

const SearchListItemColumnComponent = ({ value, type }) => {
  const valueText = type === 'date' ? value?.toDateString() ?? generalStrings.not_available : value;
  return (
    <View style={localStyles.columnContainer}>
      <Text style={localStyles.text}>{valueText}</Text>
    </View>
  );
};

const SearchListItemComponent = ({ item, config, onSelect }) => {
  const columns = config.map(({ key, type }) => {
    const value = item[key];
    return <SearchListItemColumn key={key} value={value} type={type} />;
  });
  return (
    <TouchableOpacity onPress={() => onSelect(item)} style={localStyles.rowContainer}>
      {columns}
    </TouchableOpacity>
  );
};

const SearchListItemColumn = React.memo(SearchListItemColumnComponent);
const SearchListItem = React.memo(SearchListItemComponent);

export const SearchFormComponent = ({
  isPatient,
  isPrescriber,
  formConfig,
  listConfig,
  selectPatient,
  selectPrescriber,
}) => {
  const syncUrl = UIDatabase.getSetting(SYNC_URL);

  const { fetch, refresh, isLoading, response, error } = useFetch(syncUrl);

  const getAuthorizationHeader = () => {
    const username = UIDatabase.getSetting(SYNC_SITE_NAME);
    const password = UIDatabase.getSetting(SYNC_SITE_PASSWORD_HASH);
    return getAuthHeader(username, password);
  };

  const lookupRecords = useMemo(() => {
    if (isPatient) {
      return async params => {
        fetch(
          getPatientRequestUrl(params),
          { headers: { authorization: getAuthorizationHeader() } },
          { responseHandler: processPatientResponse }
        );
      };
    }
    if (isPrescriber) {
      return async params => {
        fetch(
          getPrescriberRequestUrl(params),
          { headers: { authorization: getAuthorizationHeader() } },
          { responseHandler: processPrescriberResponse }
        );
      };
    }
    return () => null;
  }, [isLoading, isPatient, isPrescriber]);

  const renderRecord = useCallback(
    ({ item }) => <SearchListItem item={item} config={listConfig} onSelect={selectRecord} />,
    [listConfig]
  );

  const selectRecord = useMemo(() => {
    if (isPatient) return patient => selectPatient(patient);
    if (isPrescriber) return prescriber => selectPrescriber(prescriber);
    return () => null;
  }, [isPatient, isPrescriber]);

  const FormView = useCallback(
    () => (
      <FormControl
        inputConfig={formConfig}
        onSave={lookupRecords}
        showCancelButton={false}
        saveButtonText={generalStrings.search}
      />
    ),
    [formConfig, lookupRecords]
  );

  const ListView = useCallback(
    () =>
      isLoading ? (
        <View style={localStyles.spinnerContainer}>
          <Spinner isSpinning={isLoading} color={SUSSOL_ORANGE} />
        </View>
      ) : (
        <FlatList data={response} keyExtractor={recordKeyExtractor} renderItem={renderRecord} />
      ),
    [isLoading, response, renderRecord]
  );

  const ErrorView = useCallback(
    () => (
      <>
        <ModalContainer fullScreen={true} isVisible={!!error}>
          <ConfirmForm
            isOpen={!!error}
            questionText={error?.message}
            onConfirm={refresh}
            confirmText={modalStrings.confirm}
          />
        </ModalContainer>
      </>
    ),
    [error]
  );

  return (
    <View style={localStyles.container}>
      <View style={localStyles.formContainer}>
        <FormView />
      </View>
      <View style={localStyles.verticalSeparator} />
      <View style={localStyles.listContainer}>
        <ListView />
      </View>
      <ErrorView />
    </View>
  );
};

const mapStateToProps = state => {
  const [isPatient, isPrescriber] = selectDataSetInUse(state);
  const formConfig = selectLookupFormConfig(state);
  const listConfig = selectLookupListConfig(state);
  return { isPatient, isPrescriber, formConfig, listConfig };
};

const mapDispatchToProps = dispatch => ({
  selectPatient: patient => {
    dispatch(PatientActions.patientUpdate(patient));
    batch(() => patient.policies.forEach(policy => dispatch(InsuranceActions.update(policy))));
  },
  selectPrescriber: prescriber => dispatch(PrescriberActions.updatePrescriber(prescriber)),
});

export const SearchForm = connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent);

SearchFormComponent.propTypes = {
  isPatient: PropTypes.bool.isRequired,
  isPrescriber: PropTypes.bool.isRequired,
  formConfig: PropTypes.array.isRequired,
  listConfig: PropTypes.array.isRequired,
  selectPatient: PropTypes.func.isRequired,
  selectPrescriber: PropTypes.func.isRequired,
};

SearchListItemComponent.propTypes = {
  item: PropTypes.object.isRequired,
  config: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};

SearchListItemColumnComponent.defaultProps = {
  value: null,
};

SearchListItemColumnComponent.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  type: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    height: '95%',
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'stretch',
  },
  verticalSeparator: {
    width: 10,
    backgroundColor: DARK_GREY,
  },
  listContainer: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  spinnerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.88,
    zIndex: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: WHITE,
    backgroundColor: ROW_BLUE,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  columnContainer: {
    flex: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: WHITE,
  },
  text: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
    marginHorizontal: 10,
    marginVertical: 10,
  },
});
