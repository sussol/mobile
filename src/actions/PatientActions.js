/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';

export const PATIENT_ACTIONS = {
  FIELD_VALIDITY: 'Patient/fieldValidity',
  FIELD_UPDATE: 'Patient/fieldUpdate',
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

const setFieldValidity = (field, newValidity) => ({
  type: PATIENT_ACTIONS.FIELD_VALIDITY,
  payload: { field, validity: newValidity },
});

const setFieldUpdate = (field, newValue) => ({
  type: PATIENT_ACTIONS.FIELD_UPDATE,
  payload: { field, value: newValue },
});

const patientUpdate = () => (dispatch, getState) => {
  const { patient } = getState();
  const {
    currentPatient,
    firstName,
    lastName,
    code,
    dateOfBirth,
    email,
    phone,
    addressOne,
    addressTwo,
    country,
  } = patient;

  UIDatabase.write(() => {
    UIDatabase.update('Name', {
      ...currentPatient,
      firstName,
      lastName,
      code,
      dateOfBirth,
      email,
      phone,
      addressOne,
      addressTwo,
      country,
    });
  });

  dispatch(closeModal());
};

export const PatientActions = {
  createPatient,
  patientUpdate,
  setFieldUpdate,
  setFieldValidity,
  editPatient,
  closeModal,
};
