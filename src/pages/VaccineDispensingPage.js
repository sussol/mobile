/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Wizard } from '../widgets';
import { PatientSelect } from '../widgets/Tabs/PatientSelect';
import { PatientEdit } from '../widgets/Tabs/PatientEdit';
import { VaccineSelect } from '../widgets/Tabs/VaccineSelect';
import { dispensingStrings } from '../localization';
import { ModalContainer } from '../widgets/modals';
import { PatientVaccineHistory } from '../widgets/modals/PatientVaccineHistory';
import { selectHistoryIsOpen } from '../selectors/Entities/vaccinePrescription';
import { VaccinePrescriptionActions } from '../actions/Entities/index';

const tabs = [
  {
    component: PatientSelect,
    name: 'patient',
    title: dispensingStrings.select_the_patient,
  },
  { component: PatientEdit, name: 'edit', title: dispensingStrings.edit_the_patient },
  { component: VaccineSelect, name: 'prescription', title: dispensingStrings.finalise },
];

export const VaccineDispensingPageComponent = ({ historyIsOpen, closeHistory }) => (
  <>
    <Wizard useNewStepper captureUncaughtGestures={false} tabs={tabs} />
    <ModalContainer
      title={`${dispensingStrings.patient} ${dispensingStrings.history}`}
      onClose={closeHistory}
      isVisible={historyIsOpen}
    >
      <PatientVaccineHistory />
    </ModalContainer>
  </>
);

VaccineDispensingPageComponent.propTypes = {
  historyIsOpen: PropTypes.bool.isRequired,
  closeHistory: PropTypes.func.isRequired,
};

const stateToProps = state => {
  const historyIsOpen = selectHistoryIsOpen(state);

  return { historyIsOpen };
};

const dispatchToProps = dispatch => ({
  closeHistory: () => dispatch(VaccinePrescriptionActions.toggleHistory(false)),
});

export const VaccineDispensingPage = connect(
  stateToProps,
  dispatchToProps
)(VaccineDispensingPageComponent);
