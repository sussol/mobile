import { generateUUID } from 'react-native-database';
import { batch } from 'react-redux';

import { UIDatabase, createRecord } from '../../database';
import {selectHasRefused,  selectSelectedBatches } from '../../selectors/Entities/vaccinePrescription';
import { selectEditingNameId } from '../../selectors/Entities/name';
import { NameActions } from './NameActions';
import { NameNoteActions } from './NameNoteActions';
import { goBack } from '../../navigation/actions';

export const VACCINE_PRESCRIPTION_ACTIONS = {
  CREATE: 'VACCINE_PRESCRIPTION/create',
  SET_REFUSAL: 'VACCINE_PRESCRIPTION/setRefusal',
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

const selectVaccine = vaccine => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINE,
  payload: { vaccine },
});

const selectBatch = itemBatch => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_BATCH,
  payload: { itemBatch },
});

const setRefusal = hasRefused => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SET_REFUSAL,
  payload: { hasRefused },
});

const createPrescription = (patient, currentUser, selectedBatches) => {
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
};

const createRefusalNameNote = name => {
  const [patientEvent] = UIDatabase.objects('PatientEvent').filtered('code == "RV"');
  const id = generateUUID();
  const newNameNote = { id, name, patientEvent, entryDate: new Date() };

  UIDatabase.write(() => UIDatabase.create('NameNote', newNameNote));
};

const confirm = () => (dispatch, getState) => {
  const { user } = getState();
  const { currentUser } = user;
  const hasRefused = selectHasRefused(getState());
  const patientID = selectEditingNameId(getState());
  const patient = UIDatabase.get('Name', patientID);
  const selectedBatches = selectSelectedBatches(getState());

  if (hasRefused) {
    createRefusalNameNote(patient);
  } else {
    createPrescription(patient, currentUser, selectedBatches);
  }

  batch(() => {
    dispatch(NameNoteActions.saveEditing());
    dispatch(NameActions.saveEditing());
    dispatch(reset());
  });
};

const cancel = () => goBack();

export const VaccinePrescriptionActions = {
  cancel,
  confirm,
  create,
  reset,
  selectBatch,
  selectVaccine,
  setRefusal,
};
