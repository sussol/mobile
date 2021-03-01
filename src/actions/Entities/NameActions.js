import { generateUUID } from 'react-native-database';
import { selectNewNameId } from '../../selectors/Entities/name';

export const NAME_ACTIONS = {
  CREATE: 'NAME/create',
  UPDATE: 'NAME/update',
  SAVE: 'NAME/save',
  RESET: 'NAME/reset',
};

const createDefaultName = () => ({
  id: generateUUID(),
  code: '',
  isCustomer: false,
  isManufacturer: false,
  isPatient: true,
  isSupplier: false,
  isVisible: true,
  name: '',
  type: 'patient',
});

const create = () => ({
  type: NAME_ACTIONS.CREATE,
  payload: { name: createDefaultName() },
});

const reset = () => ({
  type: NAME_ACTIONS.RESET,
});

const update = (id, field, value) => ({
  type: NAME_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const save = name => ({
  type: NAME_ACTIONS.SAVE,
  payload: { name },
});

const updateNew = (value, field) => (dispatch, getState) => {
  const newNameId = selectNewNameId(getState());
  dispatch(update(newNameId, field, value));
};

export const NameActions = {
  create,
  update,
  updateNew,
  save,
  reset,
};
