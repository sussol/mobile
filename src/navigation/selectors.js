/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

export const getCurrentRouteName = state => {
  return state.routes[state.index]
    ? state.routes[state.index].routeName
    : undefined;
};

export const getCurrentParams = state => {
  return state.routes[state.index]
    ? state.routes[state.index].params
    : undefined;
};
