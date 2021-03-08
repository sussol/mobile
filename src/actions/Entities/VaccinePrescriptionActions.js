import { generateUUID } from 'react-native-database';
import { batch } from 'react-redux';

import { UIDatabase, createRecord } from '../../database';
import {
  selectHasRefused,
  selectSelectedBatches,
} from '../../selectors/Entities/vaccinePrescription';
import { selectEditingNameId } from '../../selectors/Entities/name';
import { NameActions } from './NameActions';
import { NameNoteActions } from './NameNoteActions';
import { goBack } from '../../navigation/actions';

export const VACCINE_PRESCRIPTION_ACTIONS = {
  CREATE: 'VACCINE_PRESCRIPTION/create',
  RESET: 'VACCINE_PRESCRIPTION/reset',
  SELECT_VACCINE: 'VACCINE_PRESCRIPTION/selectVaccine',
  SELECT_BATCH: 'VACCINE_PRESCRIPTION/selectBatch',
  REFUSE_VACCINATION: 'VACCINE_PRESCRIPTION/refuse',
  SELECT_VACCINATOR: 'VACCINE_PRESCRIPTION/selectVaccinator',
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

const getDefaultVaccinator = () => {
  const [batches] = UIDatabase.objects('TransactionBatch')
    .filtered('medicineAdministrator != null && itemBatch.item.isVaccine == true')
    .sorted('transaction.confirmDate');

  if (batches) {
    return batches.medicineAdministrator;
  }

  return null;
};

const create = () => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.CREATE,
  payload: { prescription: createDefaultVaccinePrescription(), vaccinator: getDefaultVaccinator() },
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

const refuse = value => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.REFUSE_VACCINATION,
  payload: { value },
});

const createPrescription = (patient, currentUser, selectedBatches, vaccinator) => {
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
      transactionItem.setVaccinator(UIDatabase, vaccinator);
    });
    prescription.finalise(UIDatabase);
  });
};

const createRefusalNameNote = name => {
  const [patientEvent] = UIDatabase.objects('PatientEvent').filtered('code == "RV"');
  const id = generateUUID();
  const _data = JSON.stringify({ refused: true, date: new Date() });
  const newNameNote = { id, name, patientEvent, _data, entryDate: new Date() };

  UIDatabase.write(() => UIDatabase.create('NameNote', newNameNote));
};

const confirm = () => (dispatch, getState) => {
  const { user } = getState();
  const { currentUser } = user;
  const hasRefused = selectHasRefused(getState());
  const patientID = selectEditingNameId(getState());
  const patient = UIDatabase.get('Name', patientID);
  const selectedBatches = selectSelectedBatches(getState());
  const vaccinator = selectVaccinator(getState());

  if (hasRefused) {
    createRefusalNameNote(patient);
  } else {
    createPrescription(patient, currentUser, selectedBatches, vaccinator);
  }

  batch(() => {
    dispatch(NameNoteActions.saveEditing());
    dispatch(NameActions.saveEditing());
    dispatch(reset());
  });
};

const selectVaccinator = vaccinator => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINATOR,
  payload: { vaccinator },
});

const cancel = () => goBack();

export const VaccinePrescriptionActions = {
  cancel,
  confirm,
  create,
  refuse,
  reset,
  selectBatch,
  selectVaccine,
  selectVaccinator,
};
