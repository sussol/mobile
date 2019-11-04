/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { DataTablePageReducer } from '../pages/dataTableUtilities/reducer/DataTablePageReducer';
import getPageInitialiser from '../pages/dataTableUtilities/getPageInitialiser';

/**
 * Redux reducer controlling the `pages` field.
 * @param {Object} state  Redux state, `pages` field.
 * @param {Object} action An action object, following the FSA-standard for action objects
 */
export const PagesReducer = (state = {}, action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/REPLACE':
    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;
      const { pageObject } = params;

      const pageInitialiser = getPageInitialiser(routeName);
      const pageInitialState = pageInitialiser(pageObject);

      return { ...state, [routeName]: pageInitialState, currentRoute: routeName };
    }
    default: {
      const { payload } = action;
      const { route } = payload || {};

      const newState = route
        ? { ...state, [route]: DataTablePageReducer(state[route], action) }
        : state;
      return newState;
    }
  }
};
