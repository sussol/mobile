/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { DataTablePageReducer } from '../pages/dataTableUtilities/reducer/DataTablePageReducer';
import getPageInitialiser from '../pages/dataTableUtilities/getPageInitialiser';

/**
 * Redux reducer controlling the `pages` field.
 *
 * @param {Object} state  Redux state, `pages` field.
 * @param {Object} action An action object, following the FSA-standard for action objects
 */
export const PagesReducer = (state = {}, action) => {
  const { type } = action;

  switch (type) {
    case 'GO_BACK': {
      const { payload } = action;
      const { prevRouteName } = payload || {};
      return { ...state, currentRoute: prevRouteName };
    }

    case 'REPLACE':
    case 'NAVIGATE': {
      const { payload } = action;
      const { name, params } = payload;
      const { pageObject } = params ?? {};

      const pageInitialiser = getPageInitialiser(name);
      const pageInitialState = pageInitialiser(pageObject);

      return { ...state, [name]: pageInitialState, currentRoute: name };
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
