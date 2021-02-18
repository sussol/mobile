import { LOCATION_ACTIONS } from '../../actions/Entities';
import { UIDatabase } from '../../database';
import { ROUTES } from '../../navigation/index';
import { SYNC_TRANSACTION_COMPLETE } from '../../sync/constants';

// Extracts the required fields of a realm instance into a plain JS object
// which is more suitable to store in redux as immutable updates are simpler.
const getPlainLocation = (location = {}) => ({
  id: location.id,
  description: location.description,
  code: location.code,
});

const getById = () =>
  UIDatabase.objects('Location').reduce(
    (acc, location) => ({
      ...acc,
      [location.id]: getPlainLocation(location),
    }),
    {}
  );

const initialState = () => ({
  byId: getById(),
  newId: '',
});

export const LocationReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case SYNC_TRANSACTION_COMPLETE: {
      const newById = getById();
      return { ...state, byId: newById };
    }

    case 'Navigation/NAVIGATE': {
      const { params, routeName } = action;

      if (routeName !== ROUTES.SENSOR_EDIT) return state;
      const { sensor } = params;
      const { locationID } = sensor;

      return { ...state, editingId: locationID };
    }

    case LOCATION_ACTIONS.CREATE: {
      const { byId } = state;
      const { payload } = action;
      const { location } = payload;
      const { id } = location;

      return { ...state, byId: { ...byId, [id]: getPlainLocation(location) }, newId: id };
    }

    case LOCATION_ACTIONS.SAVE_NEW: {
      const { byId } = state;
      const { payload } = action;
      const { location } = payload;
      const { id } = location;

      const newById = { ...byId, [id]: getPlainLocation(location) };

      return { ...state, byId: newById, newId: '' };
    }

    case LOCATION_ACTIONS.RESET: {
      return initialState();
    }

    case LOCATION_ACTIONS.SAVE_EDITING: {
      const { byId } = state;
      const { payload } = action;
      const { location } = payload;
      const { id } = location;

      // Only use plain objects.
      const newById = { ...byId, [id]: getPlainLocation(location) };

      return { ...state, byId: newById, editingId: '' };
    }

    case LOCATION_ACTIONS.UPDATE: {
      const { byId } = state;
      const { payload } = action;
      const { id, field, value } = payload;

      const oldLocation = byId[id];
      const newLocation = { ...oldLocation, [field]: value };
      const newById = { ...byId, [id]: newLocation };

      return { ...state, byId: newById };
    }
    default: {
      return state;
    }
  }
};
