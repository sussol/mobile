/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// import { CURRENT_LANGUAGE } from '../settings';
const CURRENT_LANGUAGE = 'tetum'; // settings not set up for this yet

const strings = {
  en: {
    login: 'Login (en)',
    logging_in: 'Logging in... (en)',
    user_name: 'User Name (en)',
    password: 'Password (en)',
  },
  tetum: {
    login: 'Login (t)',
    logging_in: 'Logging in... (t)',
    user_name: 'User Name (t)',
    password: 'Password (t)',
  },
};

export const authStrings = strings[CURRENT_LANGUAGE];
