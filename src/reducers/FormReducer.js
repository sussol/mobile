/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { FORM_ACTIONS } from '../actions/FormActions';
import { UIDatabase } from '../database/index';

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

      const updatePolicyNumberPerson = key === 'policyNumberPerson';
      const updatePolicyNumberFamily = key === 'policyNumberFamily';

      if (updatePolicyNumberPerson || updatePolicyNumberFamily) {
        const { policyNumberPerson: policyNumberPersonState } = state;
        const { value: policyNumberPersonValue } = updatePolicyNumberPerson
          ? { value }
          : policyNumberPersonState;

        const { policyNumberFamily: policyNumberFamilyState } = state;
        const { value: policyNumberFamilyValue } = updatePolicyNumberFamily
          ? { value }
          : policyNumberFamilyState;

        const isDuplicatePolicyNumber =
          UIDatabase.objects('InsurancePolicy').filtered(
            'policyNumberPerson == $0 && policyNumberFamily == $1',
            policyNumberPersonValue,
            policyNumberFamilyValue
          ).length > 0;

        const newPolicyNumberPersonState = {
          ...policyNumberPersonState,
          value: policyNumberPersonValue,
          isValid: !isDuplicatePolicyNumber,
        };

        const newPolicyNumberFamilyState = {
          ...policyNumberFamilyState,
          value: policyNumberFamilyValue,
          isValid: !isDuplicatePolicyNumber,
        };

        return {
          ...state,
          policyNumberPerson: newPolicyNumberPersonState,
          policyNumberFamily: newPolicyNumberFamilyState,
        };
      }

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
