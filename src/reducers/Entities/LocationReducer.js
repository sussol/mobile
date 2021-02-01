import { LOCATION_ACTIONS } from '../../actions/Entities/LocationActions';
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
    default: {
      return state;
    }
  }
};
