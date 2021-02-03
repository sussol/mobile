import { LOCATION_ACTIONS } from '../../actions/Entities';
import { UIDatabase } from '../../database';
import { ROUTES } from '../../navigation/index';

// Extracts the required fields of a realm instance into a plain JS object
// which is more suitable to store in redux as immutable updates are simpler.
const getPlainLocation = (location = {}) => ({
  id: location.id,
  description: location.description,
  code: location.code,
});

const initialState = () => ({
  byId: UIDatabase.objects('Location').reduce(
    (acc, location) => ({
      ...acc,
      [location.id]: getPlainLocation(location),
    }),
    {}
  ),
  newId: '',
});

export const LocationReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { params, routeName } = action;

      if (routeName !== ROUTES.SENSOR_EDIT) return state;
      const { sensor } = params;
      const { location } = sensor;
      const { id } = location;

      return { ...state, editingId: id };
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