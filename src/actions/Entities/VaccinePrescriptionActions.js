import { generateUUID } from 'react-native-database';
import { selectNewVaccinePrescriptionId } from '../../selectors/Entities/vaccinePrescription';

export const VACCINE_PRESCRIPTION_ACTIONS = {
  CREATE: 'VACCINE_PRESCRIPTION/create',
  UPDATE: 'VACCINE_PRESCRIPTION/update',
  SAVE_NEW: 'VACCINE_PRESCRIPTION/saveNew',
  SAVE_EDITING: 'VACCINE_PRESCRIPTION/saveEditing',
  RESET: 'VACCINE_PRESCRIPTION/reset',
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

const updateNew = (value, field) => (dispatch, getState) => {
  const newVaccinePrescriptionId = selectNewVaccinePrescriptionId(getState());
  dispatch(update(newVaccinePrescriptionId, field, value));
};

export const VaccinePrescriptionActions = {
  create,
  update,
  updateNew,
  saveNew,
  saveEditing,
  reset,
};
