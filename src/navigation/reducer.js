/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { Navigator } from './Navigator';

const paramsEqual = (params1, params2) => {
  if (params1 === params2) return true;

  if (!params1 || !params2 || Object.keys(params1).length !== Object.keys(params2).length) {
    return false;
  }

  return Object.entries(params1).every(([key, value]) => value === params2[key]);
};

export const reducer = (state, action) => {
  // Prevent the same route being pushed twice (e.g. double tap of button).
  // See https://github.com/react-community/react-navigation/issues/135.
  if (action.type === 'Navigation/NAVIGATE') {
    const currentRoute = state.routes[state.index];
    if (
      currentRoute.routeName === action.routeName &&
      paramsEqual(currentRoute.params, action.params)
    ) {
      return state;
    }
  }
  return Navigator.router.getStateForAction(action, state) || state;
};

export default reducer;
