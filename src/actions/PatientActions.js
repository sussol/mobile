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
  VIEW_HISTORY: 'Patient/viewHistory',
  CLOSE_HISTORY: 'Patient/closeHistory',
  SORT_HISTORY: 'Patient/sortHistory',
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

const sortPatientHistory = sortKey => ({
  type: PATIENT_ACTIONS.SORT_HISTORY,
  payload: { sortKey },
});

const viewPatientHistory = patient => ({
  type: PATIENT_ACTIONS.VIEW_HISTORY,
  payload: { patient },
});

const closePatientHistory = () => ({ type: PATIENT_ACTIONS.CLOSE_HISTORY });

export const PatientActions = {
  createPatient,
  patientUpdate,
  editPatient,
  closeModal,
  saveNewPatient,
  sortPatientHistory,
  viewPatientHistory,
  closePatientHistory,
};
