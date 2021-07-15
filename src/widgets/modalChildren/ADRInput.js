/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { JSONForm } from '../JSONForm/JSONForm';
import { UIDatabase } from '../../database/index';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { PageButton } from '../PageButton';
import { SUSSOL_ORANGE, WHITE } from '../../globalStyles/colors';
import globalStyles from '../../globalStyles/index';
import { PatientActions } from '../../actions/PatientActions';
import { selectCurrentPatient } from '../../selectors/patient';
import { useLocalAndRemotePatientHistory } from '../../hooks/useLocalAndRemoteHistory';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import { dispensingStrings } from '../../localization';

const LoadingIndicator = ({ loading }) =>
  loading && (
    <FlexView flex={1} justifyContent="center" alignItems="center" style={{ marginTop: 20 }}>
      <Text style={localStyles.text}>{dispensingStrings.fetching_history}</Text>
      {loading && (
        <ActivityIndicator color={SUSSOL_ORANGE} size="small" style={{ marginTop: 10 }} />
      )}
    </FlexView>
  );
LoadingIndicator.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export const ADRInputComponent = ({ onCancel, onSave, patient, patientHistory }) => {
  const runWithLoadingIndicator = useLoadingIndicator();
  const [{ formData, isValid }, setForm] = useState({ formData: null, isValid: false });
  const patientId = patient?.id;
  const [{ data, loading, searched }, fetchOnline] = useLocalAndRemotePatientHistory({
    isVaccine: true,
    patientId,
    initialValue: patientHistory,
    sortKey: 'itemName',
  });

  useEffect(
    () =>
      runWithLoadingIndicator(() => {
        fetchOnline();
      }),
    [patientId]
  );

  useEffect(() => {
    console.info(`cool. searched: ${searched} loading: ${loading}`, data);
  }, [data]);

  return (
    <>
      {loading || !searched ? (
        <LoadingIndicator loading={loading} />
      ) : (
        <JSONForm
          onChange={(changed, validator) => {
            setForm({ formData: changed.formData, isValid: validator(changed.formData) });
          }}
          surveySchema={UIDatabase.objects('ADRForm')[0]}
        >
          <></>
        </JSONForm>
      )}
      <FlexRow>
        <PageButton
          onPress={onCancel}
          style={localStyles.cancelButton}
          textStyle={localStyles.cancelButtonTextStyle}
          text="CANCEL"
        />
        <PageButton
          isDisabled={!isValid}
          onPress={() => onSave(patient, formData)}
          style={localStyles.saveButton}
          textStyle={localStyles.saveButtonTextStyle}
          text="SAVE"
        />
      </FlexRow>
    </>
  );
};

ADRInputComponent.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  patientHistory: PropTypes.array.isRequired,
};

const localStyles = StyleSheet.create({
  text: {
    fontFamily: globalStyles.APP_FONT_FAMILY,
    fontSize: globalStyles.APP_GENERAL_FONT_SIZE,
    color: WHITE,
  },
  saveButton: {
    ...globalStyles.button,
    flex: 1,
    backgroundColor: SUSSOL_ORANGE,
    alignSelf: 'center',
  },
  saveButtonTextStyle: {
    ...globalStyles.buttonText,
    color: 'white',
    fontSize: 14,
  },
  cancelButton: {
    ...globalStyles.button,
    flex: 1,
    alignSelf: 'center',
  },
  cancelButtonTextStyle: {
    ...globalStyles.buttonText,
    color: SUSSOL_ORANGE,
    fontSize: 14,
  },
});

const stateToProps = state => {
  const patient = selectCurrentPatient(state);
  return { patient };
};

const dispatchToProps = dispatch => ({
  onCancel: () => dispatch(PatientActions.closeADRModal()),
  onSave: (patient, formData) => dispatch(PatientActions.saveADR(patient, formData)),
});

export const ADRInput = connect(stateToProps, dispatchToProps)(ADRInputComponent);
