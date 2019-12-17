/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

const patientsInitialState = () => ({
  currentPatient: null,
  firstNameIsValid: true,
  lastNameIsValid: true,
  codeIsValid: true,
  dateOfBirthIsValid: true,
  phoneIsValid: true,
  countryIsValid: true,
  firstName: '',
  lastName: '',
  code: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  addressOne: '',
  addressTwo: '',
  country: '',
});

export const PatientReducer = (state = patientsInitialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'fieldValidity': {
      const { payload } = action;
      const { field, validity } = payload;

      const fieldLookup = {
        address1: 'addressOneIsValid',
        address2: 'addressTwoIsValid',
        firstName: 'firstNameIsValid',
        lastName: 'lastNameIsValid',
        code: 'codeIsValid',
        dateOfBirth: 'dateOfBirthIsValid',
        phone: 'phoneIsValid',
        country: 'countryIsValid',
      };

      return { ...state, [fieldLookup[field]]: validity };
    }

    default: {
      return state;
    }
  }
};
