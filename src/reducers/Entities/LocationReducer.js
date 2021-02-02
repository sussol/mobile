import { LOCATION_ACTIONS } from '../../actions/Entities';
import { UIDatabase } from '../../database';

const initialState = () => ({
  byId: UIDatabase.objects('Location').reduce(
    (acc, location) => ({
      ...acc,
      [location.id]: location,
    }),
    {}
  ),
  newId: '',
});

export const LocationReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case LOCATION_ACTIONS.CREATE: {
      const { byId } = state;
      const { payload } = action;
      const { id } = payload;

      return { ...state, byId: { ...byId, [id]: payload }, newId: id };
    }

    case LOCATION_ACTIONS.SAVE_NEW: {
      const { byId } = state;
      const { payload } = action;
      const { location } = payload;
      const { id } = location;

      const newById = { ...byId, [id]: location };

      return { ...state, byId: newById, newId: '' };
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
