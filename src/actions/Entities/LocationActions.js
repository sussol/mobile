import { generateUUID } from 'react-native-database';
import { selectNewLocationId } from '../../selectors/Entities/location';

export const LOCATION_ACTIONS = {
  CREATE: 'LOCATION/create',
  UPDATE: 'LOCATION/update',
  SAVE_NEW: 'LOCATION/saveNew',
};

const createDefaultLocation = () => ({
  id: generateUUID(),
  description: '',
  code: '',
});

const create = () => ({
  type: LOCATION_ACTIONS.CREATE,
  payload: createDefaultLocation(),
});

const update = (id, field, value) => ({
  type: LOCATION_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const saveNew = location => ({
  type: LOCATION_ACTIONS.SAVE_NEW,
  payload: { location },
});

const updateNew = (value, field) => (dispatch, getState) => {
  const newLocationId = selectNewLocationId(getState());
  dispatch(update(newLocationId, field, value));
};

export const LocationActions = {
  create,
  update,
  updateNew,
  saveNew,
};
