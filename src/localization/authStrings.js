/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// import { CURRENT_LANGUAGE } from '../settings';
const CURRENT_LANGUAGE = 'tetum'; // settings not set up for this yet

const strings = {
  en: {
    login: 'Login',
    logging_in: 'Logging in...',
    user_name: 'User Name',
    password: 'Password',
  },
  tetum: {
    login: 'Login (t)',
    logging_in: 'Logging in... (t)',
    user_name: 'User Name (t)',
    password: 'Password (t)',
  },
};

export const authStrings = strings[CURRENT_LANGUAGE];
