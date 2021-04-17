/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { FORM_ACTIONS } from '../actions/FormActions';
import { UIDatabase } from '../database/index';
import { INSURANCE_POLICY_FIELDS } from '../utilities/modules/dispensary/constants';

const initialState = config => {
  if (!config) return { formConfig: {}, isConfirmFormOpen: false };

  const formConfig = config.reduce(
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

  return { formConfig, isConfirmFormOpen: false };
};

export const FormReducer = (state = initialState(), action) => {
  const { formConfig, isConfirmFormOpen } = state;
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

      const updatePolicyNumberPerson = key === INSURANCE_POLICY_FIELDS.POLICY_NUMBER_PERSON;
      const updatePolicyNumberFamily = key === INSURANCE_POLICY_FIELDS.POLICY_NUMBER_FAMILY;
      const updatePolicyNumber = updatePolicyNumberPerson || updatePolicyNumberFamily;

      if (updatePolicyNumber) {
        const { policyNumberPerson: policyNumberPersonState } = formConfig;
        const { policyNumberFamily: policyNumberFamilyState } = formConfig;

        const { value: policyNumberPersonValue } = updatePolicyNumberPerson
          ? { value }
          : policyNumberPersonState;

        const { value: policyNumberFamilyValue } = updatePolicyNumberFamily
          ? { value }
          : policyNumberFamilyState;

        const isPolicyNumberPersonValid = policyNumberPersonState.validator?.(
          policyNumberPersonValue
        );

        const isPolicyNumberFamilyValid = policyNumberFamilyState.validator?.(
          policyNumberFamilyValue
        );

        const isPolicyNumberUnique =
          UIDatabase.objects('InsurancePolicy').filtered(
            'policyNumberPerson == $0 && policyNumberFamily == $1',
            policyNumberPersonValue,
            policyNumberFamilyValue
          ).length === 0;

        const newPolicyNumberPersonState = {
          ...policyNumberPersonState,
          value: policyNumberPersonValue,
          isValid: isPolicyNumberUnique && isPolicyNumberPersonValid,
        };

        const newPolicyNumberFamilyState = {
          ...policyNumberFamilyState,
          value: policyNumberFamilyValue,
          isValid: isPolicyNumberUnique && isPolicyNumberFamilyValid,
        };

        return {
          formConfig: {
            ...formConfig,
            policyNumberPerson: newPolicyNumberPersonState,
            policyNumberFamily: newPolicyNumberFamilyState,
          },
          isConfirmFormOpen,
        };
      }

      const configData = formConfig[key];

      if (!configData) return state;

      const { validator } = configData;

      const newConfigData = {
        ...configData,
        value,
        isValid: validator ? validator(value) : true,
      };

      return {
        formConfig: { ...formConfig, [key]: newConfigData },
        isConfirmFormOpen,
      };
    }

    case FORM_ACTIONS.CANCEL: {
      return initialState();
    }

    case FORM_ACTIONS.SHOW_CONFIRM_FORM: {
      return {
        formConfig,
        isConfirmFormOpen: true,
      };
    }

    case FORM_ACTIONS.HIDE_CONFIRM_FORM: {
      return {
        formConfig,
        isConfirmFormOpen: false,
      };
    }

    default:
      return state;
  }
};
