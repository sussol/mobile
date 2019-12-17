/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';

const ACTIONS = { FIELD_VALIDITY: 'fieldValidity', FIELD_UPDATE: 'fieldUpdate' };

const setFieldValidity = (field, newValidity) => ({
  type: ACTIONS.FIELD_VALIDITY,
  payload: { field, validity: newValidity },
});

const setFieldUpdate = (field, newValue) => ({
  type: ACTIONS.FIELD_UPDATE,
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
