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

import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';
import {
  selectPrescriptionPatient,
  selectPrescriptionPrescriber,
  selectPrescriberName,
  selectPatientName,
} from '../selectors/prescription';

import { dispensingStrings } from '../localization';

const PrescriptionInfoComponent = ({
  prescriptionPatient,
  prescriptionPrescriber,
  patientName,
  prescriberName,
  editPatient,
  viewHistory,
  editPrescriber,
}) => {
  const editPatientCallback = React.useCallback(() => editPatient(prescriptionPatient), [
    prescriptionPatient,
  ]);

  const viewHistoryCallback = React.useCallback(() => viewHistory(prescriptionPatient), [
    prescriptionPatient,
  ]);

  const prescriberEditCallback = React.useCallback(() => editPrescriber(prescriptionPrescriber), [
    prescriptionPrescriber,
  ]);

  return (
    <FlexRow>
      <FlexColumn flex={1}>
        <FlexRow alignItems="center" justifyContent="">
          <FlexView flex={3}>
            <SimpleLabel label={dispensingStrings.patient} size="small" />
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
            {prescriptionPrescriber && (
              <SimpleLabel label={dispensingStrings.prescriber} size="small" labelAlign="right" />
            )}
            {prescriptionPrescriber && (
              <SimpleLabel text={prescriberName} size="medium" textAlign="right" />
            )}
          </FlexView>

          <FlexRow flex={1} justifyContent="">
            {prescriptionPrescriber && (
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
  const prescriptionPatient = selectPrescriptionPatient(state);
  const prescriptionPrescriber = selectPrescriptionPrescriber(state);
  const patientName = selectPatientName(state);

  const prescriberName = selectPrescriberName(state);
  return { prescriptionPatient, prescriptionPrescriber, patientName, prescriberName };
};

PrescriptionInfoComponent.defaultProps = {
  prescriberName: '',
  prescriptionPrescriber: null,
};

PrescriptionInfoComponent.propTypes = {
  prescriptionPatient: PropTypes.object.isRequired,
  patientName: PropTypes.string.isRequired,
  prescriberName: PropTypes.string,
  prescriptionPrescriber: PropTypes.object,
  editPatient: PropTypes.func.isRequired,
  viewHistory: PropTypes.func.isRequired,
  editPrescriber: PropTypes.func.isRequired,
};

export const PrescriptionInfo = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionInfoComponent);
