/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';

export const PATIENT_ACTIONS = {
  FIELD_VALIDITY: 'Patient/fieldValidity',
  FIELD_UPDATE: 'Patient/fieldUpdate',
};

const setFieldValidity = (field, newValidity) => ({
  type: PATIENT_ACTIONS.FIELD_VALIDITY,
  payload: { field, validity: newValidity },
});

const setFieldUpdate = (field, newValue) => ({
  type: PATIENT_ACTIONS.FIELD_UPDATE,
  payload: { field, value: newValue },
});

const patientUpdate = () => (_, getState) => {
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
    UIDatabase.update(
      'Name',
      ...currentPatient,
      firstName,
      lastName,
      code,
      dateOfBirth,
      email,
      phone,
      addressOne,
      addressTwo,
      country
    );
  });
};

export const PatientActions = { patientUpdate, setFieldUpdate, setFieldValidity };
