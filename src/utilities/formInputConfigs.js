/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import moment from 'moment';
import { UIDatabase } from '../database';

import { formInputStrings } from '../localization';

/**
 * File contains constants and config objects which declaritively define
 * form inputs to be used with `FormControl`.
 *
 * For a particular form, add a field to FIELD_CONFIGS, which will define what
 * form input configs to use.
 *
 * FormInputConfig have the following structure:
 * {
 *     type: 'text' : A FormTextInput component
 *     initialValue : The value to seed the form input component with.
 *     key: A key for the underlying record.
 *     isRequired : Indicator whether this input is required to be filled for completion.
 *     label: A label for the form input.
 *     invalidMessage: A message when the input is invalid.
 *     validator: A function to call to determine if the current input is valid.
 * }
 */

const FORM_INPUT_KEYS = {
  FIRST_NAME: 'firstName',
  SEARCH_FIRST_NAME: 'searchFirstName',
  LAST_NAME: 'lastName',
  SEARCH_LAST_NAME: 'searchLastName',
  CODE: 'code',
  DATE_OF_BIRTH: 'dateOfBirth',
  SEARCH_DATE_OF_BIRTH: 'searchDateOfBirth',
  EMAIL: 'emailAddress',
  PHONE: 'phoneNumber',
  COUNTRY: 'country',
  ADDRESS_ONE: 'addressOne',
  ADDRESS_TWO: 'addressTwo',
  REGISTRATION_CODE: 'registrationCode',
  SEARCH_REGISTRATION_CODE: 'searchRegistrationCode',
  POLICY_NUMBER_FAMILY: 'policyNumberFamily',
  SEARCH_POLICY_NUMBER_FAMILY: 'searchPolicyNumberFamily',
  POLICY_NUMBER_PERSON: 'policyNumberPerson',
  SEARCH_POLICY_NUMBER_PERSON: 'searchPolicyNumberPerson',
  POLICY_PROVIDER: 'insuranceProvider',
  POLICY_TYPE: 'policyType',
  IS_ACTIVE: 'isActive',
  DISCOUNT_RATE: 'discountRate',
};

const FORM_INPUT_CONFIGS = seedObject => ({
  [FORM_INPUT_KEYS.FIRST_NAME]: {
    type: 'text',
    initialValue: '',
    key: 'firstName',
    validator: input => input.length > 0,
    isRequired: true,
    label: formInputStrings.first_name,
    invalidMessage: formInputStrings.must_not_be_empty,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.SEARCH_FIRST_NAME]: {
    type: 'text',
    initialValue: '',
    key: 'firstName',
    validator: () => true,
    isRequired: false,
    label: formInputStrings.first_name,
    invalidMessage: '',
    isEditable: true,
  },
  [FORM_INPUT_KEYS.LAST_NAME]: {
    type: 'text',
    initialValue: '',
    key: 'lastName',
    validator: input => input.length > 0,
    isRequired: true,
    label: formInputStrings.last_name,
    invalidMessage: formInputStrings.must_not_be_empty,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.SEARCH_LAST_NAME]: {
    type: 'text',
    initialValue: '',
    key: 'lastName',
    validator: () => true,
    isRequired: false,
    label: formInputStrings.last_name,
    invalidMessage: '',
    isEditable: true,
  },
  [FORM_INPUT_KEYS.CODE]: {
    type: 'text',
    initialValue: '',
    key: 'code',
    validator: input => input.length > 0 && input.length < 20,
    isRequired: true,
    label: formInputStrings.code,
    invalidMessage: `${formInputStrings.must_not_be_empty} ${formInputStrings.and} ${formInputStrings.less_than_20_characters}`,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.DATE_OF_BIRTH]: {
    type: 'date',
    initialValue: new Date(),
    key: 'dateOfBirth',
    invalidMessage: formInputStrings.must_be_a_date,
    isRequired: true,
    validator: input => {
      const inputDate = moment(input, 'DD/MM/YYYY', null, true);
      const isValid = inputDate.isValid();
      const isDateOfBirth = inputDate.isSameOrBefore(new Date());
      return isValid && isDateOfBirth;
    },
    label: formInputStrings.date_of_birth,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.SEARCH_DATE_OF_BIRTH]: {
    type: 'date',
    initialValue: '',
    key: 'dateOfBirth',
    invalidMessage: formInputStrings.must_be_a_date,
    isRequired: false,
    validator: input => {
      if (input === '') return true;
      const inputDate = moment(input, 'DD/MM/YYYY', null, true);
      const isValid = inputDate.isValid();
      const isDateOfBirth = inputDate.isSameOrBefore(new Date());
      return isValid && isDateOfBirth;
    },
    label: formInputStrings.date_of_birth,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.GENDER]: {
    type: 'toggle',
    initialValue: false,
    key: 'female',
    options: [true, false],
    optionLabels: [formInputStrings.female, formInputStrings.male],
    label: formInputStrings.gender,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.EMAIL]: {
    type: 'text',
    initialValue: '',
    key: 'emailAddress',
    isRequired: false,
    label: formInputStrings.email,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.PHONE]: {
    type: 'text',
    initialValue: '',
    key: 'phoneNumber',
    isRequired: false,
    label: formInputStrings.phone,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.COUNTRY]: {
    type: 'text',
    initialValue: '',
    key: 'country',
    validator: input => input.length < 20,
    isRequired: false,
    invalidMessage: `${formInputStrings.must_be} ${formInputStrings.less_than_20_characters}`,
    label: formInputStrings.country,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.ADDRESS_ONE]: {
    type: 'text',
    initialValue: '',
    key: 'addressOne',
    validator: input => input.length < 50,
    isRequired: false,
    invalidMessage: `${formInputStrings.must_be} ${formInputStrings.less_than_50_characters}`,
    label: formInputStrings.address_one,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.ADDRESS_TWO]: {
    type: 'text',
    initialValue: '',
    key: 'addressTwo',
    validator: input => input.length < 50,
    isRequired: false,
    label: formInputStrings.address_two,
    invalidMessage: `${formInputStrings.must_be} ${formInputStrings.less_than_50_characters}`,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.REGISTRATION_CODE]: {
    type: 'text',
    initialValue: '',
    key: 'registrationCode',
    validator: input => input.length > 0 && input.length < 50,
    isRequired: true,
    label: formInputStrings.registration_code,
    invalidMessage: formInputStrings.must_be_between_0_and_50,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.SEARCH_REGISTRATION_CODE]: {
    type: 'text',
    initialValue: '',
    key: 'registrationCode',
    validator: () => true,
    isRequired: false,
    label: formInputStrings.registration_code,
    invalidMessage: '',
    isEditable: true,
  },
  [FORM_INPUT_KEYS.POLICY_NUMBER_PERSON]: {
    type: 'text',
    initialValue: '',
    key: 'policyNumberPerson',
    validator: null,
    isRequired: true,
    invalidMessage: formInputStrings.unique_policy,
    label: formInputStrings.personal_policy_number,
    isEditable: !seedObject,
  },
  [FORM_INPUT_KEYS.SEARCH_POLICY_NUMBER_PERSON]: {
    type: 'text',
    initialValue: '',
    key: 'policyNumberPerson',
    validator: null,
    isRequired: false,
    invalidMessage: '',
    label: formInputStrings.personal_policy_number,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.POLICY_NUMBER_FAMILY]: {
    type: 'text',
    initialValue: '',
    key: 'policyNumberFamily',
    validator: null,
    isRequired: true,
    invalidMessage: formInputStrings.unique_policy,
    label: formInputStrings.family_policy_number,
    isEditable: !seedObject,
  },
  [FORM_INPUT_KEYS.SEARCH_POLICY_NUMBER_FAMILY]: {
    type: 'text',
    initialValue: '',
    key: 'policyNumberFamily',
    validator: null,
    isRequired: false,
    invalidMessage: '',
    label: formInputStrings.family_policy_number,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.POLICY_PROVIDER]: {
    type: 'dropdown',
    initialValue: UIDatabase.objects('InsuranceProvider')[0],
    key: 'insuranceProvider',
    label: formInputStrings.policy_provider,
    options: UIDatabase.objects('InsuranceProvider'),
    optionKey: 'name',
    isEditable: !seedObject,
  },
  [FORM_INPUT_KEYS.IS_ACTIVE]: {
    type: 'toggle',
    initialValue: true,
    key: 'isActive',
    options: [true, false],
    optionLabels: [formInputStrings.yes, formInputStrings.no],
    label: formInputStrings.is_active,
    isEditable: true,
  },
  [FORM_INPUT_KEYS.POLICY_TYPE]: {
    type: 'toggle',
    initialValue: 'personal',
    key: 'type',
    options: ['personal', 'business'],
    optionLabels: [formInputStrings.personal, formInputStrings.business],
    label: formInputStrings.policy_type,
    isEditable: !seedObject,
  },
  [FORM_INPUT_KEYS.DISCOUNT_RATE]: {
    type: 'slider',
    initialValue: 25,
    key: 'discountRate',
    maximumValue: 100,
    minimumValue: 0,
    step: 0.1,
    label: formInputStrings.discount_rate,
    isEditable: true,
  },
});

const FORM_CONFIGS = {
  patient: [
    FORM_INPUT_KEYS.FIRST_NAME,
    FORM_INPUT_KEYS.LAST_NAME,
    FORM_INPUT_KEYS.DATE_OF_BIRTH,
    FORM_INPUT_KEYS.EMAIL,
    FORM_INPUT_KEYS.PHONE,
    FORM_INPUT_KEYS.ADDRESS_ONE,
    FORM_INPUT_KEYS.ADDRESS_TWO,
    FORM_INPUT_KEYS.COUNTRY,
    FORM_INPUT_KEYS.GENDER,
  ],
  prescriber: [
    FORM_INPUT_KEYS.FIRST_NAME,
    FORM_INPUT_KEYS.LAST_NAME,
    FORM_INPUT_KEYS.REGISTRATION_CODE,
    FORM_INPUT_KEYS.EMAIL,
    FORM_INPUT_KEYS.PHONE,
    FORM_INPUT_KEYS.ADDRESS_ONE,
    FORM_INPUT_KEYS.ADDRESS_TWO,
    FORM_INPUT_KEYS.GENDER,
  ],
  insurancePolicy: [
    FORM_INPUT_KEYS.POLICY_NUMBER_PERSON,
    FORM_INPUT_KEYS.POLICY_NUMBER_FAMILY,
    FORM_INPUT_KEYS.DISCOUNT_RATE,
    FORM_INPUT_KEYS.POLICY_PROVIDER,
    FORM_INPUT_KEYS.IS_ACTIVE,
    FORM_INPUT_KEYS.POLICY_TYPE,
  ],
  searchPatient: [
    FORM_INPUT_KEYS.SEARCH_FIRST_NAME,
    FORM_INPUT_KEYS.SEARCH_LAST_NAME,
    FORM_INPUT_KEYS.SEARCH_DATE_OF_BIRTH,
    FORM_INPUT_KEYS.SEARCH_POLICY_NUMBER_PERSON,
    FORM_INPUT_KEYS.SEARCH_POLICY_NUMBER_FAMILY,
  ],
  searchPrescriber: [
    FORM_INPUT_KEYS.SEARCH_FIRST_NAME,
    FORM_INPUT_KEYS.SEARCH_LAST_NAME,
    FORM_INPUT_KEYS.SEARCH_REGISTRATION_CODE,
  ],
};

export const getFormInputConfig = (formName, seedObject) => {
  const formInputConfigs = FORM_INPUT_CONFIGS(seedObject);
  const formConfig = FORM_CONFIGS[formName].map(config => formInputConfigs[config]);

  if (!seedObject) return formConfig;

  return formConfig.map(({ key, initialValue, ...restOfConfig }) => ({
    ...restOfConfig,
    key,
    initialValue: seedObject[key] ?? initialValue,
  }));
};
