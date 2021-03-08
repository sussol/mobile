import { generateUUID } from 'react-native-database';
import { batch } from 'react-redux';
import { NavigationActions } from '@react-navigation/core';

import { UIDatabase, createRecord } from '../../database';
import {
  selectEditingVaccinePrescriptionId,
  selectSelectedBatches,
} from '../../selectors/Entities/vaccinePrescription';
import { selectEditingNameId } from '../../selectors/Entities/name';
import { NameActions } from './NameActions';
import { NameNoteActions } from './NameNoteActions';

export const VACCINE_PRESCRIPTION_ACTIONS = {
  CREATE: 'VACCINE_PRESCRIPTION/create',
  UPDATE: 'VACCINE_PRESCRIPTION/update',
  SAVE_NEW: 'VACCINE_PRESCRIPTION/saveNew',
  SAVE_EDITING: 'VACCINE_PRESCRIPTION/saveEditing',
  REFUSE_VACCINATION: 'VACCINE_PRESCRIPTION/refuse',
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

const refuse = value => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.REFUSE_VACCINATION,
  payload: { value },
});

const confirm = () => (dispatch, getState) => {
  const { user } = getState();
  const { currentUser } = user;
  const patientID = selectEditingNameId(getState());
  const patient = UIDatabase.get('Name', patientID);
  const selectedBatches = selectSelectedBatches(getState());

  UIDatabase.write(() => {
    const prescription = createRecord(
      UIDatabase,
      'CustomerInvoice',
      patient,
      currentUser,
      'dispensary'
    );

    selectedBatches.forEach(itemBatch => {
      const { item } = itemBatch;
      const transactionItem = createRecord(UIDatabase, 'TransactionItem', prescription, item);
      createRecord(UIDatabase, 'TransactionBatch', transactionItem, itemBatch);
      transactionItem.setDoses(UIDatabase, 1);
    });
    prescription.finalise(UIDatabase);
  });

  batch(() => {
    dispatch(NameNoteActions.saveEditing());
    dispatch(NameActions.saveEditing());
    dispatch(reset());
  });
};

const cancel = () => dispatch => {
  batch(() => {
    dispatch(NavigationActions.back());
    dispatch(NameActions.reset());
    dispatch(NameNoteActions.reset());
    dispatch(reset());
  });
};

export const VaccinePrescriptionActions = {
  cancel,
  confirm,
  create,
  refuse,
  reset,
  saveEditing,
  saveNew,
  selectBatch,
  selectVaccine,
  update,
  updateEditing,
};
