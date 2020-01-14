/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FlexRow } from './FlexRow';
import { FlexView } from './FlexView';
import { FlexColumn } from './FlexColumn';
import { SimpleLabel } from './SimpleLabel';
import { CircleButton } from './CircleButton';
import { PencilIcon, HistoryIcon } from './icons';

import { selectCurrentPatient, selectPatientName } from '../selectors/patient';
import { selectCurrentPrescriber, selectPrescriberName } from '../selectors/prescriber';
import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';

const PrescriptionInfoComponent = ({
  currentPatient,
  patientName,
  prescriberName,
  currentPrescriber,
  editPatient,
  viewHistory,
  editPrescriber,
}) => {
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
    <FlexRow>
      <FlexColumn flex={1}>
        <FlexRow alignItems="center" justifyContent="">
          <FlexView flex={3}>
            <SimpleLabel label="Patient" size="small" />
            <SimpleLabel text={patientName} size="medium" />
          </FlexView>

          <FlexRow flex={1}>
            <CircleButton IconComponent={HistoryIcon} onPress={viewHistoryCallback} />
            <CircleButton IconComponent={PencilIcon} onPress={editPatientCallback} />
          </FlexRow>
        </FlexRow>
      </FlexColumn>

      <FlexColumn alignItems="flex-start" flex={1}>
        <FlexRow justifyContent="flex-start" alignItems="flex-end" reverse>
          <FlexView flex={3} justifyContent="flex-end" alignItems="flex-end">
            {currentPrescriber && (
              <SimpleLabel label="Prescriber" size="small" labelAlign="right" />
            )}
            {currentPrescriber && (
              <SimpleLabel text={prescriberName} size="medium" textAlign="right" />
            )}
          </FlexView>

          <FlexRow flex={1} justifyContent="">
            {currentPrescriber && (
              <CircleButton IconComponent={PencilIcon} onPress={prescriberEditCallback} />
            )}
          </FlexRow>
        </FlexRow>
      </FlexColumn>
    </FlexRow>
  );
};

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
