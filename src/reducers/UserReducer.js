/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { USER_ACTION_TYPES } from '../actions/UserActions';

const initialState = () => ({ currentUser: null });

/**
 * Reducer for User state.
 * Shape:
 * {
 *     currentUser,
 * }
 */
export const UserReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case USER_ACTION_TYPES.LOG_IN: {
      const { payload } = action;
      const { user } = payload;

      return { ...state, currentUser: user };
    }
    case USER_ACTION_TYPES.LOG_OUT: {
      return { ...state, currentUser: null };
    }
    default:
      return state;
  }
};
