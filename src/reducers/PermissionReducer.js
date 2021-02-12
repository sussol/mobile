/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { PERMISSION_ACTIONS } from '../actions/PermissionActions';

const initialState = () => ({
  location: false,
  writeStorage: false,
  bluetooth: false,
  locationService: false,
});

export const PermissionReducer = (state = initialState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case PERMISSION_ACTIONS.SET_LOCATION: {
      const { status } = payload;

      return { ...state, location: status };
    }
    case PERMISSION_ACTIONS.SET_WRITE_STORAGE: {
      const { status } = payload;

      return { ...state, writeStorage: status };
    }
    case PERMISSION_ACTIONS.SET_BLUETOOTH: {
      const { status } = payload;

      return { ...state, bluetooth: status };
    }
    case PERMISSION_ACTIONS.SET_LOCATION_SERVICE: {
      const { status } = payload;

      return { ...state, locationService: status };
    }
    default:
      return state;
  }
};
