/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import Navigator from './Navigator';

const initialState = Navigator.router.getStateForAction(Navigator.router.getActionForPathAndParams('root'));

const navReducer = (state = initialState, action) => {
  // Ensure we don't push the same route twice (quick double tap of button etc.)
  // Code from https://github.com/react-community/react-navigation/issues/135
  if (action.type === 'Navigation/NAVIGATE') {
    const currentRoute = state.routes[state.index];
    if (currentRoute.routeName === action.routeName
        && paramsEqual(currentRoute.params, action.params)) return state;
  }

  const nextState = Navigator.router.getStateForAction(action, state);
  return nextState || state;
};

const paramsEqual = (params1, params2) => {
  if (params1 === params2) return true;

  if (!params1 || !params2
      || Object.keys(params1).length !== Object.keys(params2).length) return false;

  return Object.entries(params1).every(([key, value]) => value === params2[key]);
};

export default navReducer;
