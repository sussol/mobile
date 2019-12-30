/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FlexRow } from './FlexRow';
import { SimpleLabel } from './SimpleLabel';
import { CircleButton } from './CircleButton';
import { PencilIcon, HistoryIcon } from './icons';

import { selectCurrentPatient, selectPatientName } from '../selectors/patient';
import { selectCurrentPrescriber, selectPrescriberName } from '../selectors/prescriber';
import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';

import { WHITE, BLUE_WHITE } from '../globalStyles';

const PrescriptionInfoComponent = ({
  currentPatient,
  patientName,
  prescriberName,
  currentPrescriber,
  editPatient,
  viewHistory,
  editPrescriber,
}) => {
  const { mainContainerStyles, leftContainerStyle } = localStyles;

  const editPatientCallback = React.useCallback(() => editPatient(currentPatient), [
    currentPatient,
  ]);

  const viewHistoryCallback = React.useCallback(() => viewHistory(currentPatient), [
    currentPatient,
  ]);

  const prescriberEditCallback = React.useCallback(() => editPrescriber(currentPrescriber), [
    currentPrescriber,
  ]);

  return (
    <FlexRow justifyContent="space-between" style={mainContainerStyles}>
      <FlexRow alignItems="center" flex={1} style={leftContainerStyle}>
        <SimpleLabel label="Patient" text={patientName} size="large" />
        <CircleButton IconComponent={HistoryIcon} onPress={viewHistoryCallback} />
        <CircleButton IconComponent={PencilIcon} onPress={editPatientCallback} />
      </FlexRow>
      {currentPrescriber && (
        <FlexRow alignItems="center" justifyContent="flex-end" flex={1}>
          <SimpleLabel label="Prescriber" text={prescriberName} size="large" />
          <CircleButton IconComponent={PencilIcon} onPress={prescriberEditCallback} />
        </FlexRow>
      )}
    </FlexRow>
  );
};

const localStyles = StyleSheet.create({
  mainContainerStyle: { backgroundColor: WHITE, marginVertical: 10 },
  leftContainerStyle: { borderRightWidth: 10, borderRightColor: BLUE_WHITE },
});

const mapDispatchToProps = dispatch => {
  const editPatient = patient => dispatch(PatientActions.editPatient(patient));
  const viewHistory = patient => dispatch(PatientActions.viewPatientHistory(patient));
  const editPrescriber = prescriber => dispatch(PrescriberActions.editPrescriber(prescriber));
  return { editPatient, viewHistory, editPrescriber };
};

const mapStateToProps = state => {
  const currentPatient = selectCurrentPatient(state);
  const currentPrescriber = selectCurrentPrescriber(state);
  const patientName = selectPatientName(state);
  const prescriberName = selectPrescriberName(state);
  return { currentPatient, currentPrescriber, patientName, prescriberName };
};

PrescriptionInfoComponent.defaultProps = {
  prescriberName: '',
  currentPrescriber: null,
};

PrescriptionInfoComponent.propTypes = {
  currentPatient: PropTypes.object.isRequired,
  patientName: PropTypes.string.isRequired,
  prescriberName: PropTypes.string,
  currentPrescriber: PropTypes.object,
  editPatient: PropTypes.func.isRequired,
  viewHistory: PropTypes.func.isRequired,
  editPrescriber: PropTypes.func.isRequired,
};

export const PrescriptionInfo = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionInfoComponent);
