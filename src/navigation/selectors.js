/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const getCurrentRouteName = state =>
  state.routes[state.index] ? state.routes[state.index].routeName : undefined;

export const getCurrentParams = state =>
  state.routes[state.index] ? state.routes[state.index].params : undefined;
