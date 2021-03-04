import { generateUUID } from 'react-native-database';
import { selectEditingNameId, selectEditingName } from '../../selectors/Entities/name';

export const NAME_ACTIONS = {
  CREATE: 'NAME/create',
  UPDATE: 'NAME/update',
  SELECT: 'NAME/select',
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

const updatePatient = detailsEntered => (dispatch, getState) => {
  const currentPatient = selectEditingName(getState());
  const { id } = currentPatient || {};
  const currentKeys = Object.keys(currentPatient);

  if (!id) return;

  Object.entries(detailsEntered).forEach(([key, value]) => {
    if (currentKeys.includes(key) && currentPatient[key] !== value) {
      dispatch(update(id, key, value));
    }
  });
};

const select = name => ({
  type: NAME_ACTIONS.SELECT,
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
  select,
  sort,
  update,
  updateEditing,
  updatePatient,
};
