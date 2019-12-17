/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase, generateUUID } from '../database';
import { PageActions } from '../pages/dataTableUtilities/actions';
import { ROUTES } from '../navigation/constants';

export const PATIENT_ACTIONS = {
  PATIENT_EDIT: 'Patient/patientEdit',
  PATIENT_CREATION: 'Patient/patientCreation',
  COMPLETE: 'Patient/complete',
};

const closeModal = () => ({ type: PATIENT_ACTIONS.COMPLETE });

const createPatient = () => ({ type: PATIENT_ACTIONS.PATIENT_CREATION });

const editPatient = patient => ({
  type: PATIENT_ACTIONS.PATIENT_EDIT,
  payload: {
    patient,
  },
});

const patientUpdate = completedForm => (dispatch, getState) => {
  const { patient } = getState();
  const { currentPatient } = patient;

  UIDatabase.write(() => {
    UIDatabase.update('Name', {
      ...currentPatient,
      ...completedForm,
      isPatient: true,
      isVisible: true,
    });
  });

  dispatch(closeModal());
  dispatch(PageActions.refreshData(ROUTES.DISPENSARY));
};

const saveNewPatient = completedForm => dispatch => {
  UIDatabase.write(() => {
    UIDatabase.update('Name', {
      ...completedForm,
      id: generateUUID(),
      isPatient: true,
      isVisible: true,
    });
  });

  dispatch(closeModal());
  dispatch(PageActions.refreshData(ROUTES.DISPENSARY));
};

export const PatientActions = {
  createPatient,
  patientUpdate,
  editPatient,
  closeModal,
  saveNewPatient,
};
