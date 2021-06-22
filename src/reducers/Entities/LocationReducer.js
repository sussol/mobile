import { LOCATION_ACTIONS } from '../../actions/Entities';
import { UIDatabase } from '../../database';
import { ROUTES } from '../../navigation/index';
import { INITIALISE_FINISHED, SYNC_TRANSACTION_COMPLETE } from '../../sync/constants';

const getById = () =>
  UIDatabase.objects('Location').reduce(
    (acc, location) => ({
      ...acc,
      [location.id]: location.toJSON(),
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
    case INITIALISE_FINISHED:
    case SYNC_TRANSACTION_COMPLETE: {
      const { byId } = state;

      const newById = getById();
      const mergedById = { ...byId, ...newById };

      return { ...state, byId: mergedById };
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

      return { ...state, byId: { ...byId, [id]: location }, newId: id };
    }

    case LOCATION_ACTIONS.SAVE_NEW: {
      const { byId } = state;
      const { payload } = action;
      const { location } = payload;
      const { id } = location;

      const newById = { ...byId, [id]: location.toJSON() };

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
      const newById = { ...byId, [id]: location.toJSON() };

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
