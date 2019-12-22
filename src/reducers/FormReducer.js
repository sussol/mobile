/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { FORM_ACTIONS } from '../actions/FormActions';

const initialState = config => {
  if (!config) return {};

  return config.reduce(
    (acc, { key, initialValue, validator, isRequired }) => ({
      ...acc,
      [key]: {
        value: initialValue,
        isValid: validator ? validator(initialValue) : true,
        validator,
        isRequired,
      },
    }),
    {}
  );
};

export const FormReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case FORM_ACTIONS.INITIALISE: {
      const { payload } = action;
      const { config } = payload;
      return initialState(config);
    }
    case FORM_ACTIONS.UPDATE: {
      const { payload } = action;
      const { key, value } = payload;

      const stateData = state[key];

      const { validator } = stateData;

      const newStateData = {
        ...stateData,
        value,
        isValid: validator ? validator(value) : true,
      };

      return { ...state, [key]: newStateData };
    }
    case FORM_ACTIONS.CANCEL: {
      return initialState();
    }
    default:
      return state;
  }
};
