import { generateUUID } from 'react-native-database';
import { batch } from 'react-redux';
import { NavigationActions } from '@react-navigation/core';
import { selectEditingVaccinePrescriptionId } from '../../selectors/Entities/vaccinePrescription';
import { NameActions } from './NameActions';

export const VACCINE_PRESCRIPTION_ACTIONS = {
  CREATE: 'VACCINE_PRESCRIPTION/create',
  UPDATE: 'VACCINE_PRESCRIPTION/update',
  SAVE_NEW: 'VACCINE_PRESCRIPTION/saveNew',
  SAVE_EDITING: 'VACCINE_PRESCRIPTION/saveEditing',
  RESET: 'VACCINE_PRESCRIPTION/reset',
  SELECT_VACCINE: 'VACCINE_PRESCRIPTION/selectVaccine',
  SELECT_BATCH: 'VACCINE_PRESCRIPTION/selectBatch',
};

const createDefaultVaccinePrescription = () => ({
  id: generateUUID(),
  name: '',
  code: '',
  type: 'patient',
  isCustomer: false,
  isSupplier: false,
  isManufacturer: false,
  isVisible: true,
});

const create = () => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.CREATE,
  payload: { prescription: createDefaultVaccinePrescription() },
});

const reset = () => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.RESET,
});

const update = (id, field, value) => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const saveNew = prescription => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SAVE_NEW,
  payload: { prescription },
});

const saveEditing = prescription => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SAVE_EDITING,
  payload: { prescription },
});

const selectVaccine = vaccine => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINE,
  payload: { vaccine },
});
const selectBatch = itemBatch => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_BATCH,
  payload: { itemBatch },
});

const updateEditing = (value, field) => (dispatch, getState) => {
  const newVaccinePrescriptionId = selectEditingVaccinePrescriptionId(getState());
  dispatch(update(newVaccinePrescriptionId, field, value));
};

const cancel = () => dispatch => {
  batch(() => {
    dispatch(NavigationActions.back());
    dispatch(NameActions.reset());
    dispatch(reset());
  });
};

export const VaccinePrescriptionActions = {
  cancel,
  create,
  reset,
  saveEditing,
  saveNew,
  selectBatch,
  selectVaccine,
  update,
  updateEditing,
};
