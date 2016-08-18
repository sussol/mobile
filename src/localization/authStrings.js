/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// import { CURRENT_LANGUAGE } from '../settings';
const CURRENT_LANGUAGE = 'tetum'; // settings not set up for this yet

const strings = {
  en: {
    logging_in: 'Logging in...',
    login: 'Login',
    password: 'Password',
    user_name: 'User Name',
  },
  tetum: {
    logging_in: 'Logging in... (t)',
    login: 'Login (t)',
    password: 'Password (t)',
    user_name: 'User Name (t)',
  },
};

export const authStrings = strings[CURRENT_LANGUAGE];
