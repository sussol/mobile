/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import LocalizedStrings from 'react-native-localization';

export const validationStrings = new LocalizedStrings({
  gb: {
    general: {},
    username: {
      required: 'Enter the username',
    },
    email: {
      required: 'Enter the E-mail',
      valid: 'Enter a valid E-mail',
    },
    password: {
      required: 'Enter the password',
      matchRepeat: 'Password & repeat password must match',
      lengthInvalid: 'Password must be 8-32 characters long',
      containsSpaces: 'Password cannot contain spaces.',
    },
    repeatPassword: {
      required: 'Enter the repeat password',
    },
    is_required: 'is required',
  },
  fr: {},
  gil: {},
  tl: {},
});

export default validationStrings;
