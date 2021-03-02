import { generateUUID } from 'react-native-database';
import { selectEditingNameId } from '../../selectors/Entities/name';

export const NAME_ACTIONS = {
  CREATE: 'NAME/create',
  UPDATE: 'NAME/update',
  SAVE: 'NAME/save',
  RESET: 'NAME/reset',
  FILTER: 'NAME/filter',
  SORT: 'NAME/sort',
};

const createDefaultName = (type = 'patient') => ({
  id: generateUUID(),
  code: '',
  isCustomer: false,
  isManufacturer: false,
  isPatient: true,
  isSupplier: false,
  isVisible: true,
  name: '',
  type,
});

const create = type => ({
  type: NAME_ACTIONS.CREATE,
  payload: { name: createDefaultName(type) },
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

const filter = searchParameters => ({ type: NAME_ACTIONS.FILTER, payload: { searchParameters } });

const sort = sortKey => ({ type: NAME_ACTIONS.SORT, payload: { sortKey } });

const updateEditing = (value, field) => (dispatch, getState) => {
  const newNameId = selectEditingNameId(getState());
  dispatch(update(newNameId, field, value));
};

export const NameActions = {
  create,
  filter,
  reset,
  save,
  sort,
  update,
  updateEditing,
};
