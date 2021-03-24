/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { JSONForm } from '../JSONForm/JSONForm';
import { UIDatabase } from '../../database/index';
import { FlexRow } from '../FlexRow';
import { PageButton } from '../PageButton';
import { SUSSOL_ORANGE } from '../../globalStyles/colors';
import globalStyles from '../../globalStyles/index';
import { PatientActions } from '../../actions/PatientActions';
import { selectCurrentPatient } from '../../selectors/patient';

export const ADRInputComponent = ({ onCancel, onSave, patient }) => {
  const [{ formData, isValid }, setForm] = useState({ formData: null, isValid: false });

  return (
    <>
      <JSONForm
        onChange={(changed, validator) => {
          setForm({ form: changed.formData, isValid: validator(changed.formData) });
        }}
        surveySchema={UIDatabase.objects('ADRForm')[0]}
      >
        <></>
      </JSONForm>
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
};

const localStyles = StyleSheet.create({
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
