/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

const FORM_INPUT_KEYS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  CODE: 'code',
  DATE_OF_BIRTH: 'dateOfBirth',
  EMAIL: 'emailAddress',
  PHONE: 'phoneNumber',
  COUNTRY: 'country',
  ADDRESS_ONE: 'addressOne',
  ADDRESS_TWO: 'addressTwo',
};

const FORM_INPUT_CONFIGS = {
  [FORM_INPUT_KEYS.FIRST_NAME]: {
    type: 'text',
    initialValue: '',
    key: 'firstName',
    isRequired: true,
    label: 'First name:',
    invalidMessage: 'need to be x',
  },
  [FORM_INPUT_KEYS.LAST_NAME]: {
    type: 'text',
    initialValue: '',
    key: 'lastName',
    isRequired: true,
    label: 'Last name:',
  },
  [FORM_INPUT_KEYS.CODE]: {
    type: 'text',
    initialValue: '',
    key: 'code',
    validator: input => input.length < 20,
    isRequired: true,
    label: 'Code:',
  },
  [FORM_INPUT_KEYS.DATE_OF_BIRTH]: {
    type: 'text',
    initialValue: '',
    key: 'dateOfBirth',
    invalidMessage: 'Must be a valid date',
    validator: input => {
      // Ensure the entered value is castable to a date and is less than
      // the current date.
      const dateTime = new Date(input).getTime();
      const dateTimeNow = new Date().getTime();
      if (!input) return true;

      const inputIsAValidDate = !Number.isNaN(dateTime);
      const inputIsLessThanNow = dateTime < dateTimeNow;
      const inputHasAForwardSlash = input.includes('/');

      return inputIsAValidDate && inputIsLessThanNow && inputHasAForwardSlash;
    },
    label: 'Date of birth:',
  },
  [FORM_INPUT_KEYS.EMAIL]: {
    type: 'text',
    initialValue: '',
    key: 'emailAddress',
    isRequired: false,
    label: 'Email:',
  },
  [FORM_INPUT_KEYS.PHONE]: {
    type: 'text',
    initialValue: '',
    key: 'phoneNumber',
    isRequired: false,
    label: 'Phone:',
  },
  [FORM_INPUT_KEYS.COUNTRY]: {
    type: 'text',
    initialValue: '',
    key: 'country',
    validator: input => input.length < 20,
    isRequired: false,
    label: 'Country:',
  },
  [FORM_INPUT_KEYS.ADDRESS_ONE]: {
    type: 'text',
    initialValue: '',
    key: 'addressOne',
    validator: input => input.length < 50,
    isRequired: false,
    label: 'Address 1:',
  },
  [FORM_INPUT_KEYS.ADDRESS_TWO]: {
    type: 'text',
    initialValue: '',
    key: 'addressTwo',
    validator: input => input.length < 50,
    isRequired: false,
    label: 'Address 2:',
  },
};

const FORM_CONFIGS = {
  patient: [
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.FIRST_NAME],
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.LAST_NAME],
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.CODE],
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.DATE_OF_BIRTH],
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.EMAIL],
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.PHONE],
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.ADDRESS_ONE],
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.ADDRESS_TWO],
    FORM_INPUT_CONFIGS[FORM_INPUT_KEYS.COUNTRY],
  ],
};

export const getFormInputConfig = (formName, seedObject) => {
  const formConfig = FORM_CONFIGS[formName];

  if (!seedObject) return formConfig;

  return formConfig.map(({ key, ...restOfConfig }) => ({
    ...restOfConfig,
    key,
    initialValue: seedObject[key] || '',
  }));
};
