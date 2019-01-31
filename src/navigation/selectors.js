/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

export const getCurrentRouteName = state => (state.routes[state.index]
  ? state.routes[state.index].routeName
  : undefined);

export const getCurrentParams = state => (state.routes[state.index]
  ? state.routes[state.index].params
  : undefined);
