/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

export const getCurrentRouteName = (state) => state.routes[state.index].routeName;

export const getCurrentTitle = (state) => state.routes[state.index].params.title;
