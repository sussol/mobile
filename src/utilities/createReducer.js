/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


/**
* Helper function that returns a reducer based on an object that contains an entry for each action
* type, with a function that describes what changes to state that action would cause.
**/
export const createReducer = (defaultState = {}, stateChanges = {}) =>
    (state = defaultState, action) => {
      const { type, payload, ...otherProps } = action;
      // Whether passed through in 'payload' or as a series of extra props, all data for this action
      // is passed through to state manipulator as one payload argument
      const fullPayload = { ...payload, ...otherProps };
      if (type && stateChanges && Object.prototype.hasOwnProperty.call(stateChanges, type)) {
        return {
          ...state,
          ...stateChanges[type](fullPayload, state),
        };
      }
      return state; // Action type didn't match a change or a manipulator, return original state
    };
